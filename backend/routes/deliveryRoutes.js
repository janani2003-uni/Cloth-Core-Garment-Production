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

// Exactly three shop-owner-facing statuses. A Shop Owner can only ever read
// this field (GET /order/:orderId below, used by Deliveries.js) — every
// write route in this file is role-gated to Admin/Supervisor only, so this
// is enforced by the backend, not just by hiding the UI control.
const DELIVERY_STATUSES = ["Not Yet Delivered", "Delivery In Progress", "Delivered"];

// A delivery can't move to "Delivery In Progress" before production is
// finished and the order has at least the advance payment verified —
// cross-checked against the order's own status rather than trusted from
// the request body.
async function assertDeliveryReady(orderId) {
  const order = await Order.findById(orderId);

  if (!order) {
    return "Order not found";
  }

  if (order.paymentStatus === "Pending") {
    return "This order has no verified payment yet — delivery cannot begin until the advance payment is verified.";
  }

  const production = await Production.findOne({ orderId: order.orderId });

  if (production && production.status !== "Completed" && production.stage !== "Completed") {
    return `Production for this order is still "${production.stage}" — delivery cannot begin until production is complete.`;
  }

  return null;
}

// A delivery can't be marked "Delivered" before the FULL order balance
// (both the advance and the final 50%) has actually been verified — this
// is the real, backend-side enforcement of "delivery must not complete
// before full payment", not just a disabled frontend button.
async function assertFullyPaidForDelivery(orderId) {
  const order = await Order.findById(orderId);

  if (!order) {
    return "Order not found";
  }

  if (order.paymentStatus !== "Full Paid" || Number(order.remainingBalance || 0) > 0) {
    return "This order cannot be marked Delivered until the full remaining balance has been paid and verified.";
  }

  return null;
}

// Admin/Supervisor: create a delivery record for an order
router.post("/", canManage, async (req, res) => {
  try {
    const { orderId, deliveryStaffName, scheduledDate, notes, address } = req.body;

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

    // Defaults to what the shop owner actually asked for at order placement
    // (order.deliveryAddress) — Admin/Supervisor can still override before
    // saving. Delivery method is always "Factory Delivery" now — there is
    // no other option to choose from.
    const delivery = await Delivery.create({
      orderId,
      deliveryStaffName: deliveryStaffName?.trim() || "",
      address: (address !== undefined ? address : order.deliveryAddress)?.trim() || "",
      method: "Factory Delivery",
      scheduledDate: scheduledDate || null,
      status: "Not Yet Delivered",
      notes: notes?.trim() || "",
    });

    // The shop owner previously only ever heard about their delivery once
    // it was fully "Delivered" — no word that it had even been scheduled.
    if (order.userId && delivery.scheduledDate) {
      await Notification.create({
        title: "Delivery Scheduled",
        message: `Delivery for order ${order.orderId} has been scheduled for ${new Date(delivery.scheduledDate).toLocaleDateString()}.`,
        type: "order",
        relatedId: order._id,
        relatedModel: "Order",
        recipientId: order.userId,
      });
    }

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

// Admin/Supervisor: list all deliveries (Supervisor is read+update, same as
// Admin — write access below stays role-gated the same way for both)
router.get("/", canView, async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("orderId", "orderId customerName item quantity status paymentStatus deliveryDate deliveryAddress deliveryMethod")
      .sort({ createdAt: -1 });

    return res.status(200).json(deliveries);
  } catch (error) {
    console.error("Get Deliveries Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delivery for a specific order — a Shop Owner may only read their own
// order's delivery status here; they have no route anywhere in this file
// that can write to it.
router.get("/order/:orderId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const canViewAny = ["admin", "supervisor"].includes(req.user.role);
    if (!canViewAny && (!order.userId || String(order.userId) !== String(req.user.id))) {
      return res.status(403).json({ success: false, message: "You do not have access to this order" });
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
// status, notes. Tracking number and delivery method are no longer
// editable here (the system only ever uses Factory Delivery, and tracking
// numbers have been removed everywhere in the UI).
router.put("/:id", canManage, async (req, res) => {
  try {
    const allowedFields = ["deliveryStaffName", "address", "scheduledDate", "status", "notes"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.status !== undefined && !DELIVERY_STATUSES.includes(updates.status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${DELIVERY_STATUSES.join(", ")}` });
    }

    const existingDelivery = await Delivery.findById(req.params.id);
    if (!existingDelivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    const movingToInProgress = updates.status === "Delivery In Progress" && existingDelivery.status !== "Delivery In Progress";
    if (movingToInProgress) {
      const blockedReason = await assertDeliveryReady(existingDelivery.orderId);
      if (blockedReason) {
        return res.status(400).json({ success: false, message: blockedReason });
      }
    }

    const movingToDelivered = updates.status === "Delivered" && existingDelivery.status !== "Delivered";
    if (movingToDelivered) {
      const blockedReason = await assertFullyPaidForDelivery(existingDelivery.orderId);
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

    if (movingToDelivered && delivery.orderId) {
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
    } else if (movingToInProgress && delivery.orderId) {
      // Previously the shop owner heard nothing between "Scheduled" and
      // "Delivered" — no word their order had actually left the factory.
      // This is also the moment the order's own status becomes
      // "In Delivery" — the one other place besides "Delivered" above that
      // order.status changes as a side effect of a delivery update.
      const dispatchedOrder = await Order.findByIdAndUpdate(
        delivery.orderId,
        { status: "In Delivery" },
        { new: true }
      );
      if (dispatchedOrder?.userId) {
        await Notification.create({
          title: "Delivery In Progress",
          message: `Order ${dispatchedOrder.orderId} is now out for delivery.`,
          type: "order",
          relatedId: delivery.orderId,
          relatedModel: "Order",
          recipientId: dispatchedOrder.userId,
        });
      }
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

// Admin/Supervisor: move a delivery through its own 3-stage status —
// narrower than the full PUT above (status + an optional note only).
router.patch("/:id/status", canUpdateOwnStatus, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !DELIVERY_STATUSES.includes(status)) {
      return res.status(400).json({ success: false,
        message: `Status must be one of: ${DELIVERY_STATUSES.join(", ")}`,
      });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found" });
    }

    const justMovingToInProgress = status === "Delivery In Progress" && delivery.status !== "Delivery In Progress";
    const justMovingToDelivered = status === "Delivered" && delivery.status !== "Delivered";

    if (justMovingToInProgress) {
      const blockedReason = await assertDeliveryReady(delivery.orderId);
      if (blockedReason) {
        return res.status(400).json({ success: false, message: blockedReason });
      }
    }

    if (justMovingToDelivered) {
      const blockedReason = await assertFullyPaidForDelivery(delivery.orderId);
      if (blockedReason) {
        return res.status(400).json({ success: false, message: blockedReason });
      }
    }

    delivery.status = status;
    if (notes !== undefined) {
      delivery.notes = notes;
    }
    await delivery.save();

    if (justMovingToDelivered && delivery.orderId) {
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
    } else if (justMovingToInProgress && delivery.orderId) {
      const dispatchedOrder = await Order.findByIdAndUpdate(
        delivery.orderId,
        { status: "In Delivery" },
        { new: true }
      );
      if (dispatchedOrder?.userId) {
        await Notification.create({
          title: "Delivery In Progress",
          message: `Order ${dispatchedOrder.orderId} is now out for delivery.`,
          type: "order",
          relatedId: delivery.orderId,
          relatedModel: "Order",
          recipientId: dispatchedOrder.userId,
        });
      }
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
