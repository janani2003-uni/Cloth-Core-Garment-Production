const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

// GET all Admin-facing (global/broadcast) notifications
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: null })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);

    res.status(500).json({ success: false,
      message: "Could not load notifications.",
      error: error.message,
    });
  }
});

// GET the current user's own notifications (any logged-in role, including
// Admin, who also sees their personal ones here rather than the broadcast
// feed above)
router.get("/mine", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get My Notifications Error:", error);

    res.status(500).json({ success: false,
      message: "Could not load notifications.",
      error: error.message,
    });
  }
});

// GET unread count for the current user — Admins get the broadcast feed's
// unread count, everyone else gets their own.
router.get("/unread-count", async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { recipientId: null, isRead: false }
        : { recipientId: req.user.id, isRead: false };

    const count = await Notification.countDocuments(filter);

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Get Unread Count Error:", error);

    res.status(500).json({ success: false,
      message: "Could not load unread count.",
      error: error.message,
    });
  }
});

// MARK one notification as read (owner of a personal one, or Admin for a
// broadcast one)
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false,
        message: "Notification not found.",
      });
    }

    const isOwnNotification =
      notification.recipientId &&
      String(notification.recipientId) === String(req.user.id);
    const isAdminBroadcast = !notification.recipientId && req.user.role === "admin";

    if (!isOwnNotification && !isAdminBroadcast) {
      return res.status(403).json({ success: false,
        message: "You do not have access to this notification.",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    res.status(500).json({ success: false,
      message: "Could not update notification.",
      error: error.message,
    });
  }
});

// MARK all of the current user's notifications as read (Admin = broadcast
// feed, everyone else = their own)
router.put("/read-all", async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { recipientId: null, isRead: false }
        : { recipientId: req.user.id, isRead: false };

    await Notification.updateMany(filter, { isRead: true });

    res.status(200).json({ success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);

    res.status(500).json({ success: false,
      message: "Could not update notifications.",
      error: error.message,
    });
  }
});

// DELETE one notification (owner, or Admin for a broadcast one)
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false,
        message: "Notification not found.",
      });
    }

    const isOwnNotification =
      notification.recipientId &&
      String(notification.recipientId) === String(req.user.id);
    const isAdminBroadcast = !notification.recipientId && req.user.role === "admin";

    if (!isOwnNotification && !isAdminBroadcast) {
      return res.status(403).json({ success: false,
        message: "You do not have access to this notification.",
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);

    res.status(500).json({ success: false,
      message: "Could not delete notification.",
      error: error.message,
    });
  }
});

// DELETE all of the current user's notifications (Admin = broadcast feed,
// everyone else = their own)
router.delete("/", async (req, res) => {
  try {
    const filter =
      req.user.role === "admin" ? { recipientId: null } : { recipientId: req.user.id };

    await Notification.deleteMany(filter);

    res.status(200).json({ success: true,
      message: "All notifications cleared.",
    });
  } catch (error) {
    console.error("Clear Notifications Error:", error);

    res.status(500).json({ success: false,
      message: "Could not clear notifications.",
      error: error.message,
    });
  }
});

module.exports = router;
