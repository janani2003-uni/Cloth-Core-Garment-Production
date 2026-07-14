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