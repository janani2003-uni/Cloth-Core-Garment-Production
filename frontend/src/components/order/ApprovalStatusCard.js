// src/components/order/ApprovalStatusCard.js
// Shop-owner-facing status summary shown on the Admin Approval step.
import React from "react";
import { IconClock, IconCheck, IconX } from "@tabler/icons-react";
import { ORDER_COLORS as C } from "../../utils/orderTheme";

const STATUS_META = {
  Pending: {
    icon: IconClock,
    color: "#a3600e",
    bg: "rgba(217,131,36,0.12)",
    message: "Your order has been submitted and is waiting for approval.",
  },
  Approved: {
    icon: IconCheck,
    color: "#1f7a44",
    bg: "rgba(31,122,68,0.12)",
    message: "Your order has been approved. You may now continue to payment.",
  },
  Rejected: {
    icon: IconX,
    color: "#b3261e",
    bg: "rgba(179,38,30,0.1)",
    message: "Your order requires changes before it can continue.",
  },
};

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.08)" }}>
      <span style={{ color: C.mauve500, fontSize: 13 }}>{label}</span>
      <span className="fw-bold" style={{ color: C.plum900, fontSize: 13.5, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function ApprovalStatusCard({ order }) {
  const status = order?.approval?.status || "Pending";
  const meta = STATUS_META[status] || STATUS_META.Pending;
  const Icon = meta.icon;

  return (
    <div
      className="card border-0"
      style={{ borderRadius: 20, boxShadow: "0 10px 40px rgba(25,0,25,0.08)", background: "#fff" }}
    >
      <div className="card-body p-4">
        <div
          className="d-flex align-items-center gap-3 mb-4 p-3"
          style={{ background: meta.bg, borderRadius: 14 }}
        >
          <span
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", color: meta.color }}
          >
            <Icon size={20} stroke={2.5} />
          </span>
          <div>
            <div className="fw-bold" style={{ color: meta.color, fontSize: 14.5 }}>{status}</div>
            <div style={{ color: C.plum800, fontSize: 13 }}>{meta.message}</div>
          </div>
        </div>

        {status === "Rejected" && order?.approval?.rejectionReason && (
          <div
            className="mb-4 p-3"
            style={{ background: "rgba(179,38,30,0.06)", border: "1px solid rgba(179,38,30,0.2)", borderRadius: 12 }}
          >
            <div className="fw-bold mb-1" style={{ color: "#b3261e", fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Reason
            </div>
            <div style={{ color: C.plum900, fontSize: 13.5 }}>{order.approval.rejectionReason}</div>
          </div>
        )}

        <div className="mb-2">
          <small className="fw-bold d-block mb-2" style={{ color: C.mauve500, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
            Order Details
          </small>
          <Row label="Order Number" value={order?.orderId || "—"} />
          <Row label="Garment" value={order?.garmentType || "—"} />
          <Row label="Total Quantity" value={`${order?.quantity ?? 0} pcs`} />
          <Row label="Delivery Date" value={order?.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not set"} />
          <Row label="Estimated Total" value={`Rs. ${Number(order?.totalAmount || 0).toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}

export default ApprovalStatusCard;
