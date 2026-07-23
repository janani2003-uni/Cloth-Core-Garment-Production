const mongoose = require("mongoose");

// Codes an existing account can enter at login (alongside their normal
// password) to be promoted to Admin. Stored in plaintext deliberately —
// Admins need to be able to view and share a code, so a one-way hash isn't
// usable here. Access to every route touching this collection is Admin-only
// (see routes/adminAccessCodeRoutes.js), which is the actual protection.
const adminAccessCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
      trim: true,
    },

    label: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    usageHistory: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AdminAccessCode", adminAccessCodeSchema);
