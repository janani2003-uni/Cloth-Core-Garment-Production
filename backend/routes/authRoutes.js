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
    console.log("Login Request:", req.body);
console.log("Mongo Ready State:", require("mongoose").connection.readyState);
console.log("LOGIN REQUEST RECEIVED");
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    res.status(200).json({
      message: "Login Successful",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.post("/forgot-password", async (req, res) => {
  console.log("=== FORGOT PASSWORD ROUTE HIT ===");
  try {
    console.log("Mongo Ready State:", require("mongoose").connection.readyState);
    const { email } = req.body;
    console.log("Email Received:", email);

    const user = await User.findOne({ email });

    console.log("User Found:", user);



    if (!user) {
      return res.status(400).json({
        message: "Email not found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

user.otp = otp;
user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

await user.save();

console.log("Generated OTP:", otp);
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "ClothCore Password Reset OTP",
  text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
};

console.log("About to send email...");
await transporter.sendMail(mailOptions);
console.log("Email sent!");

console.log("OTP Email Sent Successfully");

    res.status(200).json({
  message: "OTP Sent Successfully",
});

  } catch (error) {
  console.error("Forgot Password Error:", error);

  res.status(500).json({
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