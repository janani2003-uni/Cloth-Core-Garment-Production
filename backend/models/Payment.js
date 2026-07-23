const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: false,
    },

    paymentType: {
      type: String,
      enum: ["Advance Payment", "Full Payment", "Remaining Balance", "Credit Payment"],
      required: true,
    },

    paymentMethod: {
      type: String,
      trim: true,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    transactionReference: {
      type: String,
      trim: true,
      required: true,
    },

    proofFile: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Submitted", "Verified", "Rejected"],
      default: "Submitted",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    // Supervisor-facing monitoring fields — Supervisors can view and flag
    // payments for Admin attention, but never verify/reject/modify amounts.
    supervisorNote: {
      type: String,
      trim: true,
      default: "",
    },

    flaggedForReview: {
      type: Boolean,
      default: false,
    },

    flaggedReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
