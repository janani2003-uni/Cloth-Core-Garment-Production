const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const AdminAccessCode = require("../models/AdminAccessCode");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Every route here is Admin-only — this is the whole access control for a
// collection that's stored in plaintext (see the model for why).
router.use(verifyToken, requireRole("admin"));

function generateCode() {
  // 10 chars, uppercase alphanumeric, easy to read/share out loud.
  return crypto.randomBytes(8).toString("hex").toUpperCase().slice(0, 10);
}

// GET /api/admin-codes — list all codes
router.get("/", async (req, res) => {
  try {
    const codes = await AdminAccessCode.find()
      .populate("createdBy", "firstName lastName email")
      .populate("usageHistory.userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: codes });
  } catch (error) {
    console.error("Get Admin Codes Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin-codes — create a new code (auto-generated unless one is given)
router.post("/", async (req, res) => {
  try {
    const { code, label } = req.body;
    const finalCode = (code?.trim() || generateCode()).toUpperCase();

    const existing = await AdminAccessCode.findOne({ code: finalCode });
    if (existing) {
      return res.status(400).json({ success: false, message: "That code already exists" });
    }

    const created = await AdminAccessCode.create({
      code: finalCode,
      label: label?.trim() || "",
      createdBy: req.user.id,
    });

    await logActivity({
      actor: req.user,
      action: "admin_code.created",
      message: `Created a new admin access code${label ? ` ("${label}")` : ""}`,
      targetType: "AdminAccessCode",
      targetId: created._id,
    });

    return res.status(201).json({ success: true, message: "Admin access code created", data: created });
  } catch (error) {
    console.error("Create Admin Code Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin-codes/:id — toggle active/inactive or update the label
router.patch("/:id", async (req, res) => {
  try {
    const { isActive, label } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = !!isActive;
    if (label !== undefined) updates.label = label.trim();

    const updated = await AdminAccessCode.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Admin access code not found" });
    }

    await logActivity({
      actor: req.user,
      action: "admin_code.updated",
      message: `${updates.isActive === false ? "Deactivated" : updates.isActive === true ? "Reactivated" : "Updated"} an admin access code`,
      targetType: "AdminAccessCode",
      targetId: updated._id,
    });

    return res.status(200).json({ success: true, message: "Admin access code updated", data: updated });
  } catch (error) {
    console.error("Update Admin Code Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin-codes/:id — permanently remove a code
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await AdminAccessCode.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Admin access code not found" });
    }

    await logActivity({
      actor: req.user,
      action: "admin_code.deleted",
      message: "Deleted an admin access code",
      targetType: "AdminAccessCode",
      targetId: deleted._id,
    });

    return res.status(200).json({ success: true, message: "Admin access code deleted" });
  } catch (error) {
    console.error("Delete Admin Code Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
