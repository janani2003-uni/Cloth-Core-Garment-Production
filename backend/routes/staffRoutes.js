const express = require("express");
const router = express.Router();

const Staff = require("../models/Staff");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Admin and Supervisor can both manage the staff roster (Supervisors need
// this to know who they're assigning production work to); deleting a staff
// record stays Admin-only, gated separately below.
router.use(verifyToken, requireRole("admin", "supervisor"));

// GET all staff
router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    return res.status(200).json(staff);
  } catch (error) {
    console.error("Get Staff Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// GET one staff member by staffId
router.get("/:staffId", async (req, res) => {
  try {
    const staff = await Staff.findOne({
      staffId: req.params.staffId,
    });

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
      attendance,
      status,
    } = req.body;

    if (!staffId || !name || !department || !position || !phone) {
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
      position: position.trim(),
      phone: phone.trim(),
      attendance: attendance || "Present",
      status: status || "Active",
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

// UPDATE staff member by staffId
router.put("/:staffId", async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "department",
      "position",
      "phone",
      "attendance",
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

    const staff = await Staff.findOneAndUpdate(
      {
        staffId: req.params.staffId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!staff) {
      return res.status(404).json({ success: false,
        message: "Staff member not found",
      });
    }

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

// DELETE staff member by staffId (Admin only — Supervisors can create/edit
// staff but not remove records)
router.delete("/:staffId", requireRole("admin"), async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({
      staffId: req.params.staffId,
    });

    if (!staff) {
      return res.status(404).json({ success: false,
        message: "Staff member not found",
      });
    }

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