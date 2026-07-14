const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    const products = await Inventory.countDocuments();

    const lowStockItems = await Inventory.countDocuments({
      status: {
        $in: ["Low Stock", "Out of Stock"],
      },
    });

    const recentOrderDocuments = await Order.find()
  .sort({ createdAt: -1 })
  .limit(5)
  .lean();

const recentOrders = recentOrderDocuments.map((order) => ({
  _id: order._id,

  orderId:
    order.orderId ||
    order.orderNumber ||
    `ORD-${String(order._id).slice(-6).toUpperCase()}`,

  customerName:
    order.customerName ||
    order.shopName ||
    order.name ||
    "Unknown Customer",

  totalAmount:
    Number(
      order.totalAmount ??
      order.amount ??
      0
    ),

  status:
    order.status || "Pending",

  createdAt:
    order.createdAt || null,
}));

    res.status(200).json({
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        products,
        lowStockItems,
      },

      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      message: "Could not load dashboard data.",
      error: error.message,
    });
  }
});

module.exports = router;