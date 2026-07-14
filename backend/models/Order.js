const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    item: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Production",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    deliveryDate: {
      type: Date,
      required: false,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
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

module.exports = mongoose.model("Order", orderSchema);