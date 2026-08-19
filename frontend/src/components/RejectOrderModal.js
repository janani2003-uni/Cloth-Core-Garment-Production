// src/components/RejectOrderModal.js
// Shared reject-confirmation modal used by both the Admin and Supervisor
// approval queues — requires a non-empty reason before it will confirm.
import React, { useState } from "react";
import { IconX, IconAlertTriangle } from "@tabler/icons-react";

const C = {
  plum900: "#190019",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  cream100: "#FBE4D8",
};

function RejectOrderModal({ order, onCancel, onConfirm, submitting, title }) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length > 0;

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm(trimmedReason);
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(25,0,25,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1050,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 30px 80px rgba(25,0,25,0.35)",
          overflow: "hidden",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`, color: "#fff", padding: 18 }}
        >
          <div id="reject-modal-title" className="fw-bold d-flex align-items-center gap-2">
            <IconAlertTriangle size={18} stroke={2} /> {title || `Reject Order ${order?.orderId || ""}`}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{ background: "rgba(255,255,255,0.14)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <IconX size={16} stroke={2} />
          </button>
        </div>

        <div className="p-4">
          <label htmlFor="rejectReason" className="form-label fw-semibold" style={{ color: C.plum700, fontSize: 13 }}>
            Rejection reason <span style={{ color: "#b3261e" }}>*</span>
          </label>
          <textarea
            id="rejectReason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Explain what needs to change (e.g. insufficient stock for size L, incorrect delivery address)..."
            style={{
              width: "100%",
              borderRadius: 12,
              padding: "10px 14px",
              border: `1.5px solid ${touched && !isValid ? "#b3261e" : "rgba(82,43,91,0.2)"}`,
              color: C.plum900,
              fontSize: 13.5,
              resize: "none",
            }}
            aria-invalid={touched && !isValid}
            aria-describedby="rejectReasonError"
          />
          {touched && !isValid && (
            <div id="rejectReasonError" role="alert" style={{ color: "#b3261e", fontSize: 12, fontWeight: 600, marginTop: 6 }}>
              A rejection reason is required.
            </div>
          )}

          <div className="d-flex gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn flex-fill"
              style={{ border: `1.5px solid ${C.mauve500}`, color: C.plum700, borderRadius: 12, fontWeight: 600, padding: "11px" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="btn flex-fill"
              style={{
                background: "linear-gradient(135deg, #8a2e28, #b3261e)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 700,
                padding: "11px",
              }}
            >
              {submitting ? "Rejecting…" : "Confirm Rejection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RejectOrderModal;
