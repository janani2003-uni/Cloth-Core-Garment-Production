const express = require("express");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

/* =========================================================
   EMAIL CONFIGURATION
========================================================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================================================
   JWT TOKEN GENERATOR
========================================================= */

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from backend/.env");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

/* =========================================================
   CREATE OR UPDATE ADMIN ACCOUNT

   POST /api/auth/create-admin

   JSON:
   {
     "setupKey": "CreateClothCoreAdmin2026"
   }
========================================================= */

router.post("/create-admin", async (req, res) => {
  try {
    const { setupKey } = req.body;

    if (!process.env.ADMIN_SETUP_KEY) {
      return res.status(500).json({
        message: "ADMIN_SETUP_KEY is missing from backend/.env",
      });
    }

    if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({
        message: "Invalid admin setup key.",
      });
    }

    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.findOneAndUpdate(
      {
        email: adminEmail,
      },
      {
        $set: {
          firstName: "System",
          lastName: "Administrator",
          email: adminEmail,
          factoryName: "ClothCore",
          password: hashedPassword,
          role: "admin",
          status: "active",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: false,
        setDefaultsOnInsert: true,
      }
    );

    const passwordTest = await bcrypt.compare(
      adminPassword,
      admin.password
    );

    console.log("Admin created or updated:", admin.email);
    console.log("Admin password test:", passwordTest);

    return res.status(200).json({
      message: "Admin account created or updated successfully.",
      passwordTest,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create Admin Error:", error);

    return res.status(500).json({
      message: "Unable to create the admin account.",
      error: error.message,
    });
  }
});

/* =========================================================
   CREATE OR UPDATE SUPERVISOR ACCOUNT

   POST /api/auth/create-supervisor

   JSON:
   {
     "setupKey": "CreateClothCoreSupervisor2026"
   }
========================================================= */

router.post("/create-supervisor", async (req, res) => {
  try {
    const { setupKey } = req.body;

    if (!process.env.SUPERVISOR_SETUP_KEY) {
      return res.status(500).json({
        message:
          "SUPERVISOR_SETUP_KEY is missing from backend/.env",
      });
    }

    if (
      !setupKey ||
      setupKey !== process.env.SUPERVISOR_SETUP_KEY
    ) {
      return res.status(403).json({
        message: "Invalid supervisor setup key.",
      });
    }

    const supervisorEmail = "supervisor@gmail.com";
    const supervisorPassword = "supervisor123";

    const hashedPassword = await bcrypt.hash(
      supervisorPassword,
      12
    );

    const supervisor = await User.findOneAndUpdate(
      {
        email: supervisorEmail,
      },
      {
        $set: {
          firstName: "System",
          lastName: "Supervisor",
          email: supervisorEmail,
          factoryName: "ClothCore",
          password: hashedPassword,
          role: "supervisor",
          status: "active",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: false,
        setDefaultsOnInsert: true,
      }
    );

    const passwordTest = await bcrypt.compare(
      supervisorPassword,
      supervisor.password
    );

    console.log(
      "Supervisor created or updated:",
      supervisor.email
    );
    console.log(
      "Supervisor password test:",
      passwordTest
    );

    return res.status(200).json({
      message:
        "Supervisor account created or updated successfully.",
      passwordTest,
      supervisor: {
        id: supervisor._id,
        email: supervisor.email,
        role: supervisor.role,
      },
    });
  } catch (error) {
    console.error("Create Supervisor Error:", error);

    return res.status(500).json({
      message: "Unable to create the supervisor account.",
      error: error.message,
    });
  }
});

/* =========================================================
   PUBLIC REGISTRATION

   POST /api/auth/register

   Public registration always creates a shop owner.
========================================================= */

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
        message: "Please complete all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account already exists with this email.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    /*
      insertMany bypasses Mongoose save middleware.
      This prevents accidental double password hashing.
    */
    const createdUsers = await User.insertMany([
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        factoryName: factoryName.trim(),
        password: hashedPassword,
        role: "shopOwner",
        status: "active",
      },
    ]);

    const user = createdUsers[0];

    return res.status(201).json({
      message: "Registration successful. You can now log in.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        factoryName: user.factoryName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account already exists with this email.",
      });
    }

    return res.status(500).json({
      message: "Unable to complete registration.",
      error: error.message,
    });
  }
});

/* =========================================================
   LOGIN

   POST /api/auth/login

   Supports:
   - Admin
   - Supervisor
   - Shop Owner
========================================================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    console.log("\n----- LOGIN ATTEMPT -----");
    console.log("Login email:", normalizedEmail);
    console.log("User found:", Boolean(user));

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({
        message: "Your account has been deactivated.",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        message: "This account does not contain a password.",
      });
    }

    const passwordIsHashed =
      typeof user.password === "string" &&
      user.password.startsWith("$2");

    console.log("Password is hashed:", passwordIsHashed);

    if (!passwordIsHashed) {
      return res.status(401).json({
        message:
          "This account uses an old password format. Delete it and register again.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password matches:", passwordMatches);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    console.log("Login successful:", user.email);
    console.log("Role:", user.role);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        factoryName: user.factoryName,
        role: user.role,
        status: user.status || "active",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Unable to log in. Please try again.",
      error: error.message,
    });
  }
});

/* =========================================================
   FORGOT PASSWORD — SEND OTP

   POST /api/auth/forgot-password
========================================================= */

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email address is required.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        message:
          "Email configuration is missing from backend/.env",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "Email address was not found.",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          otp,
          otpExpiry,
        },
      },
      {
        runValidators: false,
      }
    );

    await transporter.sendMail({
      from: `"ClothCore" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "ClothCore Password Reset OTP",
      text: `Your ClothCore password reset OTP is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>ClothCore Password Reset</h2>
          <p>Your password reset OTP is:</p>
          <h1 style="letter-spacing: 6px;">${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      message: "Unable to send the OTP.",
      error: error.message,
    });
  }
});

/* =========================================================
   VERIFY OTP

   POST /api/auth/verify-otp
========================================================= */

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User was not found.",
      });
    }

    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    if (
      !user.otpExpiry ||
      new Date(user.otpExpiry).getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "The OTP has expired.",
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      message: "Unable to verify the OTP.",
      error: error.message,
    });
  }
});

/* =========================================================
   RESET PASSWORD

   POST /api/auth/reset-password
========================================================= */

router.post("/reset-password", async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message:
          "Email, OTP and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message:
          "New password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User was not found.",
      });
    }

    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    if (
      !user.otpExpiry ||
      new Date(user.otpExpiry).getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "The OTP has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          otp: "",
          otpExpiry: "",
        },
      },
      {
        runValidators: false,
      }
    );

    return res.status(200).json({
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      message: "Unable to reset the password.",
      error: error.message,
    });
  }
});

module.exports = router;