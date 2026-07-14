const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Order = require("../models/Order");
const Production = require("../models/Production");
// ==========================
// Get all orders
// ==========================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
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
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
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
      !orderId ||
      !customerName ||
      !customerEmail ||
      !item ||
      quantity === undefined ||
      unitPrice === undefined
    ) {
      return res.status(400).json({
        message: "Please fill in all required order fields",
      });
    }

    const existingOrder = await Order.findOne({
      orderId: orderId.trim(),
    });

    if (existingOrder) {
      return res.status(400).json({
        message: "Order ID already exists",
      });
    }

    const totalAmount =
      Number(quantity) * Number(unitPrice);

    const order = new Order({
      orderId: orderId.trim(),
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

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Order ID already exists",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Update order
// ==========================
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
      return res.status(404).json({
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

    return res.status(200).json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Delete order
// ==========================
router.delete("/:id", async (req, res) => {
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
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;