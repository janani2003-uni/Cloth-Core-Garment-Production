// src/components/order/InlineStockWarning.js
// Small inline warning shown beside a size row's quantity controls when the
// customer hits (or tries to exceed) the available stock for that size.
import React, { useEffect } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

function InlineStockWarning({ message, onDismiss, autoDismissMs = 4000 }) {
  useEffect(() => {
    if (!message || !onDismiss) return undefined;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, autoDismissMs]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="d-flex align-items-center gap-1"
      style={{
        color: "#b3261e",
        fontSize: 11.5,
        fontWeight: 600,
        marginTop: 4,
      }}
    >
      <IconAlertTriangle size={13} stroke={2.5} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default InlineStockWarning;
