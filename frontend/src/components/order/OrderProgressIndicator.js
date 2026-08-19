// src/components/order/OrderProgressIndicator.js
import React from "react";
import { useLocation } from "react-router-dom";
import { IconCheck } from "@tabler/icons-react";
import { ORDER_STEPS } from "../../utils/orderTheme";

function OrderProgressIndicator() {
  const location = useLocation();
  const currentIndex = ORDER_STEPS.findIndex((s) => s.path === location.pathname);

  return (
    <nav className="order-progress" aria-label="Order progress">
      {ORDER_STEPS.map((step, index) => {
        const isDone = currentIndex >= 0 && index < currentIndex;
        const isCurrent = index === currentIndex;
        const state = isDone ? "is-done" : isCurrent ? "is-current" : "is-upcoming";

        return (
          <React.Fragment key={step.path}>
            <div className="order-progress-step">
              <span
                className={`order-progress-dot ${state}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? <IconCheck size={14} stroke={3} /> : index + 1}
              </span>
              <span className={`order-progress-label ${isCurrent ? "is-active" : ""}`}>
                {step.label}
              </span>
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <span className={`order-progress-line ${isDone ? "is-done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default OrderProgressIndicator;
