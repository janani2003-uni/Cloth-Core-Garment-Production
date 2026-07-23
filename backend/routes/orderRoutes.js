const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Order = require("../models/Order");
const Production = require("../models/Production");
const Shop = require("../models/Shop");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const SystemSettings = require("../models/SystemSettings");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getMinimumOrderQuantity } = require("../config/businessRules");

// Generates readable, human-facing IDs like "ORD-2026-001" instead of a raw
// timestamp. The prefix ("ORD") is configurable via Admin > Settings; falls
// back to "ORD" if no SystemSettings document exists yet. Not concurrency-safe
// against simultaneous submissions, but this app has no high-volume/concurrent
// order creation, so a simple count-based sequence is sufficient.
async function generateOrderId() {
  const settings = await SystemSettings.findOne();
  const prefixWord = settings?.orderIdPrefix || "ORD";

  const year = new Date().getFullYear();
  const prefix = `${prefixWord}-${year}-`;
  const count = await Order.countDocuments({
    orderId: { $regex: `^${prefix}` },
  });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
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
    });

    return res.status(200).json(orders);
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
    const delivered = await Order.countDocuments({ status: "Delivered" });
    const cancelled = await Order.countDocuments({ status: "Cancelled" });

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json({ success: true,
      totalOrders,
      pending,
      approved,
      inProduction,
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

    const payments = await Payment.find({ orderId: order._id, status: "Verified" });
    const amountPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balanceDue = Math.max(0, Number(order.totalAmount || 0) - amountPaid);

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
        createdAt: order.createdAt,
      },
      amountPaid,
      balanceDue,
    });
  } catch (error) {
    console.error("Get Invoice Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
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
      paymentStatus,
      notes,
    } = req.body;

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

    // Only approved, active shops may submit orders. Admins bypass this
    // check (e.g. creating orders directly from the dashboard).
    if (req.user.role !== "admin") {
      const shop = await Shop.findOne({ ownerId: req.user.id });

      if (!shop || shop.approvalStatus !== "Approved") {
        return res.status(403).json({ success: false,
          message:
            "Your shop must be approved by an administrator before placing orders.",
        });
      }

      if (!shop.isActive) {
        return res.status(403).json({ success: false,
          message: "Your shop account is currently suspended. Contact an administrator for assistance.",
        });
      }
    }

    const finalOrderId = orderId?.trim() || (await generateOrderId());

    const existingOrder = await Order.findOne({
      orderId: finalOrderId,
    });

    if (existingOrder) {
      return res.status(400).json({ success: false,
        message: "Order ID already exists",
      });
    }

    const totalAmount =
      Number(quantity) * Number(unitPrice);

    const order = new Order({
      orderId: finalOrderId,
      userId: userId || undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail
        .trim()
        .toLowerCase(),
      item: item.trim(),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalAmount,
      status: status || "Pending",
      progress:
        progress !== undefined
          ? Number(progress)
          : 0,
      deliveryDate: deliveryDate || undefined,
      paymentStatus:
        paymentStatus || "Pending",
      notes: notes?.trim() || "",
    });

    await order.save();
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
// Update order
// ==========================
// Order status transitions (Approve / Send to Production / Cancel /
// payment status overrides) are Admin business logic — Shop Owners place
// and track orders but do not edit them directly.
router.put("/:id", requireRole("admin"), async (req, res) => {
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

    const allowedFields = [
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
router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    let order;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findByIdAndDelete(
        req.params.id
      );
    } else {
      order = await Order.findOneAndDelete({
        orderId: req.params.id,
      });
    }

    if (!order) {
      return res.status(404).json({ success: false,
        message: "Order not found",
      });
    }

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