const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Staff = require("../models/Staff");
const User = require("../models/User");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } = require("../utils/passwordPolicy");

// Admin and Supervisor can both manage the staff roster (Supervisors need
// this to know who they're assigning production work to); deleting a staff
// record and every login-account action below stay Admin-only, gated
// separately per-route.
router.use(verifyToken, requireRole("admin", "supervisor"));

// The frontend table has always sent Mongo `_id` values in these URLs
// (`${API_URL}/${member._id}`), but the handlers only ever looked staff up
// by the human-readable `staffId` field — meaning View/Edit/Delete/status
// actions have been silently 404ing. Accepting either fixes that and stays
// backward compatible with any caller that does pass the staffId string.
async function findStaffByIdParam(idParam) {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const byMongoId = await Staff.findById(idParam);
    if (byMongoId) return byMongoId;
  }
  return Staff.findOne({ staffId: idParam });
}

// GET all staff — includes the linked login account's email/isActive (not
// the password) so the frontend can show account status without a second
// round-trip per row.
router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate("userId", "email isActive role")
      .sort({ createdAt: -1 });

    return res.status(200).json(staff);
  } catch (error) {
    console.error("Get Staff Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// GET one staff member by Mongo _id or staffId
router.get("/:staffId", async (req, res) => {
  try {
    const staff = await findStaffByIdParam(req.params.staffId).then((doc) =>
      doc ? doc.populate("userId", "email isActive role") : doc
    );

    if (!staff) {
      return res.status(404).json({ success: false,
        message: "Staff member not found",
      });
    }

    return res.status(200).json(staff);
  } catch (error) {
    console.error("Get Staff Member Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// CREATE staff member
router.post("/", async (req, res) => {
  try {
    const {
      staffId,
      name,
      department,
      position,
      phone,
      email,
      joiningDate,
      address,
      emergencyContact,
      notes,
      status,
    } = req.body;

    if (!staffId || !name || !department || !phone) {
      return res.status(400).json({ success: false,
        message: "Please fill in all required staff fields",
      });
    }

    const existingStaff = await Staff.findOne({
      staffId: staffId.trim(),
    });

    if (existingStaff) {
      return res.status(400).json({ success: false,
        message: "Staff ID already exists",
      });
    }

    const staff = new Staff({
      staffId: staffId.trim(),
      name: name.trim(),
      department: department.trim(),
      position: position?.trim() || "",
      phone: phone.trim(),
      email: email?.trim().toLowerCase() || "",
      joiningDate: joiningDate || null,
      address: address?.trim() || "",
      emergencyContact: emergencyContact?.trim() || "",
      notes: notes?.trim() || "",
      status: status || "On Duty",
    });

    await staff.save();

    await logActivity({
      actor: req.user,
      action: "staff.created",
      message: `Added staff member "${staff.name}" (${staff.staffId})`,
      targetType: "Staff",
      targetId: staff._id,
    });

    return res.status(201).json({ success: true,
      message: "Staff added successfully",
      staff,
    });
  } catch (error) {
    console.error("Add Staff Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// UPDATE staff member by Mongo _id or staffId
router.put("/:staffId", async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "department",
      "position",
      "phone",
      "email",
      "joiningDate",
      "address",
      "emergencyContact",
      "notes",
      "status",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const existing = await findStaffByIdParam(req.params.staffId);

    if (!existing) {
      return res.status(404).json({ success: false,
        message: "Staff member not found",
      });
    }

    const staff = await Staff.findByIdAndUpdate(existing._id, updates, {
      new: true,
      runValidators: true,
    });

    await logActivity({
      actor: req.user,
      action: "staff.updated",
      message: `Updated staff member "${staff.name}" (${staff.staffId})`,
      targetType: "Staff",
      targetId: staff._id,
    });

    return res.status(200).json({ success: true,
      message: "Staff updated successfully",
      staff,
    });
  } catch (error) {
    console.error("Update Staff Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Create Login Account — Admin only. Creates a "supervisor"-role User
// linked to this Staff record. This is the ONLY path in the system that
// creates a supervisor account (see authRoutes.js: public registration is
// hardcoded to shopOwner, and the generic admin user-management endpoints
// explicitly reject role "supervisor").
// ==========================
router.post("/:staffId/create-account", requireRole("admin"), async (req, res) => {
  let createdUser = null;

  try {
    const staff = await findStaffByIdParam(req.params.staffId);

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    if (staff.userId) {
      return res.status(400).json({ success: false, message: "A login account already exists for this staff member." });
    }

    const { email, password, confirmPassword } = req.body;
    const finalEmail = (email || staff.email || "").trim().toLowerCase();

    if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, message: PASSWORD_REQUIREMENTS_MESSAGE });
    }

    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account already exists with this email address." });
    }

    // User.firstName/lastName are required — Staff only has a single `name`
    // field, so split it on the first space.
    const nameParts = staff.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || nameParts[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    // Mongo transactions need a replica-set-backed deployment, which isn't
    // guaranteed here — instead: create the User first, then link it to
    // Staff, and roll the User back manually if the link step fails, so we
    // never leave an orphan login account behind.
    createdUser = await User.create({
      firstName,
      lastName,
      email: finalEmail,
      shopName: "ClothCore",
      password: hashedPassword,
      role: "supervisor",
      status: "Active",
      isActive: true,
      staffId: staff._id,
    });

    staff.userId = createdUser._id;
    if (!staff.email) staff.email = finalEmail;
    staff.accountCreatedAt = new Date();
    staff.accountCreatedBy = req.user.id;
    await staff.save();

    await logActivity({
      actor: req.user,
      action: "staff.account_created",
      message: `Created a Supervisor login account for staff member "${staff.name}" (${staff.staffId})`,
      targetType: "Staff",
      targetId: staff._id,
    });

    const safeStaff = await Staff.findById(staff._id).populate("userId", "email isActive role");

    return res.status(201).json({ success: true,
      message: "Supervisor account created successfully.",
      data: { staff: safeStaff },
    });
  } catch (error) {
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }

    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "An account already exists with this email address." });
    }

    console.error("Create Staff Account Error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// ==========================
// Reset Password — Admin only. Resets the linked Supervisor's login
// password without revealing the old one.
// ==========================
router.patch("/:staffId/reset-password", requireRole("admin"), async (req, res) => {
  try {
    const staff = await findStaffByIdParam(req.params.staffId);

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    if (!staff.userId) {
      return res.status(400).json({ success: false, message: "This staff member does not have a login account yet." });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required." });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({ success: false, message: PASSWORD_REQUIREMENTS_MESSAGE });
    }

    const user = await User.findById(staff.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Linked login account not found." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    await user.save();

    await logActivity({
      actor: req.user,
      action: "staff.password_reset",
      message: `Reset the login password for staff member "${staff.name}" (${staff.staffId})`,
      targetType: "Staff",
      targetId: staff._id,
    });

    return res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset Staff Password Error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// ==========================
// Disable / Enable Account — Admin only. Flips the linked User's isActive
// flag without deleting the Staff profile or the login record itself.
// ==========================
router.patch("/:staffId/disable-account", requireRole("admin"), async (req, res) => {
  try {
    const staff = await findStaffByIdParam(req.params.staffId);

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    if (!staff.userId) {
      return res.status(400).json({ success: false, message: "This staff member does not have a login account yet." });
    }

    const user = await User.findById(staff.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Linked login account not found." });
    }

    const nextIsActive = req.body?.isActive !== undefined ? !!req.body.isActive : false;
    user.isActive = nextIsActive;
    await user.save();

    await logActivity({
      actor: req.user,
      action: nextIsActive ? "staff.account_enabled" : "staff.account_disabled",
      message: `${nextIsActive ? "Enabled" : "Disabled"} the login account for staff member "${staff.name}" (${staff.staffId})`,
      targetType: "Staff",
      targetId: staff._id,
    });

    return res.status(200).json({ success: true,
      message: nextIsActive ? "Account enabled." : "Account disabled.",
      data: { isActive: user.isActive },
    });
  } catch (error) {
    console.error("Toggle Staff Account Error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// DELETE staff member by Mongo _id or staffId (Admin only — Supervisors can
// create/edit staff but not remove records)
router.delete("/:staffId", requireRole("admin"), async (req, res) => {
  try {
    const existing = await findStaffByIdParam(req.params.staffId);

    if (!existing) {
      return res.status(404).json({ success: false,
        message: "Staff member not found",
      });
    }

    const staff = await Staff.findByIdAndDelete(existing._id);

    await logActivity({
      actor: req.user,
      action: "staff.deleted",
      message: `Deleted staff member "${staff.name}" (${staff.staffId})`,
      targetType: "Staff",
      targetId: staff._id,
    });

    return res.status(200).json({ success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    console.error("Delete Staff Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

module.exports = router;
