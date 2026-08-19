const mongoose = require("mongoose");

// Backend-driven replacement for the garment/fabric/color catalog that used
// to live only as a hardcoded GARMENTS array in frontend/src/pages/
// OrderStep1.js ("Swap GARMENTS for an API call... once the backend is
// wired up" — that's this). Admin manages it from the Product Catalog page;
// Order Step 1 fetches GET /api/products to render its garment picker.
const fabricSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    tag: { type: String, trim: true, default: "" },
    // Added to the garment's basePrice for this fabric choice — same
    // "delta" concept the frontend already used.
    delta: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const colorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    // The garment's physical type — distinct from `category` (a styling
    // label like "Casual"/"Semi-Formal"). Exactly two values across the
    // catalog: Denim is "Bottom Wear", everything else (Shirt/T-Shirt/
    // Hoodie) is "Top Wear". Shown as its own "Type" column in the Admin
    // Product Catalog table.
    type: {
      type: String,
      enum: ["Top Wear", "Bottom Wear"],
      default: "Top Wear",
    },

    // Matches a key in the frontend's bundled image map (frontend/src/
    // pages/OrderStep1.js) — e.g. "denim", "shirt", "tshirt", "hoodie".
    // Falls back to a generic garment icon in the UI when it doesn't match
    // a known bundled asset, so this is never a hard requirement.
    imageKey: {
      type: String,
      trim: true,
      default: "",
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    popular: {
      type: Boolean,
      default: false,
    },

    // Lets Admin retire a garment type from the picker without deleting it
    // outright (and losing history for orders that already reference it).
    isActive: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    fabrics: {
      type: [fabricSchema],
      default: [],
    },

    colors: {
      type: [colorSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
