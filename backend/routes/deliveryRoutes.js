const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const Production = require("../models/Production");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

const canView = requireRole("admin", "supervisor");
const canManage = requireRole("admin", "supervisor");
const canUpdateOwnStatus = requireRole("admin", "supervisor");

// A delivery can't be scheduled/dispatched before production is finished and
// the order has at least a partial payment recorded — cross-checked against
// the order's own status rather than trusted from the request body.
async function assertDeliveryReady(orderId) {
  const order = await Order.findById(orderId);

  if (!order) {
    return "Order not found";
  }

  if (order.paymentStatus === "Pending") {
    return "This order has no payment recorded yet — delivery cannot be scheduled until at least a partial payment is made.";
  }

  const production = await Production.findOne({ orderId: order.orderId });

  if (production && production.status !== "Completed" && production.stage !== "Completed") {
    return `Production for this order is still "${production.stage}" — delivery cannot be scheduled until production is complete.`;
  }

  return null;
}

// Admin/Supervisor: create a delivery record for an order
router.post("/", canManage, async (req, res) => {
  try {
    const { orderId, deliveryStaffName, trackingNumber, scheduledDate, notes } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "A valid orderId is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const existing = await Delivery.findOne({ orderId });

    if (existing) {
      return res.status(400).json({ success: false, message: "A delivery record already exists for this order" });
    }

    if (scheduledDate) {
      const blockedReason = await assertDeliveryReady(orderId);
      if (blockedReason) {
        return res.status(400).json({ success: false, message: blockedReason });
      }
    }

    const delivery = await Delivery.create({
      orderId,
      deliveryStaffName: deliveryStaffName?.trim() || "",
      trackingNumber: trackingNumber?.trim() || "",
      scheduledDate: scheduledDate || null,
      status: scheduledDate ? "Scheduled" : "Not Scheduled",
      notes: notes?.trim() || "",
    });

    await logActivity({
      actor: req.user,
      action: "delivery.created",
      message: `Created delivery record for order ${order.orderId}`,
      targetType: "Delivery",
      targetId: delivery._id,
    });

    return res.status(201).json({ success: true, message: "Delivery record created", delivery });
  } catch (error) {
    console.error("Create Delivery Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin/Supervisor/Staff: list all deliveries (read-only monitoring for
// Supervisor/Staff — write access stays gated per-route below)
router.get("/", canView, async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("orderId", "orderId customerName item quantity status paymentStatus deliveryDate")
      .sort({ createdAt: -1 });

    return res.status(200).json(deliveries);
  } catch (error) {
    console.error("Get Deliveries Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delivery for a specific order (shop owner or admin)
router.get("/order/:orderId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const delivery = await Delivery.findOne({ orderId: req.params.orderId });

    if (!delivery) {
      return res.status(404).json({ success: false, message: "No delivery record for this order yet" });
    }

    return res.status(200).json(delivery);
  } catch (error) {
    console.error("Get Order Delivery Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin/Supervisor: full delivery edit — scheduling, staff assignment,
// tracking, status, notes.
router.put("/:id", canManage, async (req, res) => {
  try {
    const allowedFields = ["deliveryStaffName", "trackingNumber", "scheduledDate", "status", "notes"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const existingDelivery = await Delivery.findById(req.params.id);
    if (!existingDelivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    const movingToDispatch = updates.status === "Dispatched" && existingDelivery.status !== "Dispatched";
    if (movingToDispatch) {
      const blockedReason = await assertDeliveryReady(existingDelivery.orderId);
      if (blockedReason) {
        return res.status(400).json({ success: false, message: blockedReason });
      }
    }

    const delivery = await Delivery.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    if (updates.status === "Delivered" && delivery.orderId) {
      const updatedOrder = await Order.findByIdAndUpdate(
        delivery.orderId,
        { status: "Delivered", progress: 100 },
        { new: true }
      );

      await Notification.create({
        title: "Order Delivered",
        message: `Delivery completed for order ${updatedOrder?.orderId || ""}.`,
        type: "order",
        relatedId: delivery.orderId,
        relatedModel: "Order",
        recipientId: updatedOrder?.userId || null,
      });
    }

    await logActivity({
      actor: req.user,
      action: "delivery.updated",
      message: `Updated delivery status to "${delivery.status}"`,
      targetType: "Delivery",
      targetId: delivery._id,
    });

    return res.status(200).json({ success: true, message: "Delivery updated", delivery });
  } catch (error) {
    console.error("Update Delivery Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin/Supervisor/Staff: move a delivery through its own fulfillment status
// (Dispatched -> In Transit -> Delivered, or Delivery Failed) plus an
// optional note — narrower than the full PUT above, since Staff shouldn't be
// able to reassign delivery staff, retarget tracking numbers, or reschedule.
const STAFF_ALLOWED_STATUSES = ["Dispatched", "In Transit", "Delivered", "Delivery Failed"];

router.patch("/:id/status", canUpdateOwnStatus, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !STAFF_ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false,
        message: `Status must be one of: ${STAFF_ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    if (status === "Dispatched" && delivery.status !== "Dispatched") {
      const blockedReason = await assertDeliveryReady(delivery.orderId);
      if (blockedReason) {
        return res.status(400).json({ success: false, message: blockedReason });
      }
    }

    delivery.status = status;
    if (notes !== undefined) {
      delivery.notes = notes;
    }
    await delivery.save();

    if (status === "Delivered" && delivery.orderId) {
      const updatedOrder = await Order.findByIdAndUpdate(
        delivery.orderId,
        { status: "Delivered", progress: 100 },
        { new: true }
      );

      await Notification.create({
        title: "Order Delivered",
        message: `Delivery completed for order ${updatedOrder?.orderId || ""}.`,
        type: "order",
        relatedId: delivery.orderId,
        relatedModel: "Order",
        recipientId: updatedOrder?.userId || null,
      });
    }

    await logActivity({
      actor: req.user,
      action: "delivery.status_updated",
      message: `Updated delivery status to "${delivery.status}"`,
      targetType: "Delivery",
      targetId: delivery._id,
    });

    return res.status(200).json({ success: true, message: "Delivery status updated", delivery });
  } catch (error) {
    console.error("Update Delivery Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
