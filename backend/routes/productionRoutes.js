const express = require("express");
const router = express.Router();
const Production = require("../models/Production");

// GET /api/production - Get all production orders with pagination and search
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { orderId: { $regex: search, $options: "i" } },
            { product: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalItems = await Production.countDocuments(searchQuery);

    // Get paginated results
    const items = await Production.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      items,
      totalItems,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/production error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch production orders",
    });
  }
});

// GET /api/production/stats - Get production statistics
router.get("/stats", async (req, res) => {
  try {
    const totalOrders = await Production.countDocuments();

    const inProduction = await Production.countDocuments({
      status: "In Production",
    });

    const completed = await Production.countDocuments({
      status: "Completed",
    });

    const onHold = await Production.countDocuments({
      status: "On Hold",
    });

    const result = await Production.aggregate([
      {
        $group: {
          _id: null,
          averageProgress: { $avg: "$progress" },
        },
      },
    ]);

    const averageProgress = result.length > 0 ? Math.round(result[0].averageProgress) : 0;

    res.status(200).json({
      totalOrders,
      inProduction,
      completed,
      onHold,
      averageProgress,
    });
  } catch (error) {
    console.error("GET /api/production/stats error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch production statistics",
    });
  }
});

// GET /api/production/:id - Get a single production order
router.get("/:id", async (req, res) => {
  try {
    const order = await Production.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Production order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("GET /api/production/:id error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch production order",
    });
  }
});

// POST /api/production - Create a new production order
router.post("/", async (req, res) => {
  try {
    const {
      orderId,
      product,
      sku,
      quantity,
      unit,
      progress,
      status,
      startDate,
      dueDate,
    } = req.body;

    // Validate required fields
    const requiredFields = ["orderId", "product", "sku", "quantity", "startDate", "dueDate"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check for duplicate orderId
    const existingOrder = await Production.findOne({ orderId: orderId.toUpperCase() });
    if (existingOrder) {
      return res.status(400).json({
        message: `Order ID "${orderId}" already exists`,
      });
    }

    // Create new production order
    const newOrder = new Production({
      orderId: orderId.toUpperCase(),
      product: product.trim(),
      sku: sku.trim().toUpperCase(),
      quantity: Number(quantity),
      unit: unit || "Pcs",
      progress: progress !== undefined ? Number(progress) : 0,
      status: status || "In Production",
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
    });

    await newOrder.save();

    res.status(201).json({
      message: "Production order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("POST /api/production error:", error);
    res.status(400).json({
      message: error.message || "Failed to create production order",
    });
  }
});

// PUT /api/production/:id - Update a production order
router.put("/:id", async (req, res) => {
  try {
    const {
      orderId,
      product,
      sku,
      quantity,
      unit,
      progress,
      status,
      startDate,
      dueDate,
    } = req.body;

    const order = await Production.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Production order not found" });
    }

    // Check for duplicate orderId if it's being changed
    if (orderId && orderId.toUpperCase() !== order.orderId) {
      const existingOrder = await Production.findOne({
        orderId: orderId.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (existingOrder) {
        return res.status(400).json({
          message: `Order ID "${orderId}" already exists`,
        });
      }
    }

    // Build update object
    const updateData = {
      orderId: orderId ? orderId.toUpperCase() : order.orderId,
      product: product ? product.trim() : order.product,
      sku: sku ? sku.trim().toUpperCase() : order.sku,
      quantity: quantity !== undefined ? Number(quantity) : order.quantity,
      unit: unit || order.unit,
      progress: progress !== undefined ? Number(progress) : order.progress,
      startDate: startDate ? new Date(startDate) : order.startDate,
      dueDate: dueDate ? new Date(dueDate) : order.dueDate,
    };

    // Only update status if explicitly provided
    if (status) {
      updateData.status = status;
    }

    // Validate dates
    if (updateData.startDate && updateData.dueDate) {
      if (new Date(updateData.startDate) > new Date(updateData.dueDate)) {
        return res.status(400).json({
          message: "Start date cannot be after due date",
        });
      }
    }

    // Apply updates
    Object.assign(order, updateData);
    await order.save();

    res.status(200).json({
      message: "Production order updated successfully",
      order,
    });
  } catch (error) {
    console.error("PUT /api/production/:id error:", error);
    res.status(400).json({
      message: error.message || "Failed to update production order",
    });
  }
});

// DELETE /api/production/:id - Delete a production order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Production.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Production order not found" });
    }

    await Production.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Production order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/production/:id error:", error);
    res.status(500).json({
      message: error.message || "Failed to delete production order",
    });
  }
});

module.exports = router;