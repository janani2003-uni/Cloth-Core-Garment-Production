// src/utils/orderStatus.js
// Single place that turns a raw Order document into (a) a human display
// status + color and (b) the correct next destination. Used by the Shop
// Owner dashboard's "My Recent Orders", the cross-step "Recent Orders"
// dropdown, and (conceptually mirrored by, for the reasons noted at each
// call site) the notification click handlers — so "click an approved
// order" always means the same thing everywhere: Step 7 Payment for that
// exact order, never a different page depending on where you clicked from.
const DRAFT_KEY = "clothCoreOrderDraft";

// The Submitted -> Verified distinction (paymentRoutes.js only updates
// order.paymentStatus/amountPaid once Admin actually verifies) is an
// internal Admin review-queue detail — a shop owner shouldn't have to
// track it. The moment they submit a payment, every shop-owner-facing
// screen treats it as paid; Admin's own queues/verify actions are
// untouched and still work off the real Submitted/Verified payment
// records, since that workflow still has to happen behind the scenes.
// order.pendingVerification (attached by GET /api/orders) is the sum of
// this order's still-Submitted payments.
export function getEffectivePayment(order) {
  const verifiedPaid = Number(order?.amountPaid || 0);
  const pendingAmount = Number(order?.pendingVerification?.amount || 0);
  const total = Number(order?.totalAmount || 0);
  const effectivePaid = verifiedPaid + pendingAmount;
  const effectiveRemaining = Math.max(0, Math.round((total - effectivePaid) * 100) / 100);

  let status = order?.paymentStatus || "Pending";
  if (status !== "Full Paid" && pendingAmount > 0) {
    status = effectiveRemaining <= 0 ? "Full Paid" : "Advance Paid";
  }

  return { effectivePaid, effectiveRemaining, status };
}

export function getOrderDisplayStatus(order) {
  const approvalStatus = order?.approval?.status;

  if (approvalStatus === "Rejected") {
    return { label: "Rejected", tone: "danger" };
  }
  if (approvalStatus === "Pending") {
    return { label: "Pending Approval", tone: "warning" };
  }

  // Approved, or "Not Required" (Admin-created / pre-approval-feature
  // legacy orders) — fall through to the normal production/payment
  // lifecycle, same as before the approval gate existed.
  if (order?.status === "Delivered") return { label: "Delivered", tone: "success" };
  if (order?.status === "Cancelled") return { label: "Cancelled", tone: "danger" };
  if (order?.status === "In Delivery") return { label: "In Delivery", tone: "mauve" };
  if (order?.status === "Production") return { label: "In Production", tone: "mauve" };

  const { status: effectiveStatus } = getEffectivePayment(order);
  if (effectiveStatus === "Full Paid") return { label: "Paid", tone: "success" };
  if (effectiveStatus === "Advance Paid") return { label: "Advance Paid", tone: "mauve" };
  return { label: "Approved – Payment Pending", tone: "purple" };
}

export const TONE_COLORS = {
  success: { bg: "var(--clothcore-success-bg)", color: "var(--clothcore-success)" },
  warning: { bg: "var(--clothcore-warning-bg)", color: "var(--clothcore-warning)" },
  danger: { bg: "var(--clothcore-danger-bg)", color: "var(--clothcore-danger)" },
  mauve: { bg: "rgba(133,79,108,0.14)", color: "var(--clothcore-mauve)" },
  purple: { bg: "rgba(82,43,91,0.12)", color: "var(--clothcore-purple)" },
};

// Where clicking this order should go, and what to label the action.
export function getOrderActionTarget(order) {
  const approvalStatus = order?.approval?.status;
  const orderId = order?._id;

  if (approvalStatus === "Rejected") {
    return { label: "View Reason", path: "/order-approval", orderId };
  }
  if (approvalStatus === "Pending") {
    return { label: "View Status", path: "/order-approval", orderId };
  }
  const { status: effectiveStatus } = getEffectivePayment(order);
  if (order?.status === "Delivered" || order?.status === "In Delivery" || order?.status === "Production" || effectiveStatus === "Full Paid") {
    return { label: "View Order", path: "/orders", orderId };
  }
  // A payment was already submitted for the amount currently due — shown
  // as paid everywhere, so there's genuinely nothing left to pay right
  // now. Routes to the order list rather than back through Step 7, which
  // would otherwise invite submitting a second payment for the exact same
  // amount while the first is still working its way through Admin review
  // behind the scenes.
  if (order?.pendingVerification) {
    return { label: "View Order", path: "/orders", orderId };
  }
  // Approved and nothing currently paid/submitted for this stage — covers
  // both "never paid anything yet" and "advance verified, final balance
  // now open to pay" the same way, since Step 7 always shows whatever's
  // actually next due for this exact order.
  return { label: "Continue to Payment", path: "/step5", orderId };
}

// Reverse of the draft -> Order mapping in OrderApproval.js's createOrder()
// (item = "Garment (Fabric, Color)", garmentType, sizeBreakdown, design,
// deliveryDate, notes) — rebuilds the exact draft shape Step 1-4 and
// OrderDelivery read from, so revisiting them via "Back" from Step 6/7
// shows this specific order's actually-saved data instead of blank fields
// or (worse) another order's leftover draft. REPLACES the draft entirely
// rather than merging, since a stale field from a different order is worse
// than a missing one.
export function hydrateDraftFromOrder(order) {
  if (!order) return;

  const itemMatch = /^(.*) \((.*), (.*)\)$/.exec(order.item || "");
  const garment = order.garmentType || itemMatch?.[1] || "";
  const fabric = itemMatch?.[2] || "";
  const color = itemMatch?.[3] || "";

  const sizes = {};
  Object.entries(order.sizeBreakdown || {}).forEach(([size, qty]) => {
    sizes[size] = qty;
  });

  const draft = {
    orderId: order._id,
    garment,
    fabric,
    color,
    unitPrice: order.unitPrice,
    sizes,
    totalQuantity: order.quantity,
    deliveryDate: order.deliveryDate ? String(order.deliveryDate).slice(0, 10) : "",
    deliveryAddress: order.deliveryAddress || "",
    deliveryMethod: order.deliveryMethod || "",
    designNotes: order.notes || "",
    design:
      order.design?.designSource === "ai_generated"
        ? { designSource: "ai_generated", prompt: order.design.prompt, generatedDesignPath: order.design.generatedDesignPath }
        : order.design?.designSource === "uploaded_logo"
        ? {
            designSource: "uploaded_logo",
            uploadedLogoPath: order.design.uploadedLogoPath,
            uploadedLogoSource: order.design.uploadedLogoSource,
            fileName: order.design.fileName,
          }
        : null,
  };

  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

// Hydrates the draft from this exact order (see above), then navigates —
// so "click an order" always lands on the right page for its status AND
// shows that order's own saved data if the shop owner then clicks "Back"
// through the earlier steps to review what they entered.
export function goToOrder(navigate, order) {
  const target = getOrderActionTarget(order);

  if (target.orderId && (target.path === "/order-approval" || target.path === "/step5")) {
    hydrateDraftFromOrder(order);
  }

  navigate(target.path);
}

// Entry point for a fresh "Place Order" click (sidebar link, "Continue to
// Place Order" after completing the Shop Profile guard, etc.) — as opposed
// to Back/Next navigation *within* the wizard, or clicking a specific past
// order from Dashboard/Orders (which intentionally hydrates that order's
// own data via goToOrder above).
//
// draft.orderId is only ever set once Step 6 (OrderApproval.js) actually
// creates the real backend Order — i.e. once it's genuinely submitted for
// approval. If that's still sitting in the saved draft, walking back into
// Step 1 would silently resume/re-show that same already-submitted order
// instead of starting the next one, and by the time the shop owner reached
// Step 6 again nothing new would actually get created — same order, same
// "Pending Approval" status, no new order placed. A draft with no
// orderId yet, though, is just unfinished in-progress work (stopped
// partway through Steps 1-5) and should still resume normally so it isn't
// thrown away.
export function goToPlaceOrder(navigate) {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    if (draft.orderId) {
      localStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    localStorage.removeItem(DRAFT_KEY);
  }
  navigate("/step1");
}
