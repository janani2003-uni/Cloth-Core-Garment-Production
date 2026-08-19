const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");

const Order = require("../models/Order");
const Production = require("../models/Production");
const Inventory = require("../models/Inventory");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getVerifiedRevenueInRange, getDailyVerifiedRevenue, round2 } = require("../utils/revenue");

router.use(verifyToken, requireRole("admin"));

const MAX_RANGE_DAYS = 366;

function parseDateRange(query) {
  const now = new Date();
  const to = query.to ? new Date(query.to) : now;
  let from = query.from ? new Date(query.from) : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);

  const maxRangeMs = MAX_RANGE_DAYS * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxRangeMs) {
    from = new Date(to.getTime() - maxRangeMs);
  }

  from.setHours(0, 0, 0, 0);
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);

  return { from, to: toEnd };
}

// Builds the full sales report payload for a date range — shared by both
// the JSON endpoint (GET /sales) and the PDF endpoint (GET /sales/pdf) so
// the numbers in the downloaded PDF are always exactly what the page shows,
// never a second, independently-computed set of figures.
async function buildSalesReport(from, to) {
  const dateFilter = { createdAt: { $gte: from, $lte: to } };

  const totalOrders = await Order.countDocuments(dateFilter);

  // Real revenue — Verified payments only (see utils/revenue.js), not the
  // non-existent Order.paymentStatus === "Paid" this used to (silently)
  // match against.
  const totalRevenue = await getVerifiedRevenueInRange(from, to);
  const paidOrdersCount = await Order.countDocuments({ ...dateFilter, paymentStatus: "Full Paid" });
  const averageOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

  const statusBreakdownAgg = await Order.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$totalAmount" } } },
    { $sort: { count: -1 } },
  ]);
  const statusBreakdown = statusBreakdownAgg.map((s) => ({
    status: s._id || "Unknown",
    count: s.count,
    value: s.value,
  }));

  const dailyRevenue = await getDailyVerifiedRevenue(from, to);

  // Top items — grouped by the clean garmentType (Shirt/T-Shirt/Hoodie/
  // Denim) so the report reflects the current garment catalog, not every
  // distinct fabric/color combination as a separate "item".
  const topItemsAgg = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: { $cond: [{ $ne: ["$garmentType", ""] }, "$garmentType", "$item"] },
        quantity: { $sum: "$quantity" },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);
  const topItems = topItemsAgg.map((i) => ({
    name: i._id || "Unknown item",
    quantity: i.quantity,
    revenue: i.revenue,
  }));

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    summary: { totalOrders, paidOrdersCount, totalRevenue, averageOrderValue },
    statusBreakdown,
    dailyRevenue,
    topItems,
  };
}

// GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/sales", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const report = await buildSalesReport(from, to);
    return res.status(200).json({ success: true, ...report });
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/sales/pdf?from=&to= — real PDF built from the exact same
// data as the JSON report above (never a blank/decorative document).
router.get("/sales/pdf", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const report = await buildSalesReport(from, to);
    const production = await Production.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const productionMap = Object.fromEntries(production.map((p) => [p._id, p.count]));
    const productionTotal = production.reduce((sum, p) => sum + p.count, 0);
    const inventoryItems = await Inventory.find().lean();
    const inventoryTotalValue = round2(
      inventoryItems.reduce((sum, i) => sum + Number(i.stockQuantity || 0) * Number(i.unitCost || 0), 0)
    );
    const inventoryLowStock = inventoryItems.filter((i) => i.status === "Low Stock").length;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ClothCore-Sales-Report-${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    doc.fontSize(22).fillColor("#522B5B").font("Helvetica-Bold").text("ClothCore");
    doc.fontSize(9).fillColor("#854F6C").font("Helvetica").text("Garment Production & Order Management");
    doc.moveDown(1);
    doc.fontSize(15).fillColor("#190019").font("Helvetica-Bold").text("Sales & Operations Report");
    doc.fontSize(10).fillColor("#854F6C").font("Helvetica").text(
      `Range: ${from.toLocaleDateString("en-GB")} – ${to.toLocaleDateString("en-GB")}   ·   Generated: ${new Date().toLocaleString("en-GB")}`
    );
    doc.moveDown(0.5);
    doc.strokeColor("#DFB6B2").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    const row = (label, value) => {
      const y = doc.y;
      doc.fontSize(10).fillColor("#854F6C").font("Helvetica").text(label, 50, y, { width: 220 });
      doc.fontSize(10).fillColor("#190019").font("Helvetica-Bold").text(String(value ?? "—"), 280, y, { width: 265 });
      doc.moveDown(0.5);
    };

    const sectionHeading = (text) => {
      doc.moveDown(0.4);
      doc.fontSize(11).fillColor("#522B5B").font("Helvetica-Bold").text(text);
      doc.strokeColor("#DFB6B2").lineWidth(0.5).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
      doc.moveDown(0.5);
    };

    sectionHeading("Sales Summary");
    row("Orders Placed", report.summary.totalOrders);
    row("Paid Orders", report.summary.paidOrdersCount);
    row("Revenue (Verified)", `Rs. ${Number(report.summary.totalRevenue).toFixed(2)}`);
    row("Average Order Value", `Rs. ${Number(report.summary.averageOrderValue).toFixed(2)}`);

    sectionHeading("Orders by Status");
    report.statusBreakdown.forEach((s) => row(s.status, `${s.count} orders — Rs. ${Number(s.value || 0).toFixed(2)}`));
    if (report.statusBreakdown.length === 0) row("No orders in this range", "");

    sectionHeading("Top Garments (Shirts / T-Shirts / Hoodies / Denims)");
    report.topItems.forEach((i) => row(i.name, `${i.quantity} pcs — Rs. ${Number(i.revenue || 0).toFixed(2)}`));
    if (report.topItems.length === 0) row("No orders in this range", "");

    sectionHeading("Production Summary");
    row("Total Production Orders", productionTotal);
    row("In Production", productionMap["In Production"] || 0);
    row("Completed", productionMap["Completed"] || 0);
    row("On Hold", productionMap["On Hold"] || 0);

    sectionHeading("Inventory Valuation");
    row("Total Stock Value", `Rs. ${inventoryTotalValue.toFixed(2)}`);
    row("Low Stock Items", inventoryLowStock);

    doc.moveDown(1);
    doc.fontSize(8).fillColor("#854F6C").font("Helvetica").text(
      "ClothCore Garment Production System — real-time data as of generation.",
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    console.error("Sales Report PDF Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.end();
  }
});

module.exports = router;
