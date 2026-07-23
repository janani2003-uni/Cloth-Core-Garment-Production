const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Inventory = require("../models/Inventory");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken, requireRole("admin"));

// ==========================
// GET all inventory items
// ==========================
router.get("/", async (req, res) => {
  try {
    const items = await Inventory.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(items);
  } catch (error) {
    console.error("Get Inventory Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// GET inventory statistics
// ==========================
router.get("/stats", async (req, res) => {
  try {
    const items = await Inventory.find();

    const totalItems = items.reduce(
      (sum, item) => sum + Number(item.stockQuantity || 0),
      0
    );

    const inStock = items
      .filter((item) => item.status === "In Stock")
      .reduce(
        (sum, item) =>
          sum + Number(item.stockQuantity || 0),
        0
      );

    const lowStock = items
      .filter((item) => item.status === "Low Stock")
      .reduce(
        (sum, item) =>
          sum + Number(item.stockQuantity || 0),
        0
      );

    const outOfStock = items.filter(
      (item) => item.status === "Out of Stock"
    ).length;

    const totalValue = items.reduce(
      (sum, item) =>
        sum +
        Number(item.stockQuantity || 0) *
          Number(item.unitCost || 0),
      0
    );

    const categories = [
      ...new Set(
        items
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ].length;

    return res.status(200).json({ success: true,
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
      categories,
    });
  } catch (error) {
    console.error("Inventory Stats Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// GET one inventory item
// ==========================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false,
        message: "Invalid inventory item ID",
      });
    }

    const item = await Inventory.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({ success: false,
        message: "Inventory item not found",
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error("Get Inventory Item Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// CREATE inventory item
// ==========================
router.post("/", async (req, res) => {
  try {
    const {
      itemName,
      sku,
      category,
      color,
      description,
      stockQuantity,
      unit,
      unitCost,
      minimumStock,
      imageUrl,
    } = req.body;

    if (
      !itemName ||
      !sku ||
      !category ||
      stockQuantity === undefined ||
      !unit ||
      unitCost === undefined
    ) {
      return res.status(400).json({ success: false,
        message:
          "Please fill in all required inventory fields",
      });
    }

    const existingItem = await Inventory.findOne({
      sku: sku.trim().toUpperCase(),
    });

    if (existingItem) {
      return res.status(400).json({ success: false,
        message: "SKU already exists",
      });
    }

    const item = new Inventory({
      itemName: itemName.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      color: color?.trim() || "",
      description: description?.trim() || "",
      stockQuantity: Number(stockQuantity),
      unit: unit.trim(),
      unitCost: Number(unitCost),
      minimumStock:
        minimumStock !== undefined
          ? Number(minimumStock)
          : 100,
      imageUrl: imageUrl?.trim() || "",
    });

    await item.save();

    if (item.status === "Low Stock" || item.status === "Out of Stock") {
      await Notification.create({
        title: item.status === "Out of Stock" ? "Item Out of Stock" : "Low Stock Alert",
        message: `${item.itemName} (${item.sku}) is ${item.status.toLowerCase()}.`,
        type: "inventory",
        relatedId: item._id,
        relatedModel: "Inventory",
      });
    }

    await logActivity({
      actor: req.user,
      action: "inventory.created",
      message: `Added inventory item "${item.itemName}" (${item.sku})`,
      targetType: "Inventory",
      targetId: item._id,
    });

    return res.status(201).json({ success: true,
      message: "Inventory item added successfully",
      item,
    });
  } catch (error) {
    console.error("Create Inventory Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false,
        message: "SKU already exists",
      });
    }

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// UPDATE inventory item
// ==========================
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false,
        message: "Invalid inventory item ID",
      });
    }

    const item = await Inventory.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({ success: false,
        message: "Inventory item not found",
      });
    }

    const allowedFields = [
      "itemName",
      "sku",
      "category",
      "color",
      "description",
      "stockQuantity",
      "unit",
      "unitCost",
      "minimumStock",
      "imageUrl",
    ];

    const previousStatus = item.status;

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (item.sku) {
      item.sku = item.sku.trim().toUpperCase();
    }

    await item.save();

    // Only alert when the item newly crosses into Low/Out of Stock, not on
    // every unrelated edit.
    if (
      item.status !== previousStatus &&
      (item.status === "Low Stock" || item.status === "Out of Stock")
    ) {
      await Notification.create({
        title: item.status === "Out of Stock" ? "Item Out of Stock" : "Low Stock Alert",
        message: `${item.itemName} (${item.sku}) is ${item.status.toLowerCase()}.`,
        type: "inventory",
        relatedId: item._id,
        relatedModel: "Inventory",
      });
    }

    await logActivity({
      actor: req.user,
      action: "inventory.updated",
      message: `Updated inventory item "${item.itemName}" (${item.sku})`,
      targetType: "Inventory",
      targetId: item._id,
    });

    return res.status(200).json({ success: true,
      message: "Inventory item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update Inventory Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false,
        message: "SKU already exists",
      });
    }

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

// ==========================
// DELETE inventory item
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false,
        message: "Invalid inventory item ID",
      });
    }

    const deletedItem =
      await Inventory.findByIdAndDelete(
        req.params.id
      );

    if (!deletedItem) {
      return res.status(404).json({ success: false,
        message: "Inventory item not found",
      });
    }

    await logActivity({
      actor: req.user,
      action: "inventory.deleted",
      message: `Deleted inventory item "${deletedItem.itemName}" (${deletedItem.sku})`,
      targetType: "Inventory",
      targetId: deletedItem._id,
    });

    return res.status(200).json({ success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Inventory Error:", error);

    return res.status(500).json({ success: false,
      message: error.message,
    });
  }
});

module.exports = router;