const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Denormalized snapshot so log entries stay readable even if the actor
    // account is later deleted or renamed.
    actorName: {
      type: String,
      trim: true,
      default: "System",
    },

    actorRole: {
      type: String,
      trim: true,
      default: "",
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    targetType: {
      type: String,
      trim: true,
      default: "",
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
