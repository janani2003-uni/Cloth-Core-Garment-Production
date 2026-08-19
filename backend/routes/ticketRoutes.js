const express = require("express");
const router = express.Router();

const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

function isOwnerOrAdmin(ticket, user) {
  return user.role === "admin" || String(ticket.shopOwnerId) === String(user.id);
}

// Shop Owner: raise a new support ticket
router.post("/", async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject and message are required" });
    }

    const ticket = await Ticket.create({
      shopOwnerId: req.user.id,
      subject: subject.trim(),
      message: message.trim(),
    });

    await Notification.create({
      title: "New Support Ticket",
      message: `A new support ticket was raised: "${ticket.subject}"`,
      type: "ticket",
      relatedId: ticket._id,
      relatedModel: "Ticket",
    });

    await logActivity({
      actor: req.user,
      action: "ticket.created",
      message: `Raised a support ticket: "${ticket.subject}"`,
      targetType: "Ticket",
      targetId: ticket._id,
    });

    return res.status(201).json({ success: true, message: "Support ticket submitted", data: ticket });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// The current user's own tickets
router.get("/mine", async (req, res) => {
  try {
    const tickets = await Ticket.find({ shopOwnerId: req.user.id }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Get My Tickets Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: list all tickets
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const tickets = await Ticket.find(filter)
      .populate("shopOwnerId", "firstName lastName email shopName")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Get Tickets Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// View a single ticket (owner or Admin)
router.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "shopOwnerId",
      "firstName lastName email shopName"
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (!isOwnerOrAdmin(ticket, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have access to this ticket" });
    }

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Get Ticket Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Reply to a ticket (owner or Admin)
router.post("/:id/reply", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Reply message is required" });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (!isOwnerOrAdmin(ticket, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have access to this ticket" });
    }

    ticket.replies.push({
      fromId: req.user.id,
      fromRole: req.user.role,
      message: message.trim(),
    });

    const isAdminReply = req.user.role === "admin";

    // An Admin reply naturally moves a fresh ticket forward; it doesn't
    // override a status an Admin has deliberately already set otherwise.
    if (isAdminReply && ticket.status === "Open") {
      ticket.status = "In Progress";
    }

    await ticket.save();

    await Notification.create({
      title: isAdminReply ? "Support Reply Received" : "Shop Owner Replied",
      message: `New reply on ticket "${ticket.subject}"`,
      type: "ticket",
      relatedId: ticket._id,
      relatedModel: "Ticket",
      recipientId: isAdminReply ? ticket.shopOwnerId : null,
    });

    await logActivity({
      actor: req.user,
      action: "ticket.replied",
      message: `Replied to ticket "${ticket.subject}"`,
      targetType: "Ticket",
      targetId: ticket._id,
    });

    return res.status(200).json({ success: true, message: "Reply added", data: ticket });
  } catch (error) {
    console.error("Reply Ticket Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: update ticket status
router.put("/:id/status", requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Open", "In Progress", "Resolved", "Closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    await Notification.create({
      title: "Ticket Status Updated",
      message: `Your support ticket "${ticket.subject}" is now "${ticket.status}".`,
      type: "ticket",
      relatedId: ticket._id,
      relatedModel: "Ticket",
      recipientId: ticket.shopOwnerId,
    });

    await logActivity({
      actor: req.user,
      action: "ticket.status_changed",
      message: `Changed ticket "${ticket.subject}" status to "${ticket.status}"`,
      targetType: "Ticket",
      targetId: ticket._id,
    });

    return res.status(200).json({ success: true, message: "Ticket status updated", data: ticket });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
