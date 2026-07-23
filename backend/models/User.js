const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    factoryName: {
      type: String,
      required: [true, "Factory name is required"],
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional operational metadata, mainly relevant for Supervisor/Staff
    // accounts (their "My Account" page) — deliberately plain strings rather
    // than a link into the separate HR-only Staff collection, since Staff
    // records have no login and aren't tied to a User today.
    employeeId: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      productionAlerts: { type: Boolean, default: true },
      deliveryAlerts: { type: Boolean, default: true },
      paymentAlerts: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },

    role: {
      type: String,
      enum: ["user", "admin", "shopOwner", "supervisor"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    joinedDate: {
      type: Date,
      default: Date.now,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must contain at least 8 characters"],
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);