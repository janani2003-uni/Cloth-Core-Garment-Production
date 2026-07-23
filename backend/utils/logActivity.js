const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

// Fire-and-forget audit trail write. Never throws into the caller's request
// handler — a logging failure should not fail the real action that triggered it.
//
// `actor` is normally just req.user ({ id, role }) from the JWT — the token
// doesn't carry a name, so we look it up here once rather than repeating a
// User lookup at every call site.
async function logActivity({ actor, action, message, targetType, targetId }) {
  try {
    let actorName = "System";

    if (actor?.id) {
      const user = await User.findById(actor.id).select("firstName lastName");
      if (user) {
        actorName = `${user.firstName} ${user.lastName}`.trim();
      }
    }

    await ActivityLog.create({
      actorId: actor?.id || null,
      actorName,
      actorRole: actor?.role || "",
      action,
      message,
      targetType: targetType || "",
      targetId: targetId || null,
    });
  } catch (error) {
    console.error("Activity Log Error:", error.message);
  }
}

module.exports = logActivity;
