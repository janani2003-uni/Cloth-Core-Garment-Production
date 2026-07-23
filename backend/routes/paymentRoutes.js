const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

const canView = requireRole("admin", "supervisor");

// Shop owner submits a payment for verification
router.post("/", async (req, res) => {
  try {
    const {
      orderId,
      shopId,
      paymentType,
      paymentMethod,
      amount,
      transactionReference,
      proofFile,
    } = req.body;

    if (
      !orderId ||
      !paymentType ||
      !paymentMethod ||
      amount === undefined ||
      !transactionReference
    ) {
      return res.status(400).json({ success: false,
        message:
          "orderId, paymentType, paymentMethod, amount and transactionReference are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const payment = await Payment.create({
      orderId,
      shopId: shopId || undefined,
      paymentType,
      paymentMethod: paymentMethod.trim(),
      amount: Number(amount),
      transactionReference: transactionReference.trim(),
      proofFile: proofFile || "",
    });

    await Notification.create({
      title: "Payment Submitted",
      message: `A payment of ${amount} was submitted for order ${order.orderId}.`,
      type: "payment",
      relatedId: payment._id,
      relatedModel: "Payment",
    });

    return res.status(201).json({ success: true,
      message: "Payment submitted for verification",
      payment,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin/Supervisor: list all payments (Supervisor is view/flag-only — no
// verify/reject route below allows anything but Admin)
router.get("/", canView, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("orderId", "orderId customerName customerEmail item totalAmount paymentStatus")
      .sort({ createdAt: -1 });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Get Payments Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Payments for a specific order (shop owner or admin)
router.get("/order/:orderId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const payments = await Payment.find({
      orderId: req.params.orderId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Get Order Payments Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: verify a payment
router.put("/:id/verify", requireRole("admin"), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "Verified",
        verifiedAt: new Date(),
        verifiedBy: req.user.id,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    let updatedOrder = null;

    if (payment.orderId) {
      updatedOrder = await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: payment.paymentType === "Full Payment" ? "Paid" : "Partial",
      });
    }

    await Notification.create({
      title: "Payment Verified",
      message: `A payment of ${payment.amount} was verified.`,
      type: "payment",
      relatedId: payment._id,
      relatedModel: "Payment",
      recipientId: updatedOrder?.userId || null,
    });

    await logActivity({
      actor: req.user,
      action: "payment.verified",
      message: `Verified a payment of ${payment.amount} for order ${updatedOrder?.orderId || ""}`,
      targetType: "Payment",
      targetId: payment._id,
    });

    return res.status(200).json({ success: true, message: "Payment verified", payment });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: reject a payment
router.put("/:id/reject", requireRole("admin"), async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected", rejectionReason: reason?.trim() || "" },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const relatedOrder = payment.orderId ? await Order.findById(payment.orderId) : null;

    await Notification.create({
      title: "Payment Rejected",
      message: `A submitted payment of ${payment.amount} was rejected.`,
      type: "payment",
      relatedId: payment._id,
      relatedModel: "Payment",
      recipientId: relatedOrder?.userId || null,
    });

    await logActivity({
      actor: req.user,
      action: "payment.rejected",
      message: `Rejected a payment of ${payment.amount} for order ${relatedOrder?.orderId || ""}`,
      targetType: "Payment",
      targetId: payment._id,
    });

    return res.status(200).json({ success: true, message: "Payment rejected", payment });
  } catch (error) {
    console.error("Reject Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin/Supervisor: add an internal note and/or flag a payment for Admin
// review — monitoring only, never touches status/amount/verification.
router.put("/:id/note", canView, async (req, res) => {
  try {
    const { note, flagged, flaggedReason } = req.body;

    const updates = {};
    if (note !== undefined) updates.supervisorNote = note?.trim() || "";
    if (flagged !== undefined) updates.flaggedForReview = !!flagged;
    if (flaggedReason !== undefined) updates.flaggedReason = flaggedReason?.trim() || "";

    const payment = await Payment.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (updates.flaggedForReview) {
      await Notification.create({
        title: "Payment Flagged for Review",
        message: `A payment of ${payment.amount} was flagged for review${flaggedReason ? `: ${flaggedReason}` : "."}`,
        type: "payment",
        relatedId: payment._id,
        relatedModel: "Payment",
      });

      await logActivity({
        actor: req.user,
        action: "payment.flagged",
        message: `Flagged a payment of ${payment.amount} for Admin review`,
        targetType: "Payment",
        targetId: payment._id,
      });
    }

    return res.status(200).json({ success: true, message: "Payment note saved", payment });
  } catch (error) {
    console.error("Payment Note Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
