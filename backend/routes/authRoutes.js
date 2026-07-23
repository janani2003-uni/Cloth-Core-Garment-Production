const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const User = require("../models/User");
const Shop = require("../models/Shop");
const Notification = require("../models/Notification");
const AdminAccessCode = require("../models/AdminAccessCode");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
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
      return res.status(400).json({ success: false,
        message: "Please fill in all required fields",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({ success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

const user = new User({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    factoryName: factoryName.trim(),
    password: hashedPassword,
    role: "shopOwner",
    status: "Active",
});

    await user.save();

    return res.status(201).json({ success: true,
      message: "Registration Successful",
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});


// ==========================
// Login
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
  return res.status(400).json({ success: false,
    message: "Invalid Email or Password",
  });
}

let isPasswordCorrect = false;

const passwordIsHashed =
  typeof user.password === "string" &&
  user.password.startsWith("$2");

if (passwordIsHashed) {
  isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );
} else {
  isPasswordCorrect = user.password === password;

  if (isPasswordCorrect) {
    user.password = await bcrypt.hash(password, 10);
  }
}

if (!isPasswordCorrect) {
  return res.status(400).json({ success: false,
    message: "Invalid Email or Password",
  });
}

    // Optional: promote to Admin if a valid admin access code was submitted
    // alongside normal credentials. Both factors are required — the code
    // alone never bypasses proving account ownership via the real password.
    if (adminCode && adminCode.trim()) {
      const matchedCode = await AdminAccessCode.findOne({
        code: adminCode.trim().toUpperCase(),
        isActive: true,
      });

      if (!matchedCode) {
        return res.status(403).json({ success: false,
          message: "Invalid or inactive admin access code.",
        });
      }

      if (user.role !== "admin") {
        const previousRole = user.role;
        user.role = "admin";

        matchedCode.usageHistory.push({ userId: user._id, usedAt: new Date() });
        await matchedCode.save();

        await logActivity({
          actor: { id: user._id, role: "admin" },
          action: "user.promoted_to_admin",
          message: `${user.firstName} ${user.lastName}'s account was converted from "${previousRole}" to Admin via an admin access code at login`,
          targetType: "User",
          targetId: user._id,
        });
      }
    }

    user.lastLogin = new Date();
    await user.save();

    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      factoryName: user.factoryName,
      role: user.role || "user",
      status: user.status || "Active",
      joinedDate: user.joinedDate,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = jwt.sign(
      { id: user._id, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ success: true,
      message: "Login Successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Get my own profile
// ==========================
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Update my own profile
// ==========================
router.put("/me", verifyToken, async (req, res) => {
  try {
    // Role, status, email and employeeId/department (operational identity)
    // are intentionally excluded — a user can never change their own role
    // or employee metadata, only contact details and preferences.
    const allowedFields = ["firstName", "lastName", "factoryName", "phone"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    });

    if (req.body.notificationPreferences && typeof req.body.notificationPreferences === "object") {
      const prefFields = ["orderUpdates", "productionAlerts", "deliveryAlerts", "paymentAlerts", "reminders"];
      updates.notificationPreferences = {};
      prefFields.forEach((field) => {
        if (req.body.notificationPreferences[field] !== undefined) {
          updates.notificationPreferences[field] = !!req.body.notificationPreferences[field];
        }
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields were provided for update" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update Me Error:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Change my own password
// ==========================
router.put("/me/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isCorrect) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Get All Users
// ==========================
router.get("/users", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Get Shop Owner accounts (read-only) — a narrower view than /users,
// available to Supervisor as well as Admin. Supervisors get visibility into
// shop owners and their shop's approval status, but never the full
// Admin/Staff/Supervisor account list or any create/edit/delete capability.
// ==========================
router.get("/shop-owners", verifyToken, requireRole("admin", "supervisor"), async (req, res) => {
  try {
    const shopOwners = await User.find({ role: "shopOwner" })
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    const shops = await Shop.find({ ownerId: { $in: shopOwners.map((u) => u._id) } });
    const shopByOwnerId = new Map(shops.map((s) => [String(s.ownerId), s]));

    const data = shopOwners.map((user) => {
      const shop = shopByOwnerId.get(String(user._id));
      return {
        ...user.toObject(),
        shop: shop
          ? {
              shopName: shop.shopName,
              approvalStatus: shop.approvalStatus,
              isActive: shop.isActive,
              shopCode: shop.shopCode,
            }
          : null,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Shop Owners Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// Get One User
// ==========================
router.get("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id).select(
      "-password -otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json({ success: false,
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Create User - Admin
// ==========================
router.post("/users", verifyToken, requireRole("admin"), async (req, res) => {
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
      return res.status(400).json({ success: false,
        message:
          "First name, last name, email, factory name and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({ success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    factoryName: factoryName.trim(),
    password: hashedPassword,
    role: role?.trim() || "user",
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

    await logActivity({
      actor: req.user,
      action: "user.created",
      message: `Created user account for ${newUser.firstName} ${newUser.lastName} (${newUser.role})`,
      targetType: "User",
      targetId: newUser._id,
    });

    return res.status(201).json({ success: true,
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Create User Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Update User
// ==========================
router.put("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false,
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
      return res.status(400).json({ success: false,
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
        return res.status(400).json({ success: false,
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
      return res.status(404).json({ success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({ success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Delete User
// ==========================
router.delete("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false,
        message: "Invalid user ID",
      });
    }

    const deletedUser = await User.findByIdAndDelete(
      req.params.id
    );

    if (!deletedUser) {
      return res.status(404).json({ success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({ success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// Forgot Password
// ==========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({ success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "ClothCore Password Reset Code",
      text: `Your ClothCore password reset code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your ClothCore password reset code is:</p><h2>${otp}</h2><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
    });

    return res.status(200).json({ success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({ success: false,
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
      return res.status(400).json({ success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({ success: false,
        message: "User not found",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ success: false,
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false,
        message: "OTP has expired",
      });
    }

    return res.status(200).json({ success: true,
      message: "OTP Verified Successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({ success: false,
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
      return res.status(400).json({ success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({ success: false,
        message: "User not found",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ success: false,
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false,
        message: "OTP has expired",
      });
    }

   user.password = await bcrypt.hash(newPassword, 10);
user.otp = undefined;
user.otpExpiry = undefined;

    await user.save();

    return res.status(200).json({ success: true,
      message: "Password Reset Successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

module.exports = router;