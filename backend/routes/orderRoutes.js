const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  getDashboardStats,
  cancelOrder,
} = require("../controllers/orderController");
// Dashboard Statistics
router.get("/dashboard/stats", getDashboardStats);

// Get All Orders
router.get("/", getOrders);

// Create Order
router.post("/", createOrder);


router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;