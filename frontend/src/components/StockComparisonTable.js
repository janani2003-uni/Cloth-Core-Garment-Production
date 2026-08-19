// src/components/StockComparisonTable.js
// Requested vs. currently-available stock, per size — used by the Admin/
// Supervisor approval detail view so a reviewer can see at a glance whether
// there's enough stock to approve, without doing the math themselves.
import React from "react";
import { IconCheck, IconAlertTriangle, IconX } from "@tabler/icons-react";

const C = { plum900: "#190019", mauve500: "#854F6C" };

function statusFor(requested, available) {
  if (requested > available) return "insufficient";
  if (available - requested <= Math.max(5, available * 0.1)) return "low";
  return "available";
}

const BADGE_META = {
  available: { label: "Available", bg: "rgba(31,122,68,0.12)", color: "#1f7a44", Icon: IconCheck },
  low: { label: "Low Stock", bg: "rgba(217,131,36,0.15)", color: "#a3600e", Icon: IconAlertTriangle },
  insufficient: { label: "Insufficient Stock", bg: "rgba(179,38,30,0.1)", color: "#b3261e", Icon: IconX },
};

function StockComparisonTable({ details }) {
  if (!details || details.length === 0) {
    return (
      <p style={{ color: C.mauve500, fontSize: 13 }}>
        No size breakdown was recorded for this order.
      </p>
    );
  }

  return (
    <div className="order-table-wrap">
      <table className="order-table">
        <thead>
          <tr>
            <th>Size</th>
            <th>Requested</th>
            <th>Available</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {details.map((row) => {
            const status = statusFor(row.requested, row.available);
            const meta = BADGE_META[status];
            const StatusIcon = meta.Icon;
            return (
              <tr key={row.size}>
                <td className="fw-bold">{row.size}</td>
                <td>{row.requested}</td>
                <td>{row.available}</td>
                <td>
                  <span
                    className="d-flex align-items-center gap-1 fw-bold"
                    style={{ background: meta.bg, color: meta.color, padding: "4px 10px", borderRadius: 20, fontSize: 11.5, width: "fit-content" }}
                  >
                    <StatusIcon size={12} stroke={3} /> {meta.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StockComparisonTable;
