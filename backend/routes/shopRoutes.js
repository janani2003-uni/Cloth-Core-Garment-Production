const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Shop = require("../models/Shop");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

// Generates a readable Shop ID like "SHOP-2026-001", assigned once on
// approval — mirrors generateOrderId() in orderRoutes.js. Not
// concurrency-safe against simultaneous approvals, but shop approvals are a
// low-volume, one-at-a-time Admin action, so a simple count-based sequence
// is sufficient.
async function generateShopCode() {
  const year = new Date().getFullYear();
  const prefix = `SHOP-${year}-`;
  const count = await Shop.countDocuments({ shopCode: { $regex: `^${prefix}` } });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}

const PROFILE_FIELDS = [
  "shopName",
  "shopAddress",
  "phone",
  "email",
  "city",
  "district",
  "postalCode",
  "businessType",
  "businessRegistrationNumber",
  "garmentCategories",
  "estimatedMonthlyVolume",
  "preferredPaymentMethod",
  "deliveryInstructions",
  "businessDescription",
];

// Shop owner registers their shop details (once logged in)
router.post("/", async (req, res) => {
  try {
    const { shopName, shopAddress, phone } = req.body;

    if (!shopName || !shopAddress || !phone) {
      return res.status(400).json({ success: false,
        message: "Shop name, address and phone are required",
      });
    }

    const existingShop = await Shop.findOne({ ownerId: req.user.id });

    if (existingShop) {
      return res.status(400).json({ success: false,
        message: "A shop is already registered for this account",
      });
    }

    const payload = { ownerId: req.user.id };
    PROFILE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        payload[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    });

    const shop = await Shop.create(payload);

    await Notification.create({
      title: "New Shop Registration",
      message: `${shop.shopName} submitted a shop profile for approval.`,
      type: "user",
      relatedId: shop._id,
      relatedModel: "Shop",
    });

    return res.status(201).json({ success: true,
      message: "Shop profile submitted for approval",
      shop,
    });
  } catch (error) {
    console.error("Register Shop Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// The logged-in shop owner's own shop
router.get("/my-shop", async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });

    if (!shop) {
      return res.status(404).json({ success: false, message: "No shop found for this account" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    console.error("Get My Shop Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Shop owner updates their own profile. Approval status, shopCode, credit
// limit, isActive and review fields are never in PROFILE_FIELDS, so they
// can't be touched from here — Admin-only, via the routes below.
router.put("/me", async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });

    if (!shop) {
      return res.status(404).json({ success: false, message: "No shop found for this account" });
    }

    const updates = {};
    PROFILE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields were provided for update" });
    }

    // Changing the shop's identity (its name) after approval re-opens it for
    // Admin review rather than silently keeping "Approved" status on
    // information Admin never actually reviewed. Contact-detail-only edits
    // (address, phone, email, etc.) save immediately either way.
    const isIdentityChange = updates.shopName && updates.shopName !== shop.shopName;
    if (isIdentityChange && shop.approvalStatus === "Approved") {
      updates.approvalStatus = "Pending";
      updates.reviewedAt = null;
      updates.reviewedBy = null;
    }

    Object.assign(shop, updates);
    await shop.save();

    if (isIdentityChange && updates.approvalStatus === "Pending") {
      await Notification.create({
        title: "Shop Profile Updated",
        message: `${shop.shopName} updated their shop name and requires re-approval.`,
        type: "user",
        relatedId: shop._id,
        relatedModel: "Shop",
      });
    } else {
      await Notification.create({
        title: "Shop Profile Updated",
        message: `${shop.shopName} updated their shop profile.`,
        type: "user",
        relatedId: shop._id,
        relatedModel: "Shop",
        recipientId: null,
      });
    }

    return res.status(200).json({ success: true, message: "Shop profile updated", shop });
  } catch (error) {
    console.error("Update My Shop Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: list all shops
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate("ownerId", "firstName lastName email factoryName")
      .sort({ createdAt: -1 });

    return res.status(200).json(shops);
  } catch (error) {
    console.error("Get Shops Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: get one shop
router.get("/:id", requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid shop ID" });
    }

    const shop = await Shop.findById(req.params.id).populate(
      "ownerId",
      "firstName lastName email factoryName"
    );

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    console.error("Get Shop Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: approve a shop — assigns a permanent Shop ID the first time a shop
// is ever approved (re-approval after an identity-change resubmission keeps
// the original code rather than issuing a new one).
router.put("/:id/approve", requireRole("admin"), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    shop.approvalStatus = "Approved";
    shop.rejectionReason = "";
    shop.reviewedAt = new Date();
    shop.reviewedBy = req.user.id;

    if (!shop.shopCode) {
      shop.shopCode = await generateShopCode();
    }

    await shop.save();

    await Notification.create({
      title: "Shop Approved",
      message: `${shop.shopName} has been approved and may now place orders. Shop ID: ${shop.shopCode}.`,
      type: "user",
      relatedId: shop._id,
      relatedModel: "Shop",
      recipientId: shop.ownerId,
    });

    await logActivity({
      actor: req.user,
      action: "shop.approved",
      message: `Approved shop "${shop.shopName}" (${shop.shopCode})`,
      targetType: "Shop",
      targetId: shop._id,
    });

    return res.status(200).json({ success: true, message: "Shop approved", shop });
  } catch (error) {
    console.error("Approve Shop Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: reject a shop
router.put("/:id/reject", requireRole("admin"), async (req, res) => {
  try {
    const { reason } = req.body;

    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "Rejected",
        rejectionReason: reason?.trim() || "",
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    await Notification.create({
      title: "Shop Rejected",
      message: `${shop.shopName}'s profile needs changes before approval.`,
      type: "user",
      relatedId: shop._id,
      relatedModel: "Shop",
      recipientId: shop.ownerId,
    });

    await logActivity({
      actor: req.user,
      action: "shop.rejected",
      message: `Rejected shop "${shop.shopName}"`,
      targetType: "Shop",
      targetId: shop._id,
    });

    return res.status(200).json({ success: true, message: "Shop rejected", shop });
  } catch (error) {
    console.error("Reject Shop Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: set a shop's credit limit
router.patch("/:id/credit-limit", requireRole("admin"), async (req, res) => {
  try {
    const { creditLimit } = req.body;

    if (creditLimit === undefined || Number(creditLimit) < 0) {
      return res.status(400).json({ success: false, message: "A valid, non-negative credit limit is required" });
    }

    const shop = await Shop.findByIdAndUpdate(req.params.id, { creditLimit: Number(creditLimit) }, { new: true });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    await Notification.create({
      title: "Credit Limit Updated",
      message: `Your shop's credit limit was set to LKR ${Number(creditLimit).toLocaleString()}.`,
      type: "user",
      relatedId: shop._id,
      relatedModel: "Shop",
      recipientId: shop.ownerId,
    });

    await logActivity({
      actor: req.user,
      action: "shop.credit_limit_updated",
      message: `Set credit limit for "${shop.shopName}" to ${creditLimit}`,
      targetType: "Shop",
      targetId: shop._id,
    });

    return res.status(200).json({ success: true, message: "Credit limit updated", shop });
  } catch (error) {
    console.error("Update Credit Limit Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: suspend or reactivate a shop
router.patch("/:id/status", requireRole("admin"), async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive (true/false) is required" });
    }

    const shop = await Shop.findByIdAndUpdate(req.params.id, { isActive }, { new: true });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    await Notification.create({
      title: isActive ? "Shop Reactivated" : "Shop Suspended",
      message: isActive
        ? `${shop.shopName} has been reactivated and can place orders again.`
        : `${shop.shopName} has been suspended. Ordering is temporarily unavailable.`,
      type: "user",
      relatedId: shop._id,
      relatedModel: "Shop",
      recipientId: shop.ownerId,
    });

    await logActivity({
      actor: req.user,
      action: isActive ? "shop.reactivated" : "shop.suspended",
      message: `${isActive ? "Reactivated" : "Suspended"} shop "${shop.shopName}"`,
      targetType: "Shop",
      targetId: shop._id,
    });

    return res.status(200).json({ success: true, message: "Shop status updated", shop });
  } catch (error) {
    console.error("Update Shop Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: general update (kept for backward compatibility with existing
// callers of this route)
router.put("/:id", requireRole("admin"), async (req, res) => {
  try {
    const allowedFields = [
      "shopName",
      "shopAddress",
      "phone",
      "creditLimit",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const shop = await Shop.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    return res.status(200).json({ success: true, message: "Shop updated", shop });
  } catch (error) {
    console.error("Update Shop Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
