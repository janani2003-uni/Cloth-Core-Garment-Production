const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "user",
        "staff",
        "inventory",
        "production",
        "order",
        "payment",
        "system",
      ],
      default: "system",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedModel: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);