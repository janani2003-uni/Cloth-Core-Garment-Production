const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Production = require("../models/Production");
const Payment = require("../models/Payment");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getVerifiedRevenueInRange, getDailyVerifiedRevenue, round2 } = require("../utils/revenue");

router.use(verifyToken, requireRole("admin"));

function percentChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const startOfThisPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfPrevPeriod = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments();
    const usersThisPeriod = await User.countDocuments({ createdAt: { $gte: startOfThisPeriod } });
    const usersPrevPeriod = await User.countDocuments({
      createdAt: { $gte: startOfPrevPeriod, $lt: startOfThisPeriod },
    });

    const totalOrders = await Order.countDocuments();
    const ordersThisPeriod = await Order.countDocuments({ createdAt: { $gte: startOfThisPeriod } });
    const ordersPrevPeriod = await Order.countDocuments({
      createdAt: { $gte: startOfPrevPeriod, $lt: startOfThisPeriod },
    });

    // Real revenue — Verified payments only (see utils/revenue.js). Never
    // matches the literal string "Paid", which isn't a real
    // Order.paymentStatus value and used to silently report 0 revenue.
    const totalRevenue = await getVerifiedRevenueInRange(null, null);
    const revenueThisPeriod = await getVerifiedRevenueInRange(startOfThisPeriod, now);
    const revenuePrevPeriod = await getVerifiedRevenueInRange(startOfPrevPeriod, startOfThisPeriod);

    // Payment totals by status — the real Payment records submitted by shop
    // owners (what's verified/collected vs. still awaiting review).
    const paymentTotalsAgg = await Payment.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" } } },
    ]);
    const paymentTotalsMap = {};
    paymentTotalsAgg.forEach((p) => {
      paymentTotalsMap[p._id] = p.total;
    });
    const paymentTotals = {
      verified: paymentTotalsMap.Verified || 0,
      submitted: paymentTotalsMap.Submitted || 0,
      rejected: paymentTotalsMap.Rejected || 0,
    };

    const products = await Inventory.countDocuments();

    const lowStockItems = await Inventory.countDocuments({
      status: { $in: ["Low Stock", "Out of Stock"] },
    });
    const lowStockItemsPrevPeriod = await Inventory.countDocuments({
      status: { $in: ["Low Stock", "Out of Stock"] },
      updatedAt: { $lt: startOfThisPeriod },
    });

    const recentOrderDocuments = await Order.find().sort({ createdAt: -1 }).limit(5).lean();

    const recentOrders = recentOrderDocuments.map((order) => ({
      _id: order._id,
      orderId: order.orderId,
      customerName: order.customerName || "Unknown Customer",
      totalAmount: Number(order.totalAmount || 0),
      status: order.status || "Pending",
      createdAt: order.createdAt || null,
    }));

    // Top garments by quantity sold — grouped by the clean garmentType field
    // (Shirt/T-Shirt/Hoodie/Denim) rather than the composed `item` display
    // string, so "T-Shirt (Cotton, White)" and "T-Shirt (Blend, Black)"
    // count as the same garment. Falls back to `item` only for the rare
    // legacy order that predates garmentType being recorded.
    const topProductsAgg = await Order.aggregate([
      {
        $group: {
          _id: { $cond: [{ $ne: ["$garmentType", ""] }, "$garmentType", "$item"] },
          sold: { $sum: "$quantity" },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]);
    const topProducts = topProductsAgg.map((p) => ({
      name: p._id || "Unknown item",
      sold: p.sold,
      revenue: p.revenue,
    }));

    // Orders by status — real counts for the Order Status Distribution chart.
    const statusAgg = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const orderStatusBreakdown = statusAgg.map((s) => ({ status: s._id || "Unknown", count: s.count }));

    // Production by stage — real counts for the Production Overview chart.
    const stageAgg = await Production.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);
    const productionStageBreakdown = stageAgg.map((s) => ({ stage: s._id || "Unknown", count: s.count }));

    // Revenue trend for the last 7 days (for the Sales Overview chart) —
    // built from real Verified payments, one point per day.
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const revenueTrend = await getDailyVerifiedRevenue(sevenDaysAgo, now);

    res.status(200).json({ success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        products,
        lowStockItems,
      },
      paymentTotals,
      trends: {
        totalUsers: percentChange(usersThisPeriod, usersPrevPeriod),
        totalOrders: percentChange(ordersThisPeriod, ordersPrevPeriod),
        totalRevenue: percentChange(revenueThisPeriod, revenuePrevPeriod),
        lowStockItems: percentChange(lowStockItems, lowStockItemsPrevPeriod),
      },
      recentOrders,
      topProducts,
      orderStatusBreakdown,
      productionStageBreakdown,
      revenueTrend,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({ success: false,
      message: "Could not load dashboard data.",
      error: error.message,
    });
  }
});

module.exports = router;
