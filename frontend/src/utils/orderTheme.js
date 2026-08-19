// Shared design tokens + step map for the Order Step 1-6 / Delivery flow.
// This is the same plum/mauve/pink/cream palette OrderStep1 already
// established — pulled out here so every order-flow page reads from one
// source instead of re-declaring its own copy (and drifting, like the old
// blue/orange leftovers in OrderStep2 had).
export const ORDER_COLORS = {
  plum900: "#190019",
  plum800: "#2B124C",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  pink200: "#DFB6B2",
  cream100: "#FBE4D8",
};

// Canonical order-flow steps, in the order the customer actually moves
// through them (routes as wired in App.js). The confirmation screen is
// intentionally excluded — it's a terminal/receipt screen, not a step you
// navigate back to. "Admin Approval" is a real gate, not just a label: the
// order is created and set to Pending here, and Payment is unreachable
// until an Admin/Supervisor approves it (enforced server-side, not just by
// hiding the button).
export const ORDER_STEPS = [
  { path: "/step1", label: "Garment" },
  { path: "/step2", label: "Design" },
  { path: "/step3", label: "Quantities" },
  { path: "/step4", label: "Review" },
  { path: "/order-delivery", label: "Delivery" },
  { path: "/order-approval", label: "Approval" },
  { path: "/step5", label: "Payments" },
];
