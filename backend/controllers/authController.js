const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER USER
exports.register = async (req, res) => {
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

    /*
      This assumes your User model has a pre-save middleware
      that hashes the password.

      If User.js does NOT hash the password automatically,
      tell me and this section must be changed.
    */
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      factoryName: factoryName.trim(),
      password,
      role: "shopOwner",
    });

    await newUser.save();

    return res.status(201).json({
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed.",
      error: error.message,
    });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("\n--- LOGIN ATTEMPT ---");
    console.log("Received email:", email);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    console.log("Normalized email:", normalizedEmail);
    console.log("User found:", Boolean(user));

    if (!user) {
      return res.status(401).json({
        message: "No account was found with this email.",
      });
    }

    if (!user.password) {
      console.error("The user document has no password field.");

      return res.status(500).json({
        message: "The user account has no password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password matches:", passwordMatches);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "The password is incorrect.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend/.env");

      return res.status(500).json({
        message:
          "JWT_SECRET is missing from the backend .env file.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log("Token created successfully.");
    console.log("Login successful for:", user.email);

    return res.status(200).json({
      message: "Login Successful",
      token,
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
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};