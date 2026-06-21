const express = require("express");
const router = express.Router();

const User = require("../models/User");

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
module.exports = router;