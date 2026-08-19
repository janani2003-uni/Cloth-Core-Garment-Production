const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User");
const Shop = require("../models/Shop");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const AdminAccessCode = require("../models/AdminAccessCode");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const mailer = require("../utils/mailer");
const createRateLimiter = require("../middleware/rateLimiter");
const { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } = require("../utils/passwordPolicy");

// Fields containing password-reset internals — every read of a User
// document elsewhere in this file excludes these the same way it already
// excludes `password`.
const PRIVATE_FIELDS = "-password -passwordReset";

const OTP_TTL_MINUTES = 10;
const OTP_TTL_MS = OTP_TTL_MINUTES * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

// Cryptographically secure 6-digit OTP — never Math.random().
function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getOtpCooldownRemainingMs(user) {
  const lastSent = user.passwordReset?.otpLastSentAt;
  if (!lastSent) return 0;
  return Math.max(0, OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(lastSent).getTime()));
}

// Rate limiters are keyed by IP + the target email so unrelated users are
// never affected by each other's limits, and so local dev testing against
// different accounts from the same machine still works normally.
function emailRateLimitKey(req) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  return `${req.ip}:${email || "unknown"}`;
}

const otpSendLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  keyGenerator: emailRateLimitKey,
  message: "Too many verification code requests. Please wait a while and try again.",
});

const otpVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: emailRateLimitKey,
  message: "Too many attempts. Please wait a while and try again.",
});

const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: emailRateLimitKey,
  message: "Too many attempts. Please wait a while and try again.",
});

// Masks an email for safe logging (never logs the OTP itself).
function maskEmailForLog(email) {
  const [name, domain] = String(email).split("@");
  if (!domain) return "***";
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(1, name.length - visible.length))}@${domain}`;
}

// ==========================
// Register
// ==========================
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      shopName,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !shopName ||
      !password
    ) {
      return res.status(400).json({ success: false,
        message: "Please fill in all required fields",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false,
        message: PASSWORD_REQUIREMENTS_MESSAGE,
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
    shopName: shopName.trim(),
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

// Checked only after password verification succeeds, so a wrong password
// on a disabled account still gets the generic "Invalid Email or Password"
// — never confirm an account's existence/status to someone who can't
// already prove they own it.
if (user.isActive === false) {
  return res.status(403).json({ success: false,
    message: "Your account is currently disabled. Contact the administrator.",
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
      shopName: user.shopName,
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
    const user = await User.findById(req.user.id).select(PRIVATE_FIELDS);

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
    const allowedFields = ["firstName", "lastName", "shopName", "phone"];
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
    }).select(PRIVATE_FIELDS);

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

    // Same complexity rule every other password-setting flow in the app
    // enforces (registration, forgot-password reset, staff password reset)
    // — this was the one place that only checked length, letting someone
    // set a password here weaker than what the rest of the app requires.
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({ success: false, message: PASSWORD_REQUIREMENTS_MESSAGE });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isCorrect) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.status(400).json({ success: false, message: "New password must be different from your current password." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
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
      .select(PRIVATE_FIELDS)
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
      .select(PRIVATE_FIELDS)
      .sort({ createdAt: -1 });

    const shops = await Shop.find({ ownerId: { $in: shopOwners.map((u) => u._id) } });
    const shopByOwnerId = new Map(shops.map((s) => [String(s.ownerId), s]));

    // Order activity per shop owner — backs the "Active"/"Inactive" tiles on
    // the Shop Owner Management page: "Active" means they've placed at
    // least one order ever; "Inactive" means none in the last 3 months
    // (which also covers anyone who's never ordered at all).
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const orderStats = await Order.aggregate([
      { $match: { userId: { $in: shopOwners.map((u) => u._id) } } },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]);
    const orderStatsByOwnerId = new Map(orderStats.map((s) => [String(s._id), s]));

    const data = shopOwners.map((user) => {
      const shop = shopByOwnerId.get(String(user._id));
      const stats = orderStatsByOwnerId.get(String(user._id));
      return {
        ...user.toObject(),
        orderCount: stats?.orderCount || 0,
        lastOrderAt: stats?.lastOrderAt || null,
        hasOrderInLast3Months: Boolean(stats?.lastOrderAt && stats.lastOrderAt >= threeMonthsAgo),
        // Full shop profile fields (not just name/status) so Admin/Supervisor
        // "Shop Owner Management" views can show the same details the Shop
        // Owner sees/edits on their own Shop Profile page — kept in sync
        // automatically since this always reads the live Shop document.
        shop: shop
          ? {
              shopName: shop.shopName,
              shopAddress: shop.shopAddress,
              phone: shop.phone,
              email: shop.email,
              city: shop.city,
              district: shop.district,
              postalCode: shop.postalCode,
              businessType: shop.businessType,
              businessRegistrationNumber: shop.businessRegistrationNumber,
              garmentCategories: shop.garmentCategories,
              estimatedMonthlyVolume: shop.estimatedMonthlyVolume,
              preferredPaymentMethod: shop.preferredPaymentMethod,
              deliveryInstructions: shop.deliveryInstructions,
              businessDescription: shop.businessDescription,
              approvalStatus: shop.approvalStatus,
              isActive: shop.isActive,
              shopCode: shop.shopCode,
              // Absorbed from the now-removed Shop Directory page — the one
              // field that page showed that this one didn't.
              logoPath: shop.logoPath,
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

    const user = await User.findById(req.params.id).select(PRIVATE_FIELDS);

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
      shopName,
      password,
      role,
      status,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !shopName ||
      !password
    ) {
      return res.status(400).json({ success: false,
        message:
          "First name, last name, email, shop name and password are required",
      });
    }

    // Supervisor accounts have exactly one valid creation path — Admin >
    // Staff Management > Create Login Account (see POST
    // /api/staff/:staffId/create-account) — which also links the login to
    // an HR Staff profile. This generic endpoint must never be able to
    // create one directly, or that link would never exist.
    if (role?.trim() === "supervisor") {
      return res.status(400).json({ success: false,
        message: "Supervisor accounts can only be created from Staff Management (Staff Management → Create Login Account).",
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
    shopName: shopName.trim(),
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
      shopName: newUser.shopName,
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
      "shopName",
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

    // Editing an existing Supervisor's other fields (name, status, etc.)
    // through this generic tool is fine — only *promoting* someone else
    // into "supervisor" here is blocked, since that would skip the Staff
    // linking that POST /api/staff/:staffId/create-account performs.
    if (updates.role === "supervisor") {
      const targetUser = await User.findById(req.params.id).select("role");
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      if (targetUser.role !== "supervisor") {
        return res.status(400).json({ success: false,
          message: "Supervisor accounts can only be created from Staff Management (Staff Management → Create Login Account).",
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
    ).select(PRIVATE_FIELDS);

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
// Forgot Password — always returns the same neutral message regardless of
// whether the email is registered, so this endpoint can't be used to
// enumerate accounts. If the email *is* registered, this generates a fresh
// OTP (hashed before storage), emails it from the official ClothCore Gmail
// account, and resets the attempt counter.
// ==========================
router.post("/forgot-password", otpSendLimiter, async (req, res) => {
  const NEUTRAL_MESSAGE = "If an account exists for this email, a verification code has been sent.";

  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({ success: true, message: NEUTRAL_MESSAGE });
    }

    // Within the cooldown window, silently no-op instead of sending another
    // email — but still return the same neutral response so the response
    // shape never differs based on server-side state.
    if (getOtpCooldownRemainingMs(user) > 0) {
      return res.status(200).json({ success: true, message: NEUTRAL_MESSAGE });
    }

    if (!mailer.isEmailConfigured) {
      console.warn("Password reset requested but the email service is not configured.");
      return res.status(503).json({ success: false,
        message: "The email service is temporarily unavailable. Please try again later.",
      });
    }

    const otp = generateOtp();

    user.passwordReset = {
      otpHash: await bcrypt.hash(otp, 10),
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      otpAttempts: 0,
      otpLastSentAt: new Date(),
      verified: false,
      tokenHash: null,
      tokenExpiresAt: null,
    };
    await user.save();

    try {
      await mailer.sendPasswordResetOtpEmail({
        to: user.email,
        firstName: user.firstName,
        otp,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError.message);
      return res.status(503).json({ success: false,
        message: "Unable to send the verification code. Please try again.",
      });
    }

    console.log(`Password reset OTP sent to ${maskEmailForLog(normalizedEmail)}`);
    return res.status(200).json({ success: true, message: NEUTRAL_MESSAGE });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// ==========================
// Resend Reset OTP — same email as Forgot Password, but this one is only
// reachable from the Verify OTP screen (the shop owner already knows
// whether their email is registered by this point), so it's allowed to be
// explicit about the cooldown instead of staying neutral.
// ==========================
router.post("/resend-reset-otp", otpSendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({ success: true,
        message: "If an account exists for this email, a verification code has been sent.",
      });
    }

    const cooldownRemainingMs = getOtpCooldownRemainingMs(user);
    if (cooldownRemainingMs > 0) {
      return res.status(429).json({ success: false,
        message: "Please wait before requesting another code.",
        retryAfterSeconds: Math.ceil(cooldownRemainingMs / 1000),
      });
    }

    if (!mailer.isEmailConfigured) {
      return res.status(503).json({ success: false,
        message: "The email service is temporarily unavailable. Please try again later.",
      });
    }

    const otp = generateOtp();

    user.passwordReset = {
      otpHash: await bcrypt.hash(otp, 10),
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      otpAttempts: 0,
      otpLastSentAt: new Date(),
      verified: false,
      tokenHash: null,
      tokenExpiresAt: null,
    };
    await user.save();

    try {
      await mailer.sendPasswordResetOtpEmail({
        to: user.email,
        firstName: user.firstName,
        otp,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch (emailError) {
      console.error("Failed to resend password reset email:", emailError.message);
      return res.status(503).json({ success: false,
        message: "Unable to send the verification code. Please try again.",
      });
    }

    console.log(`Password reset OTP resent to ${maskEmailForLog(normalizedEmail)}`);
    return res.status(200).json({ success: true, message: "A new verification code has been sent." });
  } catch (error) {
    console.error("Resend Reset OTP Error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// ==========================
// Verify Reset OTP — checks the OTP against its stored hash, enforces
// expiry and a 5-attempt limit, then (only on success) consumes the OTP and
// issues a short-lived reset token. The token — not the email alone — is
// what authorizes the Reset Password step.
// ==========================
router.post("/verify-reset-otp", otpVerifyLimiter, async (req, res) => {
  const INVALID_MESSAGE = "The verification code is incorrect or has expired.";

  try {
    const { email, otp } = req.body;

    if (!email || !otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ success: false, message: "Please enter the 6-digit verification code." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.passwordReset?.otpHash || !user.passwordReset?.otpExpiresAt) {
      return res.status(400).json({ success: false, message: INVALID_MESSAGE });
    }

    if (user.passwordReset.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "This verification code has expired. Request a new code." });
    }

    if (user.passwordReset.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ success: false, message: "Too many failed attempts. Request another code." });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), user.passwordReset.otpHash);

    if (!isMatch) {
      user.passwordReset.otpAttempts += 1;
      const attemptsLeft = MAX_OTP_ATTEMPTS - user.passwordReset.otpAttempts;

      // Lock the OTP out once attempts run out — a fresh code is required,
      // rather than leaving a guessable hash sitting around indefinitely.
      if (attemptsLeft <= 0) {
        user.passwordReset.otpHash = null;
        user.passwordReset.otpExpiresAt = null;
      }
      await user.save();

      return res.status(400).json({ success: false,
        message: attemptsLeft > 0 ? "The verification code is incorrect." : "Too many failed attempts. Request another code.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordReset.otpHash = null;
    user.passwordReset.otpExpiresAt = null;
    user.passwordReset.otpAttempts = 0;
    user.passwordReset.verified = true;
    user.passwordReset.tokenHash = hashResetToken(resetToken);
    user.passwordReset.tokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    // The reset token is the only OTP-adjacent secret ever returned to the
    // frontend — the OTP itself never is.
    return res.status(200).json({ success: true, message: "Verification successful.", resetToken });
  } catch (error) {
    console.error("Verify Reset OTP Error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// ==========================
// Reset Password — requires a verified, unexpired reset token (not just an
// email), enforces the same password policy as Registration, then hashes
// and saves the new password and clears all reset state so the token/OTP
// can't be reused.
// ==========================
router.post("/reset-password", resetPasswordLimiter, async (req, res) => {
  const EXPIRED_SESSION_MESSAGE = "Your reset session has expired. Start again.";

  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing required information." });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({ success: false, message: PASSWORD_REQUIREMENTS_MESSAGE });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (
      !user ||
      !user.passwordReset?.verified ||
      !user.passwordReset?.tokenHash ||
      !user.passwordReset?.tokenExpiresAt ||
      user.passwordReset.tokenExpiresAt < new Date() ||
      hashResetToken(resetToken) !== user.passwordReset.tokenHash
    ) {
      return res.status(400).json({ success: false, message: EXPIRED_SESSION_MESSAGE });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    user.passwordReset = {
      otpHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      otpLastSentAt: null,
      verified: false,
      tokenHash: null,
      tokenExpiresAt: null,
    };
    await user.save();

    await logActivity({
      actor: { id: user._id, role: user.role },
      action: "user.password_reset",
      message: `${user.firstName} ${user.lastName} reset their password via the Forgot Password flow`,
      targetType: "User",
      targetId: user._id,
    });

    await Notification.create({
      title: "Password Changed",
      message: "Your ClothCore password was changed. If this wasn't you, contact an administrator immediately.",
      type: "system",
      relatedId: user._id,
      relatedModel: "User",
      recipientId: user._id,
    });

    // Best-effort confirmation email — must never affect the already-
    // successful reset response, so failures are only logged.
    mailer.sendPasswordChangedEmail({ to: user.email, firstName: user.firstName }).catch((err) => {
      console.error("Failed to send password-changed confirmation email:", err.message);
    });

    console.log(`Password reset completed for ${maskEmailForLog(normalizedEmail)}`);
    return res.status(200).json({ success: true, message: "Your password was updated successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

module.exports = router;