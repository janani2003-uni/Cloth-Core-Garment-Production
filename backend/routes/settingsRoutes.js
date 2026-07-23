const express = require("express");
const router = express.Router();

const SystemSettings = require("../models/SystemSettings");
const logActivity = require("../utils/logActivity");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getMinimumOrderQuantity, getAdvancePaymentPercentage } = require("../config/businessRules");

router.use(verifyToken);

async function getOrCreateSettings() {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  return settings;
}

// GET /api/settings/business-rules — read-only, any authenticated role.
// Lets the frontend validate against the real configured values instead of
// duplicating them as hardcoded constants.
router.get("/business-rules", (req, res) => {
  res.status(200).json({ success: true,
    data: {
      minimumOrderQuantity: getMinimumOrderQuantity(),
      advancePaymentPercentage: getAdvancePaymentPercentage(),
    },
  });
});

// GET /api/settings
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Get Settings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings
router.put("/", requireRole("admin"), async (req, res) => {
  try {
    const { orderIdPrefix } = req.body;

    if (orderIdPrefix === undefined) {
      return res.status(400).json({ success: false, message: "No valid fields were provided for update" });
    }

    const settings = await getOrCreateSettings();
    const previousPrefix = settings.orderIdPrefix;

    settings.orderIdPrefix = orderIdPrefix;
    await settings.save();

    if (settings.orderIdPrefix !== previousPrefix) {
      await logActivity({
        actor: req.user,
        action: "settings.order_id_prefix_changed",
        message: `Changed order ID prefix from "${previousPrefix}" to "${settings.orderIdPrefix}"`,
        targetType: "SystemSettings",
        targetId: settings._id,
      });
    }

    return res.status(200).json({ success: true, message: "Settings updated", data: settings });
  } catch (error) {
    console.error("Update Settings Error:", error);

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ success: false, message: firstError.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
