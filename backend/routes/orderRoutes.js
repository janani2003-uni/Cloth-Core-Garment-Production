const express = require("express");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const router = express.Router();
const Order = require("../models/Order");
const Production = require("../models/Production");
const Shop = require("../models/Shop");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const SystemSettings = require("../models/SystemSettings");
const GarmentSizeStock = require("../models/GarmentSizeStock");
const Delivery = require("../models/Delivery");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getMinimumOrderQuantity, getAdvancePaymentPercentage } = require("../config/businessRules");

function round2(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

// Single, backend-authoritative definition of "has this Shop Owner filled
// in enough of their profile to place an order" — mirrors
// isShopProfileComplete() in shopRoutes.js (and the Shop model's own
// required: true fields). Order placement no longer depends in any way on
// Admin having approved the shop profile — only on the profile itself being
// complete. Duplicated here (rather than imported) to avoid a circular
// require between the two route files; both read the exact same three
// fields, so they can never drift.
function isShopProfileComplete(shop) {
  return Boolean(
    shop &&
    shop.shopName?.trim() &&
    shop.shopAddress?.trim() &&
    shop.phone?.trim()
  );
}

// Shared by order submission (soft check) and the Admin/Supervisor approve
// action (hard, authoritative check) — the backend is the only source of
// truth for whether stock is actually sufficient, never the frontend's
// cached numbers from when the shop owner was on Step 3.
async function verifyStockForOrder(garmentType, sizeBreakdown) {
  const entries = sizeBreakdown instanceof Map
    ? Array.from(sizeBreakdown.entries())
    : Object.entries(sizeBreakdown || {});

  const relevantEntries = entries.filter(([, qty]) => Number(qty) > 0);

  if (!garmentType || relevantEntries.length === 0) {
    return { status: "", sufficient: true, details: [] };
  }

  const stockDocs = await GarmentSizeStock.find({ garmentType });
  const stockBySize = new Map(stockDocs.map((doc) => [doc.size.toUpperCase(), doc.availableQuantity]));

  const details = relevantEntries.map(([size, requested]) => {
    const available = stockBySize.get(String(size).toUpperCase()) ?? 0;
    return {
      size,
      requested: Number(requested),
      available,
      sufficient: Number(requested) <= available,
    };
  });

  const sufficient = details.every((d) => d.sufficient);

  return { status: sufficient ? "sufficient" : "insufficient", sufficient, details };
}

// verifyStockForOrder() above only ever *checks* sufficiency — it never
// actually reserved anything against GarmentSizeStock, so two orders for
// the same size could each individually "pass" the check against the same
// on-paper availableQuantity and both get approved, silently double-booking
// real stock. These two helpers are the other half: called the moment an
// order is actually approved (reserveStockForOrder) and reversed if that
// approved order is later cancelled or deleted (releaseStockForOrder), so
// availableQuantity always reflects what's truly still free to promise to
// the next order.
async function reserveStockForOrder(garmentType, sizeBreakdown) {
  const entries = sizeBreakdown instanceof Map
    ? Array.from(sizeBreakdown.entries())
    : Object.entries(sizeBreakdown || {});
  const relevantEntries = entries.filter(([, qty]) => Number(qty) > 0);
  if (!garmentType || relevantEntries.length === 0) return;

  await Promise.all(
    relevantEntries.map(([size, qty]) =>
      GarmentSizeStock.updateOne(
        { garmentType, size: String(size).toUpperCase() },
        { $inc: { availableQuantity: -Number(qty), reservedQuantity: Number(qty) } }
      )
    )
  );
}

async function releaseStockForOrder(garmentType, sizeBreakdown) {
  const entries = sizeBreakdown instanceof Map
    ? Array.from(sizeBreakdown.entries())
    : Object.entries(sizeBreakdown || {});
  const relevantEntries = entries.filter(([, qty]) => Number(qty) > 0);
  if (!garmentType || relevantEntries.length === 0) return;

  await Promise.all(
    relevantEntries.map(([size, qty]) =>
      GarmentSizeStock.updateOne(
        { garmentType, size: String(size).toUpperCase() },
        { $inc: { availableQuantity: Number(qty), reservedQuantity: -Number(qty) } }
      )
    )
  );
}

// Generates readable, human-facing IDs like "ORD-2026-001" instead of a raw
// timestamp. The prefix ("ORD") is configurable via Admin > Settings; falls
// back to "ORD" if no SystemSettings document exists yet.
//
// Deliberately based on the HIGHEST existing number, not a document count —
// countDocuments() silently breaks the moment there's any gap in the
// sequence (an order gets deleted anywhere — a cancelled/rejected order,
// admin cleanup, anything), because count() then returns fewer than the
// real highest number in use. E.g. 9 documents on disk but the highest is
// -010 (one earlier one was deleted) → count-based logic recomputes -010
// forever, colliding with the real -010 every single time (never
// increasing, since a failed save never changes the count) — a permanent,
// deterministic "Order ID already exists" wall, not just a rare race.
// Finding the actual max in use is immune to gaps. The POST /orders route's
// retry-on-collision loop still exists on top of this for genuine
// concurrent-submission races (two requests computing the same next number
// before either has saved), which this alone doesn't solve.
async function generateOrderId() {
  const settings = await SystemSettings.findOne();
  const prefixWord = settings?.orderIdPrefix || "ORD";

  const year = new Date().getFullYear();
  const prefix = `${prefixWord}-${year}-`;

  // Sorting the orderId string only matches numeric order while every
  // number has the same digit width (true for -001.. -999, but breaks the
  // moment the count ever reaches 1000, since "1000" < "999" lexically) —
  // pulling every matching id and taking the numeric max in JS is immune
  // to that instead of relying on the padding never changing.
  const existingIds = await Order.find({ orderId: { $regex: `^${prefix}\\d+$` } })
    .select("orderId")
    .lean();

  let nextNumber = 1;
  for (const { orderId: id } of existingIds) {
    const match = id.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    if (num >= nextNumber) nextNumber = num + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

// Orders are used by both Admin and Shop Owner accounts, so we only
// require a logged-in user here, not a specific role.
router.use(verifyToken);

// ==========================
// Get all orders
// ==========================
router.get("/", async (req, res) => {
  try {
    // Shop Owners only ever see their own orders. Admin/Supervisor
    // monitor production across every shop, so they see everything —
    // Supervisor access here is still read-only in practice since
    // this router's write routes (PUT/DELETE) stay Admin-only below.
    const filter = ["admin", "supervisor"].includes(req.user.role)
      ? {}
      : { userId: req.user.id };

    const orders = await Order.find(filter).sort({
      createdAt: -1,
    }).lean();

    // order.paymentStatus/amountPaid only ever change once Admin actually
    // verifies a submitted payment (see paymentRoutes.js) — so a shop
    // owner who just submitted an advance payment saw nothing at all
    // change anywhere (Dashboard, My Recent Orders) until Admin acted,
    // even though their submission genuinely went through and is sitting
    // in the verification queue. Attaching each order's own
    // still-Submitted (unverified) payment total here lets every screen
    // that lists orders show "Payment Submitted — Verifying" instead of a
    // frozen "Payment Pending" that looks like nothing happened.
    const orderIds = orders.map((o) => o._id);
    const submittedAgg = orderIds.length
      ? await Payment.aggregate([
          { $match: { orderId: { $in: orderIds }, status: "Submitted" } },
          { $group: { _id: "$orderId", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
        ])
      : [];
    const submittedByOrder = {};
    submittedAgg.forEach((p) => {
      submittedByOrder[String(p._id)] = { amount: p.amount, count: p.count };
    });

    const enriched = orders.map((o) => ({
      ...o,
      pendingVerification: submittedByOrder[String(o._id)] || null,
    }));

    return res.status(200).json(enriched);
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Get order statistics
// ==========================
router.get("/stats", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const pending = await Order.countDocuments({ status: "Pending" });
    const approved = await Order.countDocuments({ status: "Approved" });
    const inProduction = await Order.countDocuments({ status: "Production" });
    const inDelivery = await Order.countDocuments({ status: "In Delivery" });
    const delivered = await Order.countDocuments({ status: "Delivered" });
    const cancelled = await Order.countDocuments({ status: "Cancelled" });

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "Full Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json({ success: true,
      totalOrders,
      pending,
      approved,
      inProduction,
      inDelivery,
      delivered,
      cancelled,
      totalRevenue,
    });
  } catch (error) {
    console.error("Get Order Stats Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Order approval queue — Admin/Supervisor only. Declared before GET /:id
// so "/approvals" isn't swallowed by the :id param route.
// ==========================
router.get("/approvals", requireRole("admin", "supervisor"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter["approval.status"] = status;
    } else {
      // Default view: only orders actually in this workflow — excludes the
      // "Not Required" bulk of legacy/admin-created orders that would
      // otherwise flood the queue.
      filter["approval.status"] = { $in: ["Pending", "Approved", "Rejected"] };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get Order Approvals Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Get one order
// ==========================
router.get("/:id", async (req, res) => {
  try {
    let order;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({
        orderId: req.params.id,
      });
    }

    if (!order) {
      return res.status(404).json({ success: false,
        message: "Order not found",
      });
    }

    const canViewAnyOrder = ["admin", "supervisor"].includes(req.user.role);

    if (
      !canViewAnyOrder &&
      (!order.userId || String(order.userId) !== String(req.user.id))
    ) {
      return res.status(403).json({ success: false,
        message: "You do not have access to this order",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Get invoice data for an order — Admin prints invoices from AdminOrders.js;
// a Shop Owner may also view their own order's invoice (e.g. to see the
// remaining balance before submitting a payment).
// ==========================
router.get("/:id/invoice", async (req, res) => {
  try {
    let order;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const canViewAnyOrder = ["admin", "supervisor"].includes(req.user.role);
    if (!canViewAnyOrder && (!order.userId || String(order.userId) !== String(req.user.id))) {
      return res.status(403).json({ success: false, message: "You do not have access to this order" });
    }

    // amountPaid is derived fresh from every Verified payment on this order
    // — this is the one authoritative place that adds them up; order.amountPaid
    // is kept in sync with this same number by paymentRoutes.js's verify
    // route purely so pages that list many orders at once (Dashboard,
    // AdminOrders) don't need an extra query per order, but this endpoint
    // always recomputes live.
    const verifiedPayments = await Payment.find({ orderId: order._id, status: "Verified" });
    const amountPaid = round2(verifiedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0));
    const balanceDue = Math.max(0, round2(Number(order.totalAmount || 0) - amountPaid));

    const advanceAmount = Number(order.advanceAmount || 0);
    const production = await Production.findOne({ orderId: order.orderId });
    // Informational only — production status is no longer a gate on paying
    // the Final 50%. A shop owner may pay the remaining balance whenever
    // they want, whether or not production has started/finished.
    const productionCompleted = production ? (production.status === "Completed" || production.stage === "Completed") : false;

    // The minimum the shop owner must pay right now, and which of the two
    // 50/50 stages that is — the Make Payment modal (Payments.js) and
    // Step 7 use this as the default/floor for an editable amount field,
    // letting the shop owner pay more than the minimum (up to the full
    // remaining balance) in one go if they choose to.
    let nextStage = null;
    let amountToPay = 0;
    if (amountPaid < advanceAmount) {
      nextStage = "Advance";
      amountToPay = round2(advanceAmount - amountPaid);
    } else if (balanceDue > 0) {
      nextStage = "Final";
      amountToPay = balanceDue;
    }

    return res.status(200).json({ success: true,
      invoiceNumber: `INV-${order.orderId}`,
      generatedAt: new Date(),
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        item: order.item,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      },
      amountPaid,
      balanceDue,
      advanceAmount,
      nextStage,
      amountToPay,
      productionCompleted,
    });
  } catch (error) {
    console.error("Get Invoice Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Full order details — Admin/Supervisor only. One consolidated call for the
// "View Details" modal on Admin Orders / Order Approvals: order + shop +
// every payment + live production/delivery status, all from real saved
// data. Reused by both AdminOrders.js's View Details action and (via the
// same shop/payment/production/delivery joins) anywhere else a complete
// order snapshot is needed, so there's one definition of "the full order
// picture" instead of several pages assembling it differently.
// ==========================
router.get("/:id/full-details", requireRole("admin", "supervisor"), async (req, res) => {
  try {
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const shop = order.userId ? await Shop.findOne({ ownerId: order.userId }) : null;
    const payments = await Payment.find({ orderId: order._id }).sort({ createdAt: -1 });
    const production = await Production.findOne({ orderId: order.orderId });
    const delivery = await Delivery.findOne({ orderId: order._id });

    const amountPaid = round2(
      payments.filter((p) => p.status === "Verified").reduce((sum, p) => sum + Number(p.amount || 0), 0)
    );
    const balanceDue = Math.max(0, round2(Number(order.totalAmount || 0) - amountPaid));

    return res.status(200).json({
      success: true,
      data: {
        order,
        shop: shop
          ? {
              shopName: shop.shopName,
              shopCode: shop.shopCode,
              phone: shop.phone,
              email: shop.email,
              shopAddress: shop.shopAddress,
              logoPath: shop.logoPath || "",
              garmentCategories: shop.garmentCategories || "",
            }
          : null,
        payments,
        amountPaid,
        balanceDue,
        production: production
          ? { stage: production.stage, progress: production.progress, status: production.status }
          : null,
        delivery: delivery
          ? { status: delivery.status, scheduledDate: delivery.scheduledDate, deliveryStaffName: delivery.deliveryStaffName }
          : null,
      },
    });
  } catch (error) {
    console.error("Get Full Order Details Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// PDF receipt — generated on the fly from real, currently-saved order/
// shop/payment data (never from temporary React state), so it stays
// available after a page refresh or a later visit by loading straight from
// this endpoint via orderId. A Shop Owner may only download their own
// order's receipt; Admin/Supervisor may download any.
// ==========================
router.get("/:id/receipt.pdf", async (req, res) => {
  try {
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const canViewAnyOrder = ["admin", "supervisor"].includes(req.user.role);
    if (!canViewAnyOrder && (!order.userId || String(order.userId) !== String(req.user.id))) {
      return res.status(403).json({ success: false, message: "You do not have access to this order" });
    }

    const shop = order.userId ? await Shop.findOne({ ownerId: order.userId }) : null;
    const verifiedPayments = await Payment.find({ orderId: order._id, status: "Verified" }).sort({ createdAt: 1 });
    const amountPaid = round2(verifiedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0));
    const pendingBalance = Math.max(0, round2(Number(order.totalAmount || 0) - amountPaid));
    const lastPayment = verifiedPayments[verifiedPayments.length - 1];

    const itemMatch = /^(.*?)\s*\((.*?),\s*(.*?)\)\s*$/.exec(order.item || "");
    const garment = order.garmentType || itemMatch?.[1] || order.item || "—";
    const fabric = itemMatch?.[2] || "—";
    const color = itemMatch?.[3] || "—";

    const designType =
      order.design?.designSource === "uploaded_logo" || order.design?.type === "upload"
        ? "Uploaded Logo"
        : order.design?.designSource === "ai_generated" || order.design?.type === "ai"
        ? "AI Generated"
        : "No design on file";

    const sizeEntries = order.sizeBreakdown instanceof Map
      ? Array.from(order.sizeBreakdown.entries())
      : Object.entries(order.sizeBreakdown?.toJSON ? order.sizeBreakdown.toJSON() : order.sizeBreakdown || {});

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ClothCore-Receipt-${order.orderId}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Branding header
    doc.fontSize(22).fillColor("#522B5B").font("Helvetica-Bold").text("ClothCore");
    doc.fontSize(9).fillColor("#854F6C").font("Helvetica").text("Garment Production & Order Management");
    doc.moveDown(1);
    doc.fontSize(15).fillColor("#190019").font("Helvetica-Bold").text("Order Receipt");
    doc.moveDown(0.3);
    doc.strokeColor("#DFB6B2").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    const row = (label, value) => {
      const y = doc.y;
      doc.fontSize(10).fillColor("#854F6C").font("Helvetica").text(label, 50, y, { width: 180 });
      doc.fontSize(10).fillColor("#190019").font("Helvetica-Bold").text(String(value ?? "—"), 240, y, { width: 305 });
      doc.moveDown(0.5);
    };

    const sectionHeading = (text) => {
      doc.moveDown(0.4);
      doc.fontSize(11).fillColor("#522B5B").font("Helvetica-Bold").text(text);
      doc.strokeColor("#DFB6B2").lineWidth(0.5).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
      doc.moveDown(0.5);
    };

    sectionHeading("Order Information");
    row("Order ID", order.orderId);
    row("Shop Owner", order.customerName);
    row("Shop Name", shop?.shopName || "—");
    row("Order Date", order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
    row("Confirmation Date", order.approval?.approvedAt ? new Date(order.approval.approvedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
    row("Current Order Status", order.status);
    row("Approval Status", order.approval?.status || "Not Required");

    sectionHeading("Garment Details");
    row("Garment", garment);
    row("Fabric", fabric);
    row("Color", color);
    row("Design Type", designType);
    row("Total Quantity", `${order.quantity} pcs`);
    if (sizeEntries.length > 0) {
      row("Size Breakdown", sizeEntries.map(([size, qty]) => `${size}: ${qty}`).join("   "));
    }
    row("Unit Price", `Rs. ${Number(order.unitPrice).toFixed(2)}`);

    sectionHeading("Payment Summary");
    row("Total Order Amount", `Rs. ${Number(order.totalAmount).toFixed(2)}`);
    row("Advance Required (50%)", `Rs. ${Number(order.advanceAmount || 0).toFixed(2)}`);
    row("Amount Paid", `Rs. ${amountPaid.toFixed(2)}`);
    row("Pending Balance", `Rs. ${pendingBalance.toFixed(2)}`);
    row("Payment Method", lastPayment?.paymentMethod || "Not yet paid");
    row("Payment Status", order.paymentStatus);

    sectionHeading("Delivery");
    row("Delivery Method", order.deliveryMethod || "Factory Delivery");
    row("Delivery Timing", "Delivered within 20–24 days");
    row("Requested Delivery Date", order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not set");

    doc.moveDown(1.5);
    doc.fontSize(8).fillColor("#854F6C").font("Helvetica").text(
      `Generated on ${new Date().toLocaleString("en-GB")} · ClothCore Garment Production System`,
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    console.error("Generate Receipt PDF Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.end();
  }
});

// ==========================
// Approval detail view — Admin/Supervisor only. Includes a live stock
// comparison (requested vs currently available per size), recomputed fresh
// on every load rather than trusting whatever was stored at submission
// time, since stock can move between submission and review.
// ==========================
router.get("/:id/approval-details", requireRole("admin", "supervisor"), async (req, res) => {
  try {
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const shop = order.userId ? await Shop.findOne({ ownerId: order.userId }) : null;
    const stockComparison = await verifyStockForOrder(order.garmentType, order.sizeBreakdown);

    return res.status(200).json({
      success: true,
      data: {
        order,
        shop: shop
          ? {
              shopName: shop.shopName,
              shopCode: shop.shopCode,
              phone: shop.phone,
              city: shop.city,
              shopAddress: shop.shopAddress,
            }
          : null,
        stockComparison,
      },
    });
  } catch (error) {
    console.error("Get Approval Details Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Lightweight polling endpoint for the shop owner's Admin Approval page.
// ==========================
router.get("/:id/approval-status", async (req, res) => {
  try {
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id).select("orderId userId approval");
    } else {
      order = await Order.findOne({ orderId: req.params.id }).select("orderId userId approval");
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const canView = ["admin", "supervisor"].includes(req.user.role) ||
      (order.userId && String(order.userId) === String(req.user.id));

    if (!canView) {
      return res.status(403).json({ success: false, message: "You do not have access to this order" });
    }

    return res.status(200).json({ success: true, data: { orderId: order.orderId, approval: order.approval } });
  } catch (error) {
    console.error("Get Approval Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Create order
// ==========================
router.post("/", async (req, res) => {
  try {
    const {
      orderId,
      userId,
      customerName,
      customerEmail,
      item,
      quantity,
      unitPrice,
      status,
      progress,
      deliveryDate,
      deliveryAddress,
      deliveryMethod,
      paymentStatus,
      notes,
      design,
      garmentType,
      sizeBreakdown,
    } = req.body;

    // Only Factory Delivery is a real option now — whatever the client sent
    // (or didn't) is irrelevant, since there is no other delivery method
    // left to choose from.
    const sanitizedDeliveryMethod = "Factory Delivery";
    void deliveryMethod; // acknowledged, intentionally not read

    // Only ever persist a lightweight design reference — never trust raw
    // file bytes into this broadly-queried collection. Uploaded logos and
    // payment proofs are real disk-backed files by this point (see
    // backend/middleware/upload.js) — the client only ever sends back the
    // relative web path it already got from the upload endpoint, e.g.
    // "/uploads/designs/xxx.png", not the file itself.
    let sanitizedDesign;
    if (design && (design.designSource === "ai_generated" || design.designSource === "uploaded_logo")) {
      const shared = {
        previewGarment: typeof design.previewGarment === "string" ? design.previewGarment.slice(0, 100) : "",
        previewColor: typeof design.previewColor === "string" ? design.previewColor.slice(0, 100) : "",
        previewColorHex: typeof design.previewColorHex === "string" ? design.previewColorHex.slice(0, 20) : "",
      };
      if (design.designSource === "ai_generated") {
        sanitizedDesign = {
          type: "ai",
          designSource: "ai_generated",
          prompt: typeof design.prompt === "string" ? design.prompt.slice(0, 500) : "",
          generatedDesignPath: typeof design.generatedDesignPath === "string" ? design.generatedDesignPath.slice(0, 2_000_000) : "",
          ...shared,
        };
      } else {
        sanitizedDesign = {
          type: "upload",
          designSource: "uploaded_logo",
          uploadedLogoPath: typeof design.uploadedLogoPath === "string" ? design.uploadedLogoPath.slice(0, 300) : "",
          uploadedLogoSource: ["shop_logo", "order_upload"].includes(design.uploadedLogoSource) ? design.uploadedLogoSource : "order_upload",
          fileName: typeof design.fileName === "string" ? design.fileName.slice(0, 255) : "",
          ...shared,
        };
      }
    }

    if (
      !customerName ||
      !customerEmail ||
      !item ||
      quantity === undefined ||
      unitPrice === undefined
    ) {
      return res.status(400).json({ success: false,
        message: "Please fill in all required order fields",
      });
    }

    // Minimum order quantity is a configurable business rule (see
    // backend/config/businessRules.js) — Admin bypasses it the same way it
    // bypasses the shop-approval check below, for manual/test data entry.
    if (req.user.role !== "admin" && Number(quantity) < getMinimumOrderQuantity()) {
      return res.status(400).json({ success: false,
        message: `Minimum order quantity is ${getMinimumOrderQuantity()} pcs`,
      });
    }

    // Production needs lead time — the frontend's Order Delivery step
    // already blocks picking a date sooner than this, but that's advisory
    // only; this is the actual enforcement. Same Admin bypass as the other
    // placement rules above, for manual/test data entry.
    const MINIMUM_DELIVERY_LEAD_DAYS = 20;
    if (req.user.role !== "admin" && deliveryDate) {
      const minDeliveryDate = new Date();
      minDeliveryDate.setHours(0, 0, 0, 0);
      minDeliveryDate.setDate(minDeliveryDate.getDate() + MINIMUM_DELIVERY_LEAD_DAYS);

      if (new Date(deliveryDate) < minDeliveryDate) {
        return res.status(400).json({ success: false,
          message: `Delivery date must be at least ${MINIMUM_DELIVERY_LEAD_DAYS} days from today.`,
        });
      }
    }

    // Eligibility to place an order is now ONLY: role === "shopOwner" (i.e.
    // not admin, checked above) AND the Shop Profile's required fields are
    // complete — there is no Admin shop-profile-approval gate anymore. This
    // mirrors ShopProfileGuard.js's own frontend check (GET
    // /api/shops/profile-status) so a request can never bypass what the
    // frontend already enforced; this is the real, authoritative check.
    // Admins bypass this entirely (e.g. creating orders directly for
    // testing/demo purposes without needing their own Shop record).
    if (req.user.role !== "admin") {
      const shop = await Shop.findOne({ ownerId: req.user.id });

      if (!isShopProfileComplete(shop)) {
        return res.status(403).json({ success: false,
          message: "Please complete your Shop Profile before placing an order.",
        });
      }

      // Suspension is a separate, ongoing Admin control (Shop Directory —
      // formerly "Shop Approvals") — unrelated to profile-completeness, and
      // still enforced.
      if (!shop.isActive) {
        return res.status(403).json({ success: false,
          message: "Your shop account is currently suspended. Contact an administrator for assistance.",
        });
      }
    }

    // Backend stock validation at submission time — the frontend already
    // blocks this at Step 3, but stock can move between then and now, and
    // the frontend's numbers are never trusted on their own.
    if (garmentType && sizeBreakdown) {
      const stockCheck = await verifyStockForOrder(garmentType, sizeBreakdown);
      if (!stockCheck.sufficient) {
        const affected = stockCheck.details.filter((d) => !d.sufficient)
          .map((d) => `${d.size} (requested ${d.requested}, only ${d.available} available)`)
          .join(", ");
        return res.status(400).json({ success: false,
          message: `Stock is no longer sufficient for: ${affected}. Please adjust your quantities.`,
          stockCheck,
        });
      }
    }

    // An orderId explicitly supplied by the caller is trusted as-is (and
    // still checked for a live conflict below) — but an auto-generated one
    // is only ever a *starting point*. generateOrderId() counts existing
    // orders to pick the next number, which is not atomic: two submissions
    // close together (a fast double-click, or two shop owners placing an
    // order in the same second) can both compute the exact same "next"
    // number before either has actually saved. Whichever saves first wins
    // it; the other must never just fail outright — it regenerates a fresh
    // id and retries, same as if it had counted correctly the first time.
    const explicitOrderId = orderId?.trim() || "";
    if (explicitOrderId) {
      const existingOrder = await Order.findOne({ orderId: explicitOrderId });
      if (existingOrder) {
        return res.status(400).json({ success: false,
          message: "Order ID already exists",
        });
      }
    }

    const totalAmount =
      Number(quantity) * Number(unitPrice);

    // The mandatory 50/50 split — always computed here from the real,
    // backend-validated totalAmount, never trusted from the client. Both
    // Step 4/7's display and every later payment-amount check (see
    // paymentRoutes.js) read these two saved fields rather than
    // recalculating a percentage on the fly, so the numbers a shop owner
    // saw before submitting are exactly what gets enforced afterward.
    const advancePercent = getAdvancePaymentPercentage();
    const advanceAmount = round2(totalAmount * (advancePercent / 100));
    const remainingBalance = round2(totalAmount - advanceAmount);

    // This endpoint is only ever called from the shop-owner order wizard
    // (OrderApproval.js) — there is no separate admin "quick add order"
    // feature that reuses it — so every order created here always needs
    // review, regardless of the creator's role. (Admin still bypasses the
    // shop-approval and minimum-quantity checks above, purely so an Admin
    // account can walk through the wizard for testing without needing its
    // own Shop record — that's a distinct concern from whether the
    // resulting order needs approval.)
    const approvalStatus = "Pending";

    // See the comment above: an auto-generated orderId is retried with a
    // freshly-recomputed id on a live collision instead of failing the
    // whole submission — this is what actually guarantees every order gets
    // its own number even when two submissions race each other, rather
    // than surfacing "Order ID already exists" to a shop owner who did
    // nothing wrong.
    let attemptOrderId = explicitOrderId || (await generateOrderId());
    let order;
    const MAX_ORDER_ID_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ORDER_ID_ATTEMPTS; attempt++) {
      order = new Order({
        orderId: attemptOrderId,
        userId: userId || undefined,
        customerName: customerName.trim(),
        customerEmail: customerEmail
          .trim()
          .toLowerCase(),
        item: item.trim(),
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalAmount,
        advanceAmount,
        remainingBalance,
        amountPaid: 0,
        status: status || "Pending",
        progress:
          progress !== undefined
            ? Number(progress)
            : 0,
        deliveryDate: deliveryDate || undefined,
        deliveryAddress: deliveryAddress?.trim() || "",
        deliveryMethod: sanitizedDeliveryMethod,
        paymentStatus:
          paymentStatus || "Pending",
        notes: notes?.trim() || "",
        ...(sanitizedDesign ? { design: sanitizedDesign } : {}),
        garmentType: garmentType || "",
        sizeBreakdown: sizeBreakdown || {},
        approval: { status: approvalStatus },
      });

      try {
        await order.save();
        break;
      } catch (saveErr) {
        const isDuplicateOrderId = saveErr.code === 11000 && saveErr.keyPattern?.orderId;
        if (!isDuplicateOrderId || explicitOrderId || attempt === MAX_ORDER_ID_ATTEMPTS) {
          throw saveErr;
        }
        attemptOrderId = await generateOrderId();
      }
    }

    if (approvalStatus === "Pending") {
      // Broadcast to every Admin/Supervisor (recipientId null = broadcast,
      // matching the existing pattern used for shop-registration alerts).
      await Notification.create({
        title: "Order Awaiting Approval",
        message: `Order ${order.orderId} from ${order.customerName} is waiting for approval.`,
        type: "order",
        relatedId: order._id,
        relatedModel: "Order",
        recipientId: null,
      });

      await logActivity({
        actor: req.user,
        action: "order.submitted_for_approval",
        message: `Submitted order ${order.orderId} for approval`,
        targetType: "Order",
        targetId: order._id,
      });
    }

    if (order.status === "Approved") {
  const existingProduction = await Production.findOne({
    orderId: order.orderId,
  });

  if (!existingProduction) {
    await Production.create({
      orderId: order.orderId,
      product: order.item,
      sku: `SKU-${order.orderId}`,
      quantity: order.quantity,
      unit: "Pcs",
      progress: 0,
      status: "In Production",
      startDate: new Date(),
      dueDate:
        order.deliveryDate ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
  }
}

    return res.status(201).json({ success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false,
        message: "Order ID already exists",
      });
    }

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Resubmit for approval — lets the order's own owner send a Rejected order
// back into the Pending queue (e.g. after adjusting quantities elsewhere).
// Re-runs the stock check the same way initial submission does.
// ==========================
router.post("/:id/submit-for-approval", async (req, res) => {
  try {
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = order.userId && String(order.userId) === String(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You do not have access to this order" });
    }

    if (order.approval.status === "Approved") {
      return res.status(400).json({ success: false, message: "This order is already approved." });
    }

    const stockCheck = await verifyStockForOrder(order.garmentType, order.sizeBreakdown);

    order.approval.status = "Pending";
    order.approval.rejectionReason = "";
    order.approval.rejectedBy = null;
    order.approval.rejectedAt = null;
    order.approval.stockVerifiedAt = new Date();
    order.approval.stockVerificationResult = { status: stockCheck.status, details: stockCheck.details };
    await order.save();

    await Notification.create({
      title: "Order Resubmitted for Approval",
      message: `Order ${order.orderId} from ${order.customerName} was resubmitted for approval.`,
      type: "order",
      relatedId: order._id,
      relatedModel: "Order",
      recipientId: null,
    });

    await logActivity({
      actor: req.user,
      action: "order.resubmitted_for_approval",
      message: `Resubmitted order ${order.orderId} for approval`,
      targetType: "Order",
      targetId: order._id,
    });

    return res.status(200).json({ success: true, message: "Order resubmitted for approval", order });
  } catch (error) {
    console.error("Resubmit For Approval Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Approve — Admin/Supervisor only. Re-verifies stock server-side before
// approving; refuses to approve if anything has become insufficient since
// submission.
// ==========================
router.patch("/:id/approve", requireRole("admin", "supervisor"), async (req, res) => {
  try {
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.approval.status === "Approved") {
      return res.status(400).json({ success: false, message: "This order is already approved." });
    }

    const stockCheck = await verifyStockForOrder(order.garmentType, order.sizeBreakdown);

    order.approval.stockVerifiedAt = new Date();
    order.approval.stockVerificationResult = { status: stockCheck.status, details: stockCheck.details };

    if (!stockCheck.sufficient) {
      await order.save();

      const affected = stockCheck.details.filter((d) => !d.sufficient)
        .map((d) => `${d.size} (requested ${d.requested}, only ${d.available} available)`)
        .join(", ");

      await logActivity({
        actor: req.user,
        action: "order.approval_blocked_stock",
        message: `Could not approve order ${order.orderId} — insufficient stock: ${affected}`,
        targetType: "Order",
        targetId: order._id,
      });

      return res.status(409).json({ success: false,
        message: `Cannot approve — stock is insufficient for: ${affected}.`,
        stockCheck,
      });
    }

    // Actually reserve the stock now that it's genuinely being committed to
    // this order — the check above only ever confirmed sufficiency, it
    // never reduced availableQuantity, so a second order for the same
    // sizes could otherwise pass the same check and get approved too,
    // double-booking real inventory.
    await reserveStockForOrder(order.garmentType, order.sizeBreakdown);

    order.approval.status = "Approved";
    order.approval.notes = typeof req.body?.notes === "string" ? req.body.notes.trim().slice(0, 1000) : "";
    order.approval.approvedBy = req.user.id;
    order.approval.approvedByRole = req.user.role;
    order.approval.approvedAt = new Date();
    order.approval.rejectedBy = null;
    order.approval.rejectedAt = null;
    order.approval.rejectionReason = "";
    order.status = "Approved";
    await order.save();

    if (order.userId) {
      await Notification.create({
        title: "Order Approved",
        message: `Your order ${order.orderId} has been approved.`,
        type: "order",
        relatedId: order._id,
        relatedModel: "Order",
        recipientId: order.userId,
      });
    }

    await logActivity({
      actor: req.user,
      action: "order.approved",
      message: `Approved order ${order.orderId}`,
      targetType: "Order",
      targetId: order._id,
    });

    return res.status(200).json({ success: true, message: "Order approved", order });
  } catch (error) {
    console.error("Approve Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Reject — Admin/Supervisor only. Requires a non-empty reason.
// ==========================
router.patch("/:id/reject", requireRole("admin", "supervisor"), async (req, res) => {
  try {
    const reason = (req.body?.reason || "").trim();
    if (!reason) {
      return res.status(400).json({ success: false, message: "A rejection reason is required." });
    }

    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Unlike approve, reject has no guard against being called on an
    // already-Approved order (un-rejecting a decision) — if that's what's
    // happening, the stock reserveStockForOrder locked up at approval time
    // needs to come back, or it's stranded as "reserved" indefinitely.
    const wasApproved = order.approval.status === "Approved";

    order.approval.status = "Rejected";
    order.approval.rejectionReason = reason.slice(0, 1000);
    order.approval.rejectedBy = req.user.id;
    order.approval.rejectedAt = new Date();
    order.approval.approvedBy = null;
    order.approval.approvedAt = null;
    await order.save();

    if (wasApproved) {
      await releaseStockForOrder(order.garmentType, order.sizeBreakdown);
    }

    if (order.userId) {
      await Notification.create({
        title: "Order Requires Changes",
        message: `Order ${order.orderId} was not approved: ${reason}`,
        type: "order",
        relatedId: order._id,
        relatedModel: "Order",
        recipientId: order.userId,
      });
    }

    await logActivity({
      actor: req.user,
      action: "order.rejected",
      message: `Rejected order ${order.orderId}: ${reason}`,
      targetType: "Order",
      targetId: order._id,
    });

    return res.status(200).json({ success: true, message: "Order rejected", order });
  } catch (error) {
    console.error("Reject Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Update order
// ==========================
// Status transitions (Approve / Send to Production / Cancel / payment
// status overrides) and every other field stay Admin-only business logic.
// A Shop Owner may edit ONLY their own order, and ONLY while it's still
// "Pending" (i.e. before an Admin/Supervisor has acted on it at all) — a
// narrow, self-service correction window (quantity/delivery details/notes),
// not general editing rights. Once approved, changes go through Admin.
const SHOP_OWNER_EDITABLE_FIELDS = ["quantity", "deliveryDate", "deliveryAddress", "deliveryMethod", "notes"];
const ADMIN_EDITABLE_FIELDS = [
  "customerName",
  "customerEmail",
  "item",
  "quantity",
  "unitPrice",
  "status",
  "progress",
  "deliveryDate",
  "paymentStatus",
  "notes",
];

router.put("/:id", async (req, res) => {
  try {
    let order;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({
        orderId: req.params.id,
      });
    }

    if (!order) {
      return res.status(404).json({ success: false,
        message: "Order not found",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = order.userId && String(order.userId) === String(req.user.id);

    if (!isAdmin) {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: "You do not have access to this order" });
      }
      if (order.status !== "Pending") {
        return res.status(409).json({ success: false, message: "This order has already been reviewed and can no longer be edited yourself — contact an administrator for changes." });
      }
    }

    const allowedFields = isAdmin ? ADMIN_EDITABLE_FIELDS : SHOP_OWNER_EDITABLE_FIELDS;

    // Production may never start before the order has actually been
    // approved AND the mandatory 50% advance has been verified — this is
    // the real enforcement; "Send to Production" in AdminOrders.js only
    // ever shows/hides the button, which is advisory. A shop owner can
    // never bypass this by manipulating the frontend or calling this route
    // directly, since it's checked fresh against the order's own saved
    // paymentStatus every time.
    if (req.body.status === "Production" && order.status !== "Production") {
      if (order.approval?.status !== "Approved") {
        return res.status(409).json({ success: false, message: "This order must be approved before production can start." });
      }
      if (order.paymentStatus === "Pending") {
        return res.status(409).json({ success: false, message: "The 50% advance payment must be verified before production can start." });
      }
    }

    const previousStatus = order.status;

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    if (
      req.body.quantity !== undefined ||
      req.body.unitPrice !== undefined
    ) {
      order.totalAmount =
        Number(order.quantity) *
        Number(order.unitPrice);
    }

    await order.save();

    // Cancelling an order that had already reserved real stock (see
    // reserveStockForOrder in the approve route) must give that stock back
    // — otherwise it stays permanently locked up as "reserved" for an order
    // that's never going to be produced.
    if (order.status === "Cancelled" && previousStatus !== "Cancelled" && order.approval?.status === "Approved") {
      await releaseStockForOrder(order.garmentType, order.sizeBreakdown);
    }

    // Let the shop owner know when their order's status actually changes
    // (Approved / sent to Production / Cancelled, etc.)
    if (req.body.status !== undefined && order.status !== previousStatus) {
      if (order.userId) {
        await Notification.create({
          title: "Order Status Updated",
          message: `Order ${order.orderId} is now "${order.status}".`,
          type: "order",
          relatedId: order._id,
          relatedModel: "Order",
          recipientId: order.userId,
        });
      }

      await logActivity({
        actor: req.user,
        action: "order.status_changed",
        message: `Changed order ${order.orderId} status from "${previousStatus}" to "${order.status}"`,
        targetType: "Order",
        targetId: order._id,
      });
    }

    // Auto-create the linked Production record the same way order creation
    // does, so "Send to Production" from the admin UI actually starts one.
    if (order.status === "Production") {
      const existingProduction = await Production.findOne({
        orderId: order.orderId,
      });

      if (!existingProduction) {
        await Production.create({
          orderId: order.orderId,
          product: order.item,
          sku: `SKU-${order.orderId}`,
          quantity: order.quantity,
          unit: "Pcs",
          progress: 0,
          status: "In Production",
          startDate: new Date(),
          dueDate:
            order.deliveryDate ||
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        });
      }
    }

    return res.status(200).json({ success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Delete order
// ==========================
// Same self-service window as PUT above: a Shop Owner may delete only their
// own order, and only while it's still "Pending". Admin can delete any
// order at any time.
router.delete("/:id", async (req, res) => {
  try {
    let order;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false,
        message: "Order not found",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = order.userId && String(order.userId) === String(req.user.id);

    if (!isAdmin) {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: "You do not have access to this order" });
      }
      if (order.status !== "Pending") {
        return res.status(409).json({ success: false, message: "This order has already been reviewed and can no longer be deleted yourself — contact an administrator." });
      }
    }

    await Order.findByIdAndDelete(order._id);

    // Same as cancelling — an approved (and therefore stock-reserved) order
    // being deleted outright must release that reservation too, or it's
    // gone from the system but the stock it locked up never comes back.
    if (order.approval?.status === "Approved") {
      await releaseStockForOrder(order.garmentType, order.sizeBreakdown);
    }

    // Any notification pointing at this order (approval requests, status
    // updates, etc.) is now a dead link — clicking it would 404 and leave
    // whoever clicked staring at a blank "Order …" modal with no
    // explanation. Clean those up along with the order itself.
    await Notification.deleteMany({ relatedModel: "Order", relatedId: order._id });
    await Payment.deleteMany({ orderId: order._id });

    return res.status(200).json({ success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

module.exports = router;