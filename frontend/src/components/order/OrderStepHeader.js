// src/components/order/OrderStepHeader.js
// Shared step badge + title + supporting text, used at the top of every
// order-flow page instead of each page hand-rolling its own header markup
// (which is how the old blue "Step 2" badge on OrderStep2 drifted from
// everyone else's plum/mauve badge). Also the single place the Admin-only
// test navigation panel is mounted, so every one of the 7 order-flow pages
// gets it for free instead of seven separate copies.
//
// The "My Recent Orders" shortcut used to live here too, but it's been
// removed from every order-placement step (Steps 1-7) — it's still fully
// available on the Dashboard and the Orders page, which is where recent-
// order access is meant to live; it was only ever redundant clutter inside
// the step-by-step placement flow itself.
import React from "react";
import { ORDER_COLORS as C, ORDER_STEPS } from "../../utils/orderTheme";
import { getUser } from "../../utils/auth";
import OrderProgressIndicator from "./OrderProgressIndicator";
import AdminOrderFlowNav from "./AdminOrderFlowNav";

function OrderStepHeader({ stepIndex, title, subtitle, icon }) {
  const total = ORDER_STEPS.length;
  const isAdmin = getUser()?.role === "admin";

  return (
    <div className="mb-4">
      {isAdmin && <AdminOrderFlowNav />}

      <OrderProgressIndicator />

      <div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.mauve500,
            marginBottom: 6,
          }}
        >
          Step {stepIndex} of {total}
        </div>
        <h1 className="fw-bold d-flex align-items-center flex-wrap gap-2" style={{ fontSize: "2rem", color: C.plum900 }}>
          {icon}
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 mb-0" style={{ fontSize: "1.05rem", color: C.mauve500 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default OrderStepHeader;
