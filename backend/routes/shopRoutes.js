const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const Shop = require("../models/Shop");
const Notification = require("../models/Notification");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { uploadLogo, handleUpload, toWebPath } = require("../middleware/upload");

router.use(verifyToken);

// Deletes a previously-uploaded logo file from disk when it's replaced or
// removed — best-effort only; a missing/already-gone file is not an error
// worth failing the request over.
function deleteLogoFileIfExists(logoPath) {
  if (!logoPath || !logoPath.startsWith("/uploads/")) return;
  const absolute = path.join(__dirname, "..", logoPath);
  fs.unlink(absolute, () => {});
}

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

// Single, backend-authoritative definition of "has this Shop Owner filled
// in enough of their profile to place an order" — mirrors the Shop model's
// own required: true fields (shopName, shopAddress, phone), so this can
// never drift from what the create/edit form itself requires. Used by
// GET /profile-status below; the frontend's ShopProfileGuard reads that
// endpoint rather than recomputing this rule itself.
function isShopProfileComplete(shop) {
  return Boolean(
    shop &&
    shop.shopName?.trim() &&
    shop.shopAddress?.trim() &&
    shop.phone?.trim()
  );
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

// Shared upsert used by both POST / (legacy) and PUT /me below, so there is
// exactly one place that decides create-vs-update, one validation rule, and
// one response shape — the two-endpoint split (POST for create, PUT for
// edit, each with its own hand-rolled validation and error message) was the
// actual root cause of "Could not submit shop profile.": they were two
// separate, independently-maintained code paths that had drifted apart.
async function upsertShopProfile(req, res) {
  try {
    const { shopName, shopAddress, phone, email } = req.body;

    // shopName/shopAddress/phone are required whether creating or updating
    // — the same rule the Shop model itself enforces, checked here first so
    // a missing field always gets this specific message rather than a raw
    // Mongoose ValidationError string.
    if (!shopName?.trim() || !shopAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false,
        message: "Shop name, address and phone number are required.",
      });
    }

    // Email is explicitly optional — only validate its format if one was
    // actually provided, never require it.
    if (email && String(email).trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid shop email address." });
    }

    const updates = {};
    PROFILE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    });

    let shop = await Shop.findOne({ ownerId: req.user.id });
    const isNew = !shop;

    if (isNew) {
      shop = await Shop.create({ ownerId: req.user.id, ...updates });

      await Notification.create({
        title: "New Shop Registration",
        message: `${shop.shopName} submitted a shop profile for approval.`,
        type: "user",
        relatedId: shop._id,
        relatedModel: "Shop",
      });
    } else {
      // Changing the shop's identity (its name) after approval re-opens it
      // for Admin review rather than silently keeping "Approved" status on
      // information Admin never actually reviewed. Contact-detail-only
      // edits (address, phone, email, etc.) save immediately either way.
      const isIdentityChange = updates.shopName && updates.shopName !== shop.shopName;
      if (isIdentityChange && shop.approvalStatus === "Approved") {
        updates.approvalStatus = "Pending";
        updates.reviewedAt = null;
        updates.reviewedBy = null;
      }

      const reopenedForApproval = isIdentityChange && updates.approvalStatus === "Pending";

      Object.assign(shop, updates);
      await shop.save();

      // Only alert Admin/Supervisor when the edit actually re-opened the
      // shop for approval — a routine contact-detail edit (address, phone,
      // description, etc.) doesn't need their attention and used to
      // broadcast a notification for every single one of those too, which
      // just drowned out the ones that actually mattered.
      if (reopenedForApproval) {
        await Notification.create({
          title: "Shop Profile Updated",
          message: `${shop.shopName} updated their shop name and requires re-approval.`,
          type: "user",
          relatedId: shop._id,
          relatedModel: "Shop",
          recipientId: null,
        });
      }
    }

    return res.status(isNew ? 201 : 200).json({ success: true,
      message: "Shop Profile updated successfully.",
      shop,
    });
  } catch (error) {
    console.error("Upsert Shop Profile Error:", error.message);

    // Surface real validation problems (e.g. a Mongoose schema rule) with
    // their actual message instead of a generic 500, so the frontend can
    // show something the Shop Owner can act on.
    if (error.name === "ValidationError") {
      const firstMessage = Object.values(error.errors)[0]?.message || "Please check the highlighted fields.";
      return res.status(400).json({ success: false, message: firstMessage });
    }

    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A shop profile already exists for this account." });
    }

    return res.status(500).json({ success: false, message: "Unable to update profile. Please try again." });
  }
}

// Shop owner creates/updates their own shop profile in one step — kept as
// POST / for any existing caller, but it's the exact same upsert logic as
// PUT /me below (see upsertShopProfile above). ShopProfile.js now calls
// PUT /me for both the first-time and edit flows; this route is legacy-
// compatible, not a second implementation.
router.post("/", upsertShopProfile);

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

// Whether the logged-in Shop Owner has filled in enough of their profile to
// place an order — the single source of truth ShopProfileGuard.js checks
// before letting them into the order-placement flow (Step 1 through
// Payment). Deliberately separate from shop.approvalStatus — that's a
// later, independent gate enforced at order-submission time in
// orderRoutes.js and is not this route's concern.
router.get("/profile-status", async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });

    return res.status(200).json({
      success: true,
      hasShop: Boolean(shop),
      profileComplete: isShopProfileComplete(shop),
    });
  } catch (error) {
    console.error("Get Shop Profile Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Shop owner creates OR updates their own profile in one upsert — the
// primary route ShopProfile.js calls for both the first-ever save and every
// edit after that. Approval status, shopCode, credit limit, isActive and
// review fields are never in PROFILE_FIELDS, so they can't be touched from
// here — Admin-only, via the routes below.
router.put("/me", upsertShopProfile);

// Shop Logo upload — a real disk-backed file (see backend/middleware/upload.js),
// validated for MIME type (JPG/JPEG/PNG/WEBP) and size, and ownership (only
// the authenticated shop owner's own Shop record is ever touched). Only the
// resulting relative web path is stored in MongoDB; the previous logo file
// (if any) is deleted from disk once the new one is saved, so replacing a
// logo doesn't leave orphaned files behind. Persists across refresh and
// logout/login because it's read straight from the Shop document like every
// other profile field, never from localStorage or React state.
router.post("/logo", handleUpload(uploadLogo, "logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo file was provided." });
    }

    const shop = await Shop.findOne({ ownerId: req.user.id });
    if (!shop) {
      // Clean up the just-saved file — it would otherwise be orphaned.
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Please save your Shop Profile before uploading a logo." });
    }

    const previousLogoPath = shop.logoPath;
    const newLogoPath = toWebPath(req.file, "logos");

    shop.logoPath = newLogoPath;
    shop.logoOriginalName = req.file.originalname;
    shop.logoMimeType = req.file.mimetype;
    shop.logoUploadedAt = new Date();
    await shop.save();

    if (previousLogoPath && previousLogoPath !== newLogoPath) {
      deleteLogoFileIfExists(previousLogoPath);
    }

    return res.status(200).json({ success: true, message: "Shop logo updated.", shop });
  } catch (error) {
    console.error("Upload Shop Logo Error:", error);
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ success: false, message: error.message || "Could not upload logo." });
  }
});

// Remove the shop's logo entirely (no replacement) — deletes the file from
// disk and clears the reference on the Shop document.
router.delete("/logo", async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    if (!shop) {
      return res.status(404).json({ success: false, message: "No shop found for this account" });
    }

    deleteLogoFileIfExists(shop.logoPath);
    shop.logoPath = "";
    shop.logoOriginalName = "";
    shop.logoMimeType = "";
    shop.logoUploadedAt = null;
    await shop.save();

    return res.status(200).json({ success: true, message: "Shop logo removed.", shop });
  } catch (error) {
    console.error("Remove Shop Logo Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: list all shops
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate("ownerId", "firstName lastName email shopName")
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
      "firstName lastName email shopName"
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
