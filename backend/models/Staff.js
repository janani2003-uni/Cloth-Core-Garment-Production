const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    // No longer collected on the Add Staff form (Admin now only picks
    // Department), so this can't stay required — kept as an optional free
    // string so existing records with a position still display it, and so
    // the Edit Staff flow can still set one later if ever needed.
    position: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: true,
    },

    // Previously collected by the Add Staff form but never persisted (not
    // in the schema, so Mongoose silently dropped them on save). Added here
    // so the profile actually saves what the form collects, and so `email`
    // is available to prefill the Create Login Account page.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    joiningDate: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Single work-status field — replaces the old separate
    // attendance (Present/Absent/On Leave) + status (Active/Inactive)
    // fields with one concept the whole Staff Management page (stat card,
    // filter buttons, table column) shows consistently.
    status: {
      type: String,
      enum: ["On Duty", "On Leave"],
      default: "On Duty",
    },

    // Login-account linkage — null until an Admin creates a Supervisor
    // login for this staff member via "Create Login Account". Account
    // status itself (Not Created / Active / Disabled) is derived from this
    // reference plus the linked User's `isActive`, not stored redundantly
    // here, so the two can never drift out of sync.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    accountCreatedAt: {
      type: Date,
      default: null,
    },

    accountCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Staff", staffSchema);