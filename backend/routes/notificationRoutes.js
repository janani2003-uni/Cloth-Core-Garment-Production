const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

// GET all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);

    res.status(500).json({
      message: "Could not load notifications.",
      error: error.message,
    });
  }
});

// MARK one notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    res.status(500).json({
      message: "Could not update notification.",
      error: error.message,
    });
  }
});

// MARK all notifications as read
router.put("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);

    res.status(500).json({
      message: "Could not update notifications.",
      error: error.message,
    });
  }
});

// DELETE one notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);

    res.status(500).json({
      message: "Could not delete notification.",
      error: error.message,
    });
  }
});

// DELETE all notifications
router.delete("/", async (req, res) => {
  try {
    await Notification.deleteMany({});

    res.status(200).json({
      message: "All notifications cleared.",
    });
  } catch (error) {
    console.error("Clear Notifications Error:", error);

    res.status(500).json({
      message: "Could not clear notifications.",
      error: error.message,
    });
  }
});

module.exports = router;