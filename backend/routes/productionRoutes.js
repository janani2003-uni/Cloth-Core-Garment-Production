const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Production = require("../models/Production");
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Maps a directly-chosen stage to the progress value that reproduces it
// under Production's own pre("save") derivation (see models/Production.js),
// so setting a stage explicitly stays consistent with the existing
// progress-driven stage logic instead of bypassing it.
const STAGE_PROGRESS_MAP = {
  "Not Started": 0,
  Cutting: 25,
  Sewing: 50,
  "Quality Assurance": 75,
  Packing: 99,
  Completed: 100,
};

// The Shop Owner's Orders page (and every other view that reads the Order
// model directly — Dashboard, RoleOrdersView, AdminOrderDetails, etc.) shows
// `order.progress`, but Supervisors only ever move `production.progress`
// forward (via the stage buttons or a manual edit). Without this, those
// pages stayed stuck at 0% forever regardless of how far production had
// actually gotten. Called after every Production save so the two numbers
// can never drift apart.
async function syncOrderProgress(productionOrder) {
  try {
    await Order.updateOne(
      { orderId: productionOrder.orderId },
      { $set: { progress: productionOrder.progress } }
    );
  } catch (error) {
    console.error("Sync Order Progress Error:", error);
  }
}

// Called right after any production update that might have just reached
// "Completed" — lets the shop owner know their order is ready to move to
// delivery. Doesn't touch order.status itself: moving an order to
// "In Delivery" is a distinct Admin/Supervisor action (creating and
// dispatching a Delivery record — see deliveryRoutes.js), not automatic.
// A simple `notified` snapshot on the Production doc's updatedAt vs a
// re-check of Notification history isn't worth the complexity here, so this
// relies on Production.pre("save") only ever setting status to "Completed"
// once meaningfully (progress hits 100) — a second save while already
// Completed would just mean re-confirming, not a fresh completion.
async function notifyIfJustCompleted(productionOrder, wasAlreadyCompleted) {
  if (productionOrder.status !== "Completed" || wasAlreadyCompleted) return;

  const order = await Order.findOne({ orderId: productionOrder.orderId });
  if (!order) return;

  if (order.userId) {
    await Notification.create({
      title: "Production Completed",
      message: `Production for your order ${order.orderId} is complete. It will be scheduled for delivery shortly.`,
      type: "production",
      relatedId: order._id,
      relatedModel: "Order",
      recipientId: order.userId,
    });
  }
}

router.use(verifyToken);

// Admin and Supervisor can both view production data; only Admin can
// create/edit/delete full records, and only Admin + Supervisor can move an
// order's stage forward.
const canView = requireRole("admin", "supervisor");
const canManage = requireRole("admin");
const canUpdateStage = requireRole("admin", "supervisor");
const canAssign = requireRole("admin", "supervisor");

// NOTE: the "staff" role has been removed from the system (see User.js) —
// assignedStaffIds/assign endpoints below are dormant as a result (there is
// no longer a role that can ever populate them) but are left in place
// rather than torn out; ask before repurposing or removing this subsystem.
function buildScopeFilter(req) {
  if (req.user.role === "staff") {
    return { assignedStaffIds: req.user.id };
  }
  return {};
}

// GET /api/production - Get all production orders with pagination and search
router.get("/", canView, async (req, res) => {
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

    const query = { ...searchQuery, ...buildScopeFilter(req) };

    // Get total count for pagination
    const totalItems = await Production.countDocuments(query);

    // Get paginated results
    const items = await Production.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({ success: true,
      items,
      totalItems,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/production error:", error);
    res.status(500).json({ success: false,
      message: error.message || "Failed to fetch production orders",
    });
  }
});

// GET /api/production/stats - Get production statistics
router.get("/stats", canView, async (req, res) => {
  try {
    const scope = buildScopeFilter(req);

    const totalOrders = await Production.countDocuments(scope);

    const inProduction = await Production.countDocuments({
      ...scope,
      status: "In Production",
    });

    const completed = await Production.countDocuments({
      ...scope,
      status: "Completed",
    });

    const onHold = await Production.countDocuments({
      ...scope,
      status: "On Hold",
    });

    const cancelled = await Production.countDocuments({
      ...scope,
      status: "Cancelled",
    });

    const result = await Production.aggregate([
      { $match: scope },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: "$progress" },
        },
      },
    ]);

    const averageProgress = result.length > 0 ? Math.round(result[0].averageProgress) : 0;

    // Progress buckets, matching the stage thresholds used elsewhere
    // (Not Started / Cutting / Sewing / Quality Assurance / Packing / Completed)
    const progressBuckets = await Production.aggregate([
      { $match: scope },
      {
        $bucket: {
          groupBy: "$progress",
          boundaries: [0, 1, 26, 51, 76, 100, 101],
          default: "other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const bucketMap = {};
    progressBuckets.forEach((b) => {
      bucketMap[b._id] = b.count;
    });

    const progressDistribution = [
      { label: "Not Started (0%)", progress: 0, count: bucketMap[0] || 0 },
      { label: "Cutting (1-25%)", progress: 25, count: bucketMap[1] || 0 },
      { label: "Sewing (26-50%)", progress: 50, count: bucketMap[26] || 0 },
      { label: "Quality Assurance (51-75%)", progress: 75, count: bucketMap[51] || 0 },
      { label: "Packing (76-99%)", progress: 99, count: bucketMap[76] || 0 },
      { label: "Completed (100%)", progress: 100, count: bucketMap[100] || 0 },
    ];

    // Real recent activity derived from production records themselves
    const recentActivity = await Production.find(scope)
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("orderId stage status updatedAt")
      .lean();

    res.status(200).json({ success: true,
      totalOrders,
      inProduction,
      completed,
      onHold,
      cancelled,
      averageProgress,
      progressDistribution,
      recentActivity,
    });
  } catch (error) {
    console.error("GET /api/production/stats error:", error);
    res.status(500).json({ success: false,
      message: error.message || "Failed to fetch production statistics",
    });
  }
});

// GET /api/production/assignable-staff - User accounts with role "staff",
// for Supervisor/Admin to pick from when assigning work. Only the minimal
// fields needed to display a name are returned.
router.get("/assignable-staff", canAssign, async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" })
      .select("firstName lastName email")
      .sort({ firstName: 1 });

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error("GET /api/production/assignable-staff error:", error);
    res.status(500).json({ success: false,
      message: error.message || "Failed to fetch assignable staff",
    });
  }
});

// GET /api/production/:id - Get a single production order
router.get("/:id", canView, async (req, res) => {
  try {
    const order = await Production.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Production order not found" });
    }

    if (
      req.user.role === "staff" &&
      !(order.assignedStaffIds || []).some((staffId) => String(staffId) === String(req.user.id))
    ) {
      return res.status(403).json({ success: false, message: "This production order is not assigned to you" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("GET /api/production/:id error:", error);
    res.status(500).json({ success: false,
      message: error.message || "Failed to fetch production order",
    });
  }
});

// POST /api/production - Create a new production order
router.post("/", canManage, async (req, res) => {
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
      return res.status(400).json({ success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check for duplicate orderId
    const existingOrder = await Production.findOne({ orderId: orderId.toUpperCase() });
    if (existingOrder) {
      return res.status(400).json({ success: false,
        message: `Order ID "${orderId}" already exists`,
      });
    }

    // Production can never start before the order is approved — the normal
    // path to production (AdminOrders.js "Send to Production", which goes
    // through orderRoutes.js) already enforces this; this is the same rule
    // applied directly here since this endpoint is its own real, callable
    // route.
    const linkedOrder = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (linkedOrder && linkedOrder.approval?.status !== "Approved") {
      return res.status(409).json({ success: false, message: "This order must be approved before production can start." });
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
    await syncOrderProgress(newOrder);
    await notifyIfJustCompleted(newOrder, false);

    res.status(201).json({ success: true,
      message: "Production order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("POST /api/production error:", error);
    res.status(400).json({ success: false,
      message: error.message || "Failed to create production order",
    });
  }
});

// PUT /api/production/:id - Update a production order
router.put("/:id", canManage, async (req, res) => {
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
      return res.status(404).json({ success: false, message: "Production order not found" });
    }

    // Check for duplicate orderId if it's being changed
    if (orderId && orderId.toUpperCase() !== order.orderId) {
      const existingOrder = await Production.findOne({
        orderId: orderId.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (existingOrder) {
        return res.status(400).json({ success: false,
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
        return res.status(400).json({ success: false,
          message: "Start date cannot be after due date",
        });
      }
    }

    const previousStage = order.stage;
    const wasAlreadyCompleted = order.status === "Completed";

    // Apply updates
    Object.assign(order, updateData);
    await order.save();
    await syncOrderProgress(order);
    await notifyIfJustCompleted(order, wasAlreadyCompleted);

    // Let the shop owner know when their order's production stage actually
    // moves forward (Cutting -> Sewing -> ... -> Completed).
    if (order.stage !== previousStage) {
      const relatedOrder = await Order.findOne({ orderId: order.orderId });

      if (relatedOrder?.userId) {
        await Notification.create({
          title: "Production Update",
          message: `Order ${order.orderId} has moved to "${order.stage}".`,
          type: "production",
          relatedId: order._id,
          relatedModel: "Production",
          recipientId: relatedOrder.userId,
        });
      }

      await logActivity({
        actor: req.user,
        action: "production.stage_changed",
        message: `Moved production for order ${order.orderId} from "${previousStage}" to "${order.stage}"`,
        targetType: "Production",
        targetId: order._id,
      });
    }

    res.status(200).json({ success: true,
      message: "Production order updated successfully",
      order,
    });
  } catch (error) {
    console.error("PUT /api/production/:id error:", error);
    res.status(400).json({ success: false,
      message: error.message || "Failed to update production order",
    });
  }
});

// PATCH /api/production/:id/stage - Move an order to a specific production
// stage (Cutting/Sewing/Quality Assurance/Packing/Completed) without giving
// Supervisors full edit access to product/sku/quantity/dates.
router.patch("/:id/stage", canUpdateStage, async (req, res) => {
  try {
    const { stage } = req.body;

    if (!stage || !Object.prototype.hasOwnProperty.call(STAGE_PROGRESS_MAP, stage)) {
      return res.status(400).json({ success: false,
        message: "A valid stage is required",
      });
    }

    const order = await Production.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Production order not found" });
    }

    if (order.status === "On Hold" || order.status === "Cancelled") {
      return res.status(400).json({ success: false,
        message: `Cannot update stage while status is "${order.status}"`,
      });
    }

    const previousStage = order.stage;
    const wasAlreadyCompleted = order.status === "Completed";

    order.progress = STAGE_PROGRESS_MAP[stage];
    await order.save();
    await syncOrderProgress(order);
    await notifyIfJustCompleted(order, wasAlreadyCompleted);

    if (order.stage !== previousStage) {
      const relatedOrder = await Order.findOne({ orderId: order.orderId });

      if (relatedOrder?.userId) {
        await Notification.create({
          title: "Production Update",
          message: `Order ${order.orderId} has moved to "${order.stage}".`,
          type: "production",
          relatedId: order._id,
          relatedModel: "Production",
          recipientId: relatedOrder.userId,
        });
      }

      await logActivity({
        actor: req.user,
        action: "production.stage_changed",
        message: `Moved production for order ${order.orderId} from "${previousStage}" to "${order.stage}"`,
        targetType: "Production",
        targetId: order._id,
      });
    }

    res.status(200).json({ success: true,
      message: "Stage updated successfully",
      order,
    });
  } catch (error) {
    console.error("PATCH /api/production/:id/stage error:", error);
    res.status(400).json({ success: false,
      message: error.message || "Failed to update stage",
    });
  }
});

// PATCH /api/production/:id/assign - Assign (or reassign) Staff to a
// production order. Optional and backward-compatible: existing records with
// no assignment keep working exactly as before, and this route never
// touches product/sku/quantity/dates/progress/status.
router.patch("/:id/assign", canAssign, async (req, res) => {
  try {
    const { assignedStaffIds, assignmentNotes } = req.body;

    if (!Array.isArray(assignedStaffIds)) {
      return res.status(400).json({ success: false, message: "assignedStaffIds must be an array" });
    }

    const invalidId = assignedStaffIds.find((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidId) {
      return res.status(400).json({ success: false, message: "One or more staff IDs are invalid" });
    }

    if (assignedStaffIds.length > 0) {
      const validStaffCount = await User.countDocuments({
        _id: { $in: assignedStaffIds },
        role: "staff",
      });
      if (validStaffCount !== assignedStaffIds.length) {
        return res.status(400).json({ success: false, message: "One or more selected users are not Staff accounts" });
      }
    }

    const order = await Production.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Production order not found" });
    }

    const previouslyAssignedIds = (order.assignedStaffIds || []).map((id) => String(id));

    order.assignedStaffIds = assignedStaffIds;
    order.assignmentNotes = assignmentNotes?.trim() || "";
    order.assignedAt = new Date();
    order.assignedBy = req.user.id;
    if (req.user.role === "supervisor") {
      order.supervisorId = req.user.id;
    }

    await order.save();

    const newlyAssignedIds = assignedStaffIds.filter((id) => !previouslyAssignedIds.includes(String(id)));

    await Promise.all(
      newlyAssignedIds.map((staffId) =>
        Notification.create({
          title: "New Work Assigned",
          message: `You were assigned to production order ${order.orderId} (${order.product}).`,
          type: "production",
          relatedId: order._id,
          relatedModel: "Production",
          recipientId: staffId,
        })
      )
    );

    await logActivity({
      actor: req.user,
      action: "production.assigned",
      message: `Assigned ${assignedStaffIds.length} staff member(s) to production order ${order.orderId}`,
      targetType: "Production",
      targetId: order._id,
    });

    res.status(200).json({ success: true, message: "Assignment updated", order });
  } catch (error) {
    console.error("PATCH /api/production/:id/assign error:", error);
    res.status(500).json({ success: false,
      message: error.message || "Failed to update assignment",
    });
  }
});

// DELETE /api/production/:id - Delete a production order
router.delete("/:id", canManage, async (req, res) => {
  try {
    const order = await Production.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Production order not found" });
    }

    await Production.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true,
      message: "Production order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/production/:id error:", error);
    res.status(500).json({ success: false,
      message: error.message || "Failed to delete production order",
    });
  }
});

module.exports = router;