const mongoose = require("mongoose");

// Size-level stock, separate from the generic Inventory model (which tracks
// raw materials/items, not per-garment/per-size finished-goods counts).
// This is the real source of truth Order Step 3 and the approval stock
// check both read from — replacing what used to be numbers hardcoded
// straight into the frontend.
const garmentSizeStockSchema = new mongoose.Schema(
  {
    garmentType: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Set aside for orders that are Approved but not yet fully processed.
    // Not deducted from availableQuantity — kept as a separate figure so
    // "available" always reflects what's still free to promise to a new
    // order. Nothing currently writes to this outside of the approve
    // action; it exists so a future fulfillment step has somewhere to
    // record reservations without another schema change.
    reservedQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

garmentSizeStockSchema.index({ garmentType: 1, size: 1 }, { unique: true });

module.exports = mongoose.model("GarmentSizeStock", garmentSizeStockSchema);
