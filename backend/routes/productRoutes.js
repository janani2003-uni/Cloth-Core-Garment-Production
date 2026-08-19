const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const GarmentSizeStock = require("../models/GarmentSizeStock");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Real total available stock per garment type, summed across sizes — used
// to attach a live `stockHint` to each product instead of the fixed
// numbers ("stock: 350") the old hardcoded GARMENTS array used to show.
// Computed fresh on every request rather than stored on the Product
// document, since GarmentSizeStock already owns this number and it
// changes independently (Admin adjustments, orders consuming stock).
async function getStockHintsByGarmentType() {
  const rows = await GarmentSizeStock.aggregate([
    { $group: { _id: "$garmentType", total: { $sum: "$availableQuantity" } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.total]));
}

// One-time, idempotent seed — runs only if the collection is empty, so it's
// safe to leave in place permanently rather than requiring a separate
// migration script. Mirrors the exact garment/fabric/color catalog that
// used to be hardcoded in frontend/src/pages/OrderStep1.js (the "Swap
// GARMENTS for an API call... once the backend is wired up" comment) —
// same pattern already used for garment stock (see garmentStockRoutes.js).
const SEED_PRODUCTS = [
  {
    name: "Denim",
    category: "Casual",
    type: "Bottom Wear",
    imageKey: "denim",
    basePrice: 1600,
    popular: false,
    displayOrder: 1,
    fabrics: [
      { id: "cotton-denim", label: "100% Cotton Denim", tag: "Premium • Classic Denim", delta: 0 },
      { id: "stretch-denim", label: "Stretch Denim", tag: "Flexible • Comfortable", delta: 200 },
      { id: "polycotton-denim", label: "Poly-Cotton Denim", tag: "Durable • Lightweight", delta: 100 },
    ],
    colors: [
      { id: "navy", label: "Navy Blue", hex: "#1e3a5f" },
      { id: "black", label: "Black", hex: "#212121" },
      { id: "gray", label: "Gray", hex: "#757575" },
    ],
  },
  {
    name: "Shirt",
    category: "Semi-Formal",
    type: "Top Wear",
    imageKey: "shirt",
    basePrice: 1350,
    popular: false,
    displayOrder: 2,
    fabrics: [
      { id: "cotton", label: "100% Cotton", tag: "Soft • Breathable", delta: 0 },
      { id: "blend", label: "Cotton Blend", tag: "Comfortable • Wrinkle Resistant", delta: 80 },
      { id: "linen", label: "Premium Linen", tag: "Lightweight • Premium", delta: 180 },
    ],
    colors: [
      { id: "white", label: "White", hex: "#ffffff" },
      { id: "shirtBlack", label: "Black", hex: "#1F1F1F" },
      { id: "shirtNavy", label: "Navy Blue", hex: "#1F3A93" },
      { id: "skyBlue", label: "Sky Blue", hex: "#87CEEB" },
      { id: "oliveGreen", label: "Olive Green", hex: "#556B2F" },
    ],
  },
  {
    name: "T-Shirt",
    category: "Casual",
    type: "Top Wear",
    imageKey: "tshirt",
    basePrice: 1200,
    popular: true,
    displayOrder: 3,
    fabrics: [
      { id: "cotton", label: "100% Cotton", tag: "Soft • Breathable", delta: 0 },
      { id: "blend", label: "Cotton Blend", tag: "Comfortable • Everyday Wear", delta: 80 },
      { id: "dryfit", label: "Dry-Fit Polyester", tag: "Lightweight • Sportswear", delta: 150 },
    ],
    colors: [
      { id: "white", label: "White", hex: "#ffffff" },
      { id: "shirtBlack", label: "Black", hex: "#1F1F1F" },
      { id: "shirtNavy", label: "Navy Blue", hex: "#1F3A93" },
      { id: "tshirtGrey", label: "Grey", hex: "#808080" },
      { id: "oliveGreen", label: "Olive Green", hex: "#556B2F" },
    ],
  },
  {
    name: "Hoodie",
    category: "Casual",
    type: "Top Wear",
    imageKey: "hoodie",
    basePrice: 2100,
    popular: true,
    displayOrder: 4,
    fabrics: [
      { id: "cotton-fleece", label: "Cotton Fleece", tag: "Soft • Warm", delta: 0 },
      { id: "french-terry", label: "French Terry", tag: "Breathable • Premium", delta: 180 },
      { id: "heavyweight-fleece", label: "Heavyweight Fleece", tag: "Thick • Extra Warm", delta: 280 },
    ],
    colors: [
      { id: "jetBlack", label: "Jet Black", hex: "#1A1A1A" },
      { id: "heatherGrey", label: "Heather Grey", hex: "#8A8A8A" },
      { id: "hoodieNavy", label: "Navy Blue", hex: "#243B5A" },
      { id: "cream", label: "Cream", hex: "#E8DDC8" },
      { id: "forestGreen", label: "Forest Green", hex: "#2F4F3E" },
    ],
  },
];

async function ensureSeeded() {
  const count = await Product.countDocuments();
  if (count > 0) return;
  await Product.insertMany(SEED_PRODUCTS);
}

router.use(verifyToken);

// GET /api/products — every authenticated role can read this (Order Step 1
// needs it for every shop owner). Active products only, in display order.
router.get("/", async (req, res) => {
  try {
    await ensureSeeded();

    const [products, stockHints] = await Promise.all([
      Product.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }),
      getStockHintsByGarmentType(),
    ]);

    const data = products.map((p) => ({ ...p.toObject(), stockHint: stockHints[p.name] ?? 0 }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/all — Admin-only, includes inactive products, for the
// Product Catalog management page.
router.get("/all", requireRole("admin"), async (req, res) => {
  try {
    await ensureSeeded();

    const products = await Product.find().sort({ displayOrder: 1, name: 1 });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/catalog-options — the single shared source of truth
// for "what fabrics and colors actually exist" — derived live from this
// same Product collection (the exact catalog Order Step 1 reads from),
// deduplicated by label. Consumed by Inventory.js (Raw Materials color/
// fabric filters and the Add/Edit Material form) so Raw Materials can never
// drift into a second, conflicting list of colors/fabrics — if Admin edits
// a garment's fabrics/colors here in the Product Catalog, Raw Materials
// picks up the change automatically on next load.
router.get("/catalog-options", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).lean();

    const colorMap = new Map();
    const fabricMap = new Map();

    products.forEach((p) => {
      (p.colors || []).forEach((c) => {
        if (c.label && !colorMap.has(c.label)) colorMap.set(c.label, { label: c.label, hex: c.hex || "#808080" });
      });
      (p.fabrics || []).forEach((f) => {
        if (f.label && !fabricMap.has(f.label)) fabricMap.set(f.label, { label: f.label });
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        colors: Array.from(colorMap.values()),
        fabrics: Array.from(fabricMap.values()),
      },
    });
  } catch (error) {
    console.error("Get Catalog Options Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products — Admin-only, create a new garment type.
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const { name, category, type, imageKey, basePrice, popular, displayOrder, fabrics, colors } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (basePrice === undefined || Number(basePrice) < 0) {
      return res.status(400).json({ success: false, message: "A valid base price is required" });
    }
    if (type && !["Top Wear", "Bottom Wear"].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be Top Wear or Bottom Wear" });
    }

    const existing = await Product.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "A product with that name already exists" });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category?.trim() || "",
      type: type || "Top Wear",
      imageKey: imageKey?.trim() || "",
      basePrice: Number(basePrice),
      popular: Boolean(popular),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      fabrics: Array.isArray(fabrics) ? fabrics : [],
      colors: Array.isArray(colors) ? colors : [],
    });

    await logActivity({
      actor: req.user,
      action: "product.created",
      message: `Added "${product.name}" to the product catalog`,
      targetType: "Product",
      targetId: product._id,
    });

    return res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id — Admin-only, full edit (including fabrics/colors
// sub-lists, replaced wholesale — the catalog page always sends the full
// arrays back, same pattern as ShopProfile's PROFILE_FIELDS upsert).
router.put("/:id", requireRole("admin"), async (req, res) => {
  try {
    const { name, category, type, imageKey, basePrice, popular, isActive, displayOrder, fabrics, colors } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (name?.trim() && name.trim() !== product.name) {
      const clash = await Product.findOne({ name: name.trim(), _id: { $ne: product._id } });
      if (clash) {
        return res.status(400).json({ success: false, message: "A product with that name already exists" });
      }
      product.name = name.trim();
    }

    if (category !== undefined) product.category = category.trim();
    if (type !== undefined) {
      if (!["Top Wear", "Bottom Wear"].includes(type)) {
        return res.status(400).json({ success: false, message: "Type must be Top Wear or Bottom Wear" });
      }
      product.type = type;
    }
    if (imageKey !== undefined) product.imageKey = imageKey.trim();
    if (basePrice !== undefined) {
      if (Number(basePrice) < 0) {
        return res.status(400).json({ success: false, message: "Base price cannot be negative" });
      }
      product.basePrice = Number(basePrice);
    }
    if (popular !== undefined) product.popular = Boolean(popular);
    if (isActive !== undefined) product.isActive = Boolean(isActive);
    if (displayOrder !== undefined) product.displayOrder = Number(displayOrder);
    if (Array.isArray(fabrics)) product.fabrics = fabrics;
    if (Array.isArray(colors)) product.colors = colors;

    await product.save();

    await logActivity({
      actor: req.user,
      action: "product.updated",
      message: `Updated "${product.name}" in the product catalog`,
      targetType: "Product",
      targetId: product._id,
    });

    return res.status(200).json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id — Admin-only. Refuses to hard-delete a garment
// type that's already referenced by real orders (same "don't orphan
// history" guard used elsewhere in this codebase) — deactivate it instead.
router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const inUse = await Order.exists({ garmentType: product.name });
    if (inUse) {
      return res.status(400).json({ success: false,
        message: `"${product.name}" is referenced by existing orders and can't be deleted — deactivate it instead so past orders stay intact.`,
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    await logActivity({
      actor: req.user,
      action: "product.deleted",
      message: `Deleted "${product.name}" from the product catalog`,
      targetType: "Product",
      targetId: product._id,
    });

    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
