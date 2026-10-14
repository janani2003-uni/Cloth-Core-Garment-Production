// backend/utils/notificationPrefs.js
// Maps a Notification's `type` to the matching field on
// User.notificationPreferences (see backend/models/User.js) — used to hide
// notifications a user has turned off in Settings > Notifications instead
// of showing every notification unconditionally. Types with no entry here
// (ticket, inventory, user, staff, system) aren't user-configurable and are
// always shown.
const TYPE_TO_PREF_KEY = {
  order: "orderUpdates",
  production: "productionAlerts",
  delivery: "deliveryAlerts",
  payment: "paymentAlerts",
};

// Given a user's notificationPreferences (possibly undefined, e.g. for an
// older account created before this field existed), returns the list of
// Notification `type` values that should be excluded — anything explicitly
// set to false. Missing/undefined prefs default to enabled (matches the
// User model's own default: true), so nothing is hidden just because a
// field wasn't set yet.
function getDisabledNotificationTypes(prefs) {
  if (!prefs) return [];
  return Object.entries(TYPE_TO_PREF_KEY)
    .filter(([, prefKey]) => prefs[prefKey] === false)
    .map(([type]) => type);
}

module.exports = { TYPE_TO_PREF_KEY, getDisabledNotificationTypes };
