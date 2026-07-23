const express = require("express");
const router = express.Router();

const ActivityLog = require("../models/ActivityLog");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken, requireRole("admin"));

// GET /api/activity-logs?targetType=&limit=
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.targetType) {
      filter.targetType = req.query.targetType;
    }

    const limit = Math.min(Number(req.query.limit) || 100, 300);

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Get Activity Logs Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
