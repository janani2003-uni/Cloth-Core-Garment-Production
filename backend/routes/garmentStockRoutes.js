const express = require("express");
const router = express.Router();

const GarmentSizeStock = require("../models/GarmentSizeStock");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const GARMENT_TYPES = ["Denim", "Shirt", "T-Shirt", "Hoodie"];
const SIZES = [
  { size: "S", availableQuantity: 150 },
  { size: "M", availableQuantity: 200 },
  { size: "L", availableQuantity: 180 },
  { size: "XL", availableQuantity: 120 },
  { size: "XXL", availableQuantity: 80 },
];

// One-time, idempotent seed — runs only if the collection is empty, so it's
// safe to leave in place permanently rather than requiring a separate
// migration script to be run manually. Mirrors the numbers Order Step 3
// used to have hardcoded before this became a real backend-driven value.
async function ensureSeeded() {
  const count = await GarmentSizeStock.countDocuments();
  if (count > 0) return;

  const docs = [];
  for (const garmentType of GARMENT_TYPES) {
    for (const { size, availableQuantity } of SIZES) {
      docs.push({ garmentType, size, availableQuantity });
    }
  }
  await GarmentSizeStock.insertMany(docs);
}

router.use(verifyToken);

// GET /api/garment-stock?garmentType=Denim
// Any authenticated user can read this — Order Step 3 needs it for every
// shop owner, not just Admin/Supervisor.
router.get("/", async (req, res) => {
  try {
    await ensureSeeded();

    const filter = {};
    if (req.query.garmentType) {
      filter.garmentType = req.query.garmentType;
    }

    const stock = await GarmentSizeStock.find(filter).sort({ garmentType: 1, size: 1 });
    return res.status(200).json({ success: true, data: stock });
  } catch (error) {
    console.error("Get Garment Stock Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/garment-stock/:id — Admin-only manual stock adjustment.
router.patch("/:id", requireRole("admin"), async (req, res) => {
  try {
    const { availableQuantity } = req.body;

    if (availableQuantity === undefined || Number(availableQuantity) < 0) {
      return res.status(400).json({ success: false, message: "A valid, non-negative quantity is required." });
    }

    const updated = await GarmentSizeStock.findByIdAndUpdate(
      req.params.id,
      { availableQuantity: Number(availableQuantity) },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Stock entry not found" });
    }

    return res.status(200).json({ success: true, message: "Stock updated", data: updated });
  } catch (error) {
    console.error("Update Garment Stock Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/garment-stock — Admin-only, add a new garment-type/size stock
// entry. Needed for any garment type added later via the Product Catalog
// (Admin Product Catalog page) — without a matching entry here, Order
// Step 3 has no live stock number for that size and the approval stock
// check always fails it as "0 available", permanently blocking approval.
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const { garmentType, size, availableQuantity } = req.body;

    if (!garmentType?.trim() || !size?.trim()) {
      return res.status(400).json({ success: false, message: "Garment type and size are required." });
    }
    if (availableQuantity === undefined || Number(availableQuantity) < 0) {
      return res.status(400).json({ success: false, message: "A valid, non-negative quantity is required." });
    }

    const existing = await GarmentSizeStock.findOne({
      garmentType: garmentType.trim(),
      size: size.trim().toUpperCase(),
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "A stock entry for this garment type and size already exists — edit it instead." });
    }

    const created = await GarmentSizeStock.create({
      garmentType: garmentType.trim(),
      size: size.trim().toUpperCase(),
      availableQuantity: Number(availableQuantity),
    });

    return res.status(201).json({ success: true, message: "Stock entry created", data: created });
  } catch (error) {
    console.error("Create Garment Stock Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/garment-stock/:id — Admin-only. Refuses to delete a size row
// that's currently backing a real reservation (reservedQuantity > 0) —
// that stock is still promised to an approved order somewhere.
router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const entry = await GarmentSizeStock.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Stock entry not found" });
    }

    if (entry.reservedQuantity > 0) {
      return res.status(400).json({ success: false,
        message: `${entry.reservedQuantity} units of this size are reserved by approved orders — set available stock to 0 instead of deleting.`,
      });
    }

    await GarmentSizeStock.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Stock entry deleted" });
  } catch (error) {
    console.error("Delete Garment Stock Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
