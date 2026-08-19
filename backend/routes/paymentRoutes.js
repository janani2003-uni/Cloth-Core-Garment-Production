const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");

const router = express.Router();
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { uploadPaymentProof, handleUpload, toWebPath } = require("../middleware/upload");

router.use(verifyToken);

const canView = requireRole("admin", "supervisor");

function round2(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

function cleanupUploadedFile(req) {
  if (req.file) fs.unlink(req.file.path, () => {});
}

// Shop owner submits a payment for verification. Always multipart/form-data
// (even when there's no file to attach) so the same route handles both
// Card Payment and Online Bank Transfer without two separate code paths.
// The stage (Advance/Final) and the minimum amount required are always
// computed here from the order's own real, saved totals and its real
// Verified-payment history — never trusted from the request body. The shop
// owner may submit more than that minimum (up to the order's remaining
// total, so they can pay the advance and the rest in one go) but never
// less, and never skip the mandatory advance via a direct API call.
router.post("/", handleUpload(uploadPaymentProof, "proofFile"), async (req, res) => {
  try {
    const { orderId, shopId, paymentMethod, amount, cardLast4 } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      cleanupUploadedFile(req);
      return res.status(400).json({ success: false, message: "A valid orderId is required" });
    }

    if (!["Card Payment", "Online Bank Transfer"].includes(paymentMethod)) {
      cleanupUploadedFile(req);
      return res.status(400).json({ success: false, message: "Payment method must be Card Payment or Online Bank Transfer." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      cleanupUploadedFile(req);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = order.userId && String(order.userId) === String(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      cleanupUploadedFile(req);
      return res.status(403).json({ success: false, message: "You do not have access to this order" });
    }

    if (order.approval?.status !== "Approved" && order.approval?.status !== "Not Required") {
      cleanupUploadedFile(req);
      return res.status(409).json({ success: false, message: "This order must be approved before it can be paid." });
    }

    // Recompute the real outstanding balance fresh from Verified payments —
    // never from order.amountPaid alone, so a payment can't be recorded
    // twice against the same stage due to a stale client read.
    const verifiedPayments = await Payment.find({ orderId: order._id, status: "Verified" });
    const amountPaidSoFar = round2(verifiedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0));
    const advanceAmount = Number(order.advanceAmount || 0);
    const totalAmount = Number(order.totalAmount || 0);

    let stage;
    let amountDue;

    if (amountPaidSoFar < advanceAmount) {
      stage = "Advance";
      amountDue = round2(advanceAmount - amountPaidSoFar);
    } else if (amountPaidSoFar < totalAmount) {
      // The remaining 50% is no longer gated on production being complete —
      // a shop owner may choose to pay it off early if they want to.
      stage = "Final";
      amountDue = round2(totalAmount - amountPaidSoFar);
    } else {
      cleanupUploadedFile(req);
      return res.status(400).json({ success: false, message: "This order is already fully paid." });
    }

    const submittedAmount = round2(Number(amount));
    const maxPayable = round2(totalAmount - amountPaidSoFar);
    // Minimum enforced (can't pay less than what's currently due, and can't
    // skip the advance), but the shop owner is free to pay more than that
    // minimum — up to the full remaining total — in a single payment. A
    // 0.5 (paise-level) tolerance absorbs float drift at the boundaries,
    // not user editing.
    if (!submittedAmount || submittedAmount < amountDue - 0.5) {
      cleanupUploadedFile(req);
      return res.status(400).json({ success: false,
        message: `The amount must be at least Rs. ${amountDue.toFixed(2)} (the ${stage.toLowerCase()} payment currently due).`,
      });
    }
    if (submittedAmount > maxPayable + 0.5) {
      cleanupUploadedFile(req);
      return res.status(400).json({ success: false,
        message: `The amount cannot exceed the remaining order total of Rs. ${maxPayable.toFixed(2)}.`,
      });
    }

    if (paymentMethod === "Online Bank Transfer" && !req.file) {
      return res.status(400).json({ success: false, message: "Payment proof (JPG, PNG or PDF) is required for Online Bank Transfer." });
    }

    // Card Payment: only the last 4 digits are ever accepted/stored, purely
    // for the shop owner's own reference — never the full number, CVV, or
    // expiry. This is the project's existing academic/demo-safe non-storage
    // approach, not real card processing.
    const sanitizedCardLast4 =
      paymentMethod === "Card Payment" && /^\d{4}$/.test(String(cardLast4 || "").trim())
        ? String(cardLast4).trim()
        : "";

    const proofFile = req.file ? toWebPath(req.file, "payment-proofs") : "";

    const payment = await Payment.create({
      orderId,
      shopId: shopId || undefined,
      stage,
      paymentMethod,
      amount: submittedAmount,
      proofFile,
      cardLast4: sanitizedCardLast4,
    });

    await Notification.create({
      title: "Payment Submitted",
      message: `A ${stage.toLowerCase()} payment of Rs. ${submittedAmount.toFixed(2)} was submitted for order ${order.orderId}, pending verification.`,
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
    cleanupUploadedFile(req);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin/Supervisor: list all payments (Supervisor is view/flag-only — no
// verify/reject route below allows anything but Admin)
router.get("/", canView, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("orderId", "orderId customerName customerEmail item totalAmount paymentStatus advanceAmount remainingBalance")
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

// Admin: verify a payment — the only place order.paymentStatus/amountPaid/
// remainingBalance advance. Always recomputed from the full, real set of
// Verified payments against this order (not just the one being verified
// right now), so it can never drift out of sync no matter the order
// payments are verified in.
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
      const order = await Order.findById(payment.orderId);
      if (order) {
        const verifiedPayments = await Payment.find({ orderId: order._id, status: "Verified" });
        const amountPaid = round2(verifiedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0));
        const totalAmount = Number(order.totalAmount || 0);
        const remainingBalance = Math.max(0, round2(totalAmount - amountPaid));

        let paymentStatus = "Pending";
        if (totalAmount > 0 && amountPaid >= totalAmount) paymentStatus = "Full Paid";
        else if (amountPaid > 0) paymentStatus = "Advance Paid";

        order.amountPaid = amountPaid;
        order.remainingBalance = remainingBalance;
        order.paymentStatus = paymentStatus;
        await order.save();
        updatedOrder = order;
      }
    }

    await Notification.create({
      title: "Payment Verified",
      message: `A ${payment.stage?.toLowerCase() || ""} payment of Rs. ${Number(payment.amount).toFixed(2)} was verified.`,
      type: "payment",
      relatedId: payment._id,
      relatedModel: "Payment",
      recipientId: updatedOrder?.userId || null,
    });

    await logActivity({
      actor: req.user,
      action: "payment.verified",
      message: `Verified a ${payment.stage || ""} payment of Rs. ${payment.amount} for order ${updatedOrder?.orderId || ""}`,
      targetType: "Payment",
      targetId: payment._id,
    });

    return res.status(200).json({ success: true, message: "Payment verified", payment, order: updatedOrder });
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
      message: `A submitted payment of Rs. ${Number(payment.amount).toFixed(2)} was rejected.`,
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
        message: `A payment of Rs. ${Number(payment.amount).toFixed(2)} was flagged for review${flaggedReason ? `: ${flaggedReason}` : "."}`,
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
