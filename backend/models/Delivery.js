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

    // Kept in the schema for backward compatibility with any existing
    // records, but no longer collected, required, or displayed anywhere in
    // the UI (Admin/Supervisor/Shop Owner) — the system only ever offers
    // Factory Delivery now, so a per-shipment tracking number added no real
    // information.
    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // Defaulted from the order's own deliveryAddress/deliveryMethod (set by
    // the shop owner at placement time) when this record is first created —
    // see POST / below — then editable here from that point on, same as
    // every other delivery field.
    address: {
      type: String,
      trim: true,
      default: "",
    },

    // Only Factory Delivery exists as a real option now — the empty string
    // is kept only so older records without a method set don't fail
    // validation.
    method: {
      type: String,
      enum: ["Factory Delivery", ""],
      default: "Factory Delivery",
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    // Exactly three shop-owner-facing statuses, per the simplified delivery
    // model — collapses the old six-value pipeline (Not Scheduled / Scheduled
    // / Dispatched / In Transit / Delivered / Delivery Failed). Only
    // Admin/Supervisor can ever change this (enforced in deliveryRoutes.js —
    // every write route stays role-gated); Shop Owners can only read it.
    status: {
      type: String,
      enum: ["Not Yet Delivered", "Delivery In Progress", "Delivered"],
      default: "Not Yet Delivered",
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
