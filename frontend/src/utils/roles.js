// Canonical stored role values across the app — must match backend/models/User.js's enum exactly.
export const ROLE_VALUES = ["admin", "shopOwner", "supervisor", "user"];

const ROLE_LABELS = {
  admin: "Admin",
  shopOwner: "Shop Owner",
  supervisor: "Supervisor",
  user: "User",
};

// Converts a stored role value (e.g. "shopOwner") into a human-readable
// label (e.g. "Shop Owner") for display only — never compare against this.
export function formatRoleLabel(role) {
  if (!role) return "Unknown";
  return ROLE_LABELS[role] || role;
}
