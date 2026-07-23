const mongoose = require("mongoose");

// Singleton document — there is only ever one SystemSettings record for the
// whole app. Extend this schema if more system-level settings are added
// later; don't create a second document type per setting.
const systemSettingsSchema = new mongoose.Schema(
  {
    orderIdPrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "ORD",
      minlength: [2, "Order ID prefix must be at least 2 characters"],
      maxlength: [10, "Order ID prefix must be at most 10 characters"],
      match: [/^[A-Z0-9]+$/, "Order ID prefix may only contain letters and numbers"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
