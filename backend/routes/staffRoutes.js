const express = require("express");
const router = express.Router();

const Staff = require("../models/Staff");

// GET all staff
router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    return res.status(200).json(staff);
  } catch (error) {
    console.error("Get Staff Error:", error);

    return res.status(500).json({
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
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    return res.status(200).json(staff);
  } catch (error) {
    console.error("Get Staff Member Error:", error);

    return res.status(500).json({
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
      return res.status(400).json({
        message: "Please fill in all required staff fields",
      });
    }

    const existingStaff = await Staff.findOne({
      staffId: staffId.trim(),
    });

    if (existingStaff) {
      return res.status(400).json({
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

    return res.status(201).json({
      message: "Staff added successfully",
      staff,
    });
  } catch (error) {
    console.error("Add Staff Error:", error);

    return res.status(500).json({
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
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    return res.status(200).json({
      message: "Staff updated successfully",
      staff,
    });
  } catch (error) {
    console.error("Update Staff Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE staff member by staffId
router.delete("/:staffId", async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({
      staffId: req.params.staffId,
    });

    if (!staff) {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    return res.status(200).json({
      message: "Staff deleted successfully",
    });
  } catch (error) {
    console.error("Delete Staff Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;