const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      trim: true,
      default: "",
    },

    // Only meaningful for category === "Fabrics" — which of the current
    // Order Step 1 fabric types (e.g. "100% Cotton", "Cotton Fleece",
    // "100% Cotton Denim") this raw material stock corresponds to. Sourced
    // from the same Product catalog Step 1 reads (see
    // GET /api/products/catalog-options), never a separately-typed value,
    // so it can't drift out of sync with what shop owners can actually order.
    fabricType: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumStock: {
      type: Number,
      min: 0,
      default: 100,
    },

    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },

    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Automatically calculate stock status
inventorySchema.pre("save", function (next) {
  if (this.stockQuantity <= 0) {
    this.status = "Out of Stock";
  } else if (this.stockQuantity <= this.minimumStock) {
    this.status = "Low Stock";
  } else {
    this.status = "In Stock";
  }

  next();
});

module.exports = mongoose.model(
  "Inventory",
  inventorySchema
);