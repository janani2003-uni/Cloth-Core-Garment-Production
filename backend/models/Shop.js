const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },

    shopAddress: {
      type: String,
      required: [true, "Shop address is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    // Human-readable identifier (e.g. "SHOP-2026-001"), generated once when
    // an Admin approves the shop — mirrors generateOrderId() in
    // orderRoutes.js. Empty until approval.
    shopCode: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    district: {
      type: String,
      trim: true,
      default: "",
    },

    postalCode: {
      type: String,
      trim: true,
      default: "",
    },

    businessType: {
      type: String,
      trim: true,
      default: "",
    },

    businessRegistrationNumber: {
      type: String,
      trim: true,
      default: "",
    },

    garmentCategories: {
      type: String,
      trim: true,
      default: "",
    },

    estimatedMonthlyVolume: {
      type: String,
      trim: true,
      default: "",
    },

    preferredPaymentMethod: {
      type: String,
      trim: true,
      default: "",
    },

    deliveryInstructions: {
      type: String,
      trim: true,
      default: "",
    },

    businessDescription: {
      type: String,
      trim: true,
      default: "",
    },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Shop Logo — a real disk-backed upload (see backend/middleware/upload.js
    // and POST /api/shops/logo below), not a base64 string. Only the
    // relative web path is stored here; the file itself lives under
    // backend/uploads/logos/ and is served via /uploads/logos/<file>.
    logoPath: {
      type: String,
      trim: true,
      default: "",
    },

    logoOriginalName: {
      type: String,
      trim: true,
      default: "",
    },

    logoMimeType: {
      type: String,
      trim: true,
      default: "",
    },

    logoUploadedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shop", shopSchema);
