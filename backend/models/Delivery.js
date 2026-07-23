const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    deliveryStaffName: {
      type: String,
      trim: true,
      default: "",
    },

    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Not Scheduled",
        "Scheduled",
        "Dispatched",
        "In Transit",
        "Delivered",
        "Delivery Failed",
      ],
      default: "Not Scheduled",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Delivery", deliverySchema);
