const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Sample = require("../models/Sample");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

// Admin: create/upload a sample for an order
router.post("/", requireRole("admin", "supervisor"), async (req, res) => {
  try {
    const { orderId, imageUrl, notes } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "A valid orderId is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const existing = await Sample.findOne({ orderId });

    if (existing) {
      return res.status(400).json({ success: false, message: "A sample already exists for this order" });
    }

    const sample = await Sample.create({
      orderId,
      imageUrl: imageUrl || "",
      notes: notes?.trim() || "",
      status: "Awaiting Shop Approval",
    });

    await Notification.create({
      title: "Sample Ready for Review",
      message: `A sample is ready for review on order ${order.orderId}.`,
      type: "order",
      relatedId: sample._id,
      relatedModel: "Sample",
      recipientId: order.userId || null,
    });

    return res.status(201).json({ success: true, message: "Sample created", sample });
  } catch (error) {
    console.error("Create Sample Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Sample for a specific order — the order's own shop owner, or
// Admin/Supervisor/Staff monitoring production, may view it.
router.get("/order/:orderId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    if (!["admin", "supervisor"].includes(req.user.role)) {
      const order = await Order.findById(req.params.orderId);
      if (!order || !order.userId || String(order.userId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: "You do not have access to this order's sample" });
      }
    }

    const sample = await Sample.findOne({ orderId: req.params.orderId });

    if (!sample) {
      return res.status(404).json({ success: false, message: "No sample for this order yet" });
    }

    return res.status(200).json(sample);
  } catch (error) {
    console.error("Get Order Sample Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: update sample notes/image/status
router.put("/:id", requireRole("admin", "supervisor"), async (req, res) => {
  try {
    const allowedFields = ["imageUrl", "notes", "status"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const sample = await Sample.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!sample) {
      return res.status(404).json({ success: false, message: "Sample not found" });
    }

    return res.status(200).json({ success: true, message: "Sample updated", sample });
  } catch (error) {
    console.error("Update Sample Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Only the shop owner who placed the linked order (or Admin) may
// approve/request a revision — Supervisor and other shop owners must not.
async function assertOwnsSample(sample, user) {
  if (user.role === "admin") return true;
  const order = await Order.findById(sample.orderId);
  return !!order && !!order.userId && String(order.userId) === String(user.id);
}

// Shop owner: approve the sample
router.put("/:id/approve", async (req, res) => {
  try {
    const existing = await Sample.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Sample not found" });
    }

    if (!(await assertOwnsSample(existing, req.user))) {
      return res.status(403).json({ success: false, message: "You do not have access to this sample" });
    }

    const sample = await Sample.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );

    await Notification.create({
      title: "Sample Approved",
      message: `The shop approved the sample for an order.`,
      type: "order",
      relatedId: sample._id,
      relatedModel: "Sample",
    });

    return res.status(200).json({ success: true, message: "Sample approved", sample });
  } catch (error) {
    console.error("Approve Sample Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Shop owner: request a revision
router.put("/:id/request-revision", async (req, res) => {
  try {
    const { comment } = req.body;

    const existing = await Sample.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Sample not found" });
    }

    if (!(await assertOwnsSample(existing, req.user))) {
      return res.status(403).json({ success: false, message: "You do not have access to this sample" });
    }

    const sample = await Sample.findByIdAndUpdate(
      req.params.id,
      { status: "Revision Requested", shopComment: comment?.trim() || "" },
      { new: true }
    );

    await Notification.create({
      title: "Sample Revision Requested",
      message: `The shop requested a revision on a sample.`,
      type: "order",
      relatedId: sample._id,
      relatedModel: "Sample",
    });

    return res.status(200).json({ success: true, message: "Revision requested", sample });
  } catch (error) {
    console.error("Request Sample Revision Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
