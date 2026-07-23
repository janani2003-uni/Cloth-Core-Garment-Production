const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

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

// GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
// Real, date-range-configurable sales report built entirely from the
// existing Order collection — no new model, no fabricated figures.
router.get("/sales", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const dateFilter = { createdAt: { $gte: from, $lte: to } };

    const totalOrders = await Order.countDocuments(dateFilter);
    const paidOrdersCount = await Order.countDocuments({ ...dateFilter, paymentStatus: "Paid" });

    const revenueAgg = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg.length ? revenueAgg[0].totalRevenue : 0;
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

    const dailyRevenueAgg = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const dailyRevenueMap = new Map(dailyRevenueAgg.map((d) => [d._id, { revenue: d.revenue, orders: d.orders }]));

    const dailyRevenue = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = cursor.toISOString().slice(0, 10);
      const entry = dailyRevenueMap.get(key) || { revenue: 0, orders: 0 };
      dailyRevenue.push({ date: key, revenue: entry.revenue, orders: entry.orders });
      cursor.setDate(cursor.getDate() + 1);
    }

    const topItemsAgg = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$item", quantity: { $sum: "$quantity" }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);
    const topItems = topItemsAgg.map((i) => ({
      name: i._id || "Unknown item",
      quantity: i.quantity,
      revenue: i.revenue,
    }));

    return res.status(200).json({
      success: true,
      range: { from: from.toISOString(), to: to.toISOString() },
      summary: {
        totalOrders,
        paidOrdersCount,
        totalRevenue,
        averageOrderValue,
      },
      statusBreakdown,
      dailyRevenue,
      topItems,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
