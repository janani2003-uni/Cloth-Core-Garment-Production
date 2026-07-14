const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const User = require("../models/User");
const Notification = require("../models/Notification");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==========================
// Register
// ==========================
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      factoryName,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !factoryName ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      factoryName: factoryName.trim(),
      password,
      role: "User",
      status: "Active",
    });

    await user.save();

    return res.status(201).json({
      message: "Registration Successful",
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Login
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || user.password !== password) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      factoryName: user.factoryName,
      role: user.role || "User",
      status: user.status || "Active",
      joinedDate: user.joinedDate,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      message: "Login Successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Get All Users
// ==========================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Get One User
// ==========================
router.get("/users/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id).select(
      "-password -otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Create User - Admin
// ==========================
router.post("/users", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      factoryName,
      password,
      role,
      status,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !factoryName ||
      !password
    ) {
      return res.status(400).json({
        message:
          "First name, last name, email, factory name and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      factoryName: factoryName.trim(),
      password,
      role: role?.trim() || "User",
      status: status?.trim() || "Active",
    });

    await newUser.save();
    await Notification.create({
  title: "New User Registered",
  message: `${newUser.firstName} ${newUser.lastName} created a new account.`,
  type: "user",
  relatedId: newUser._id,
  relatedModel: "User",
  isRead: false,
});


    const safeUser = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      factoryName: newUser.factoryName,
      role: newUser.role,
      status: newUser.status,
      lastLogin: newUser.lastLogin,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Create User Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Update User
// ==========================
router.put("/users/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "factoryName",
      "role",
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

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields were provided for update",
      });
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();

      const emailOwner = await User.findOne({
        email: updates.email,
        _id: { $ne: req.params.id },
      });

      if (emailOwner) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -otp -otpExpiry");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Delete User
// ==========================
router.delete("/users/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const deletedUser = await User.findByIdAndDelete(
      req.params.id
    );

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Verify OTP
// ==========================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    return res.status(200).json({
      message: "OTP Verified Successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// Reset Password
// ==========================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message:
          "Email, OTP and new password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password Reset Successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;