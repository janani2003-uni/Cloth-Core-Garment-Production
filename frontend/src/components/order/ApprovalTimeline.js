// src/components/order/ApprovalTimeline.js
// Step tracker for the Admin Approval stage — shown to the shop owner so
// they can see exactly where their order is, without faking progress: each
// stage only lights up once it has genuinely happened.
import React from "react";
import { IconCheck, IconClock, IconX, IconCircle } from "@tabler/icons-react";
import { ORDER_COLORS as C } from "../../utils/orderTheme";

const STAGE_COLORS = {
  done: { bg: "#1f7a44", text: "#1f7a44" },
  pending: { bg: "#a3600e", text: "#a3600e" },
  rejected: { bg: "#b3261e", text: "#b3261e" },
  upcoming: { bg: C.mauve500, text: C.mauve500 },
};

function stageIcon(state) {
  if (state === "done") return <IconCheck size={14} stroke={3} />;
  if (state === "pending") return <IconClock size={14} stroke={2.5} />;
  if (state === "rejected") return <IconX size={14} stroke={3} />;
  return <IconCircle size={10} stroke={2.5} />;
}

// approvalStatus: "Pending" | "Approved" | "Rejected" | "Not Required"
function ApprovalTimeline({ approvalStatus }) {
  const stages = [
    { key: "submitted", label: "Order Submitted", state: "done" },
    { key: "stock", label: "Stock Check", state: approvalStatus === "Pending" ? "pending" : "done" },
    {
      key: "review",
      label: "Admin/Supervisor Review",
      state: approvalStatus === "Approved" || approvalStatus === "Rejected" ? "done" : "pending",
    },
    {
      key: "decision",
      label: "Approval Decision",
      state: approvalStatus === "Approved" ? "done" : approvalStatus === "Rejected" ? "rejected" : "upcoming",
    },
    {
      key: "payment",
      label: "Payment Unlocked",
      state: approvalStatus === "Approved" ? "done" : "upcoming",
    },
  ];

  return (
    <div role="list" aria-label="Order approval progress">
      {stages.map((stage, index) => {
        const colors = STAGE_COLORS[stage.state];
        return (
          <div
            key={stage.key}
            role="listitem"
            className="d-flex align-items-start"
            style={{ position: "relative", paddingBottom: index < stages.length - 1 ? 28 : 0 }}
          >
            {index < stages.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 13,
                  top: 28,
                  width: 2,
                  height: "calc(100% - 28px)",
                  background: stage.state === "done" ? "#1f7a44" : "rgba(82,43,91,0.15)",
                }}
              />
            )}
            <span
              aria-hidden="true"
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: stage.state === "upcoming" ? "rgba(82,43,91,0.08)" : `${colors.bg}1F`,
                color: colors.text,
                marginRight: 14,
                zIndex: 1,
              }}
            >
              {stageIcon(stage.state)}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: stage.state === "upcoming" ? 500 : 700,
                color: stage.state === "upcoming" ? C.mauve500 : C.plum900,
                marginTop: 4,
              }}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ApprovalTimeline;
