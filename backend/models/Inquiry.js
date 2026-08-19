// backend/models/Inquiry.js
// A visitor's "Get In Touch" submission from the public Home Page. Kept
// deliberately minimal — the primary requirement is that the ClothCore
// inbox receives the email (see backend/utils/mailer.js's
// sendContactInquiryEmail); this record is a secondary, best-effort
// paper trail so a submission isn't lost if the email step fails, and so
// an Admin could look inquiries up later without needing this to become a
// full CRM.
const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    shopName: {
      type: String,
      trim: true,
      default: "",
    },

    subject: {
      type: String,
      trim: true,
      default: "",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
    },

    // Set to false only when the email to ClothCore's inbox failed to send
    // (the record was still saved so nothing is lost) — lets an Admin spot
    // inquiries that may need a manual follow-up.
    emailDelivered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
