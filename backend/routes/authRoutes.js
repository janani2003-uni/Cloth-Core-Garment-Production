const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");



const User = require("../models/User");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      factoryName,
      password,
    } = req.body;
    console.log("Request Body:", req.body);
console.log("Mongo Ready State:", require("mongoose").connection.readyState);  
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      factoryName,
      password,
    });

    await user.save();

    res.status(201).json({
      message: "Registration Successful",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login Request:", email);
    console.log(
      "Mongo Ready State:",
      require("mongoose").connection.readyState
    );

    console.log("Searching for user...");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).maxTimeMS(5000);

    console.log("User search completed:", user ? "User found" : "Not found");

    if (!user || user.password !== password) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    return res.status(200).json({
      message: "Login Successful",
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    res.status(200).json({
      message: "OTP Verified Successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.status(200).json({
      message: "Password Reset Successful",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
module.exports = router;