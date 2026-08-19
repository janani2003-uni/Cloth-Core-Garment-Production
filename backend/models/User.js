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

    shopName: {
      type: String,
      required: [true, "Shop name is required"],
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

    // Login gate, separate from `status` above (which is a general-purpose
    // profile field already used elsewhere and not consistently enforced at
    // login). isActive is the one authoritative flag login checks — Admin
    // uses this to disable a Supervisor's access without deleting their
    // Staff profile or User record.
    isActive: {
      type: Boolean,
      default: true,
    },

    // Set only for Supervisor accounts created by an Admin from Staff
    // Management — links back to the Staff HR profile this login belongs
    // to. Null for every other role (Admin, Shop Owner, legacy "user").
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
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

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // Forgot-password state, grouped the same way Order.approval groups its
    // own feature state. The OTP itself is never stored in plain text —
    // only a bcrypt hash of it, mirroring how `password` is stored. A
    // successful OTP verification consumes the OTP (otpHash cleared) and
    // issues a short-lived reset token (also stored only as a hash) so
    // reset-password can't be reached with just an email address.
    passwordReset: {
      otpHash: { type: String, default: null },
      otpExpiresAt: { type: Date, default: null },
      otpAttempts: { type: Number, default: 0 },
      otpLastSentAt: { type: Date, default: null },
      verified: { type: Boolean, default: false },
      tokenHash: { type: String, default: null },
      tokenExpiresAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);