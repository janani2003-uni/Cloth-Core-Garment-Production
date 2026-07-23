const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Payment = require("../models/Payment");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

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

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const revenueThisPeriodResult = await Order.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: startOfThisPeriod } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const revenueThisPeriod = revenueThisPeriodResult.length > 0 ? revenueThisPeriodResult[0].total : 0;

    const revenuePrevPeriodResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: startOfPrevPeriod, $lt: startOfThisPeriod },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const revenuePrevPeriod = revenuePrevPeriodResult.length > 0 ? revenuePrevPeriodResult[0].total : 0;

    // Payment totals by status — distinct from Order.totalAmount-based
    // revenue above, this reflects the actual Payment records submitted by
    // shop owners (what's verified/collected vs. still awaiting review).
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

    // Top items by quantity sold (aggregated from the real `item` field on Order)
    const topProductsAgg = await Order.aggregate([
      {
        $group: {
          _id: "$item",
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

    // Real role distribution
    const roleAgg = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const roleDistribution = roleAgg.map((r) => ({
      name: r._id || "Unknown",
      count: r.count,
      percentage: totalUsers > 0 ? Math.round((r.count / totalUsers) * 1000) / 10 : 0,
    }));

    // Revenue trend for the last 7 days (for the Sales Overview chart)
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const revenueByDayAgg = await Order.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const revenueByDayMap = new Map(revenueByDayAgg.map((d) => [d._id, d.total]));

    const revenueTrend = [];
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = day.toISOString().slice(0, 10);
      revenueTrend.push({
        date: key,
        revenue: revenueByDayMap.get(key) || 0,
      });
    }

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
      roleDistribution,
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
