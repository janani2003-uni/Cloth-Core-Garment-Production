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

    // Which half of the mandatory 50/50 split this payment represents —
    // decided by the backend from the order's own payment state at
    // submission time (see paymentRoutes.js), never chosen by the shop
    // owner. "Advance" = the required 50% before production can start;
    // "Final" = the remaining 50%. Paying the Final 50% is not gated on
    // production being complete — a shop owner may pay it off any time
    // they want, including immediately after the advance.
    stage: {
      type: String,
      enum: ["Advance", "Final"],
      required: true,
    },

    // Only two methods are offered anywhere a shop owner submits a payment
    // (Step 7 and the Payments page) — Cash, Cheque and any other legacy
    // method have been removed.
    paymentMethod: {
      type: String,
      enum: ["Card Payment", "Online Bank Transfer"],
      required: true,
    },

    // Always backend-computed/validated against the order's real
    // outstanding balance — never trusted verbatim from the client. See
    // paymentRoutes.js's amount-matches-required-stage check.
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    // Real disk-backed upload path (backend/middleware/upload.js), e.g.
    // "/uploads/payment-proofs/xxx.pdf" — never a base64 string. Required
    // only for Online Bank Transfer (enforced in paymentRoutes.js); Card
    // Payment never has one.
    proofFile: {
      type: String,
      trim: true,
      default: "",
    },

    // Card Payment demo-safe bookkeeping only — deliberately NEVER the full
    // card number, CVV, or expiry date. Only the last 4 digits are kept
    // (for the shop owner's own reference on their payment history); no
    // other card detail is transmitted to or stored by this backend.
    cardLast4: {
      type: String,
      trim: true,
      default: "",
    },

    // Transaction Reference / Receipt Number has been removed entirely from
    // shop-owner payment entry (Step 7 and the Payments page) — there is no
    // field for it anymore.

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
