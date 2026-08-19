// src/components/modals/ConfirmModal.js
// One flexible confirmation modal — reused wherever an Admin/Supervisor
// action needs a real confirmation step instead of window.confirm() (Cancel
// Order, Delete Material, etc.). Danger actions (delete/cancel) use a red
// confirm button; anything else uses the standard ClothCore purple.
import React from "react";
import { ExclamationTriangle, X } from "react-bootstrap-icons";
import AppModal from "./AppModal";

const C = {
  plum900: "#190019",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  pink200: "#DFB6B2",
  cream100: "#FBE4D8",
  danger: "#b3261e",
};

function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  submitting = false,
}) {
  return (
    <AppModal open={open} onClose={onCancel} labelledBy="confirm-modal-title" maxWidth={400}>
      <div style={{ padding: "28px 26px 24px", textAlign: "center", position: "relative" }}>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%",
            border: "none", background: "rgba(82,43,91,0.08)", color: C.mauve500,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>

        <div
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: danger ? "rgba(179,38,30,0.1)" : C.cream100,
            border: `1.5px solid ${danger ? "rgba(179,38,30,0.3)" : C.pink200}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", color: danger ? C.danger : C.plum700,
          }}
        >
          <ExclamationTriangle size={24} />
        </div>

        <h2 id="confirm-modal-title" style={{ fontSize: 19, fontWeight: 700, color: C.plum900, marginBottom: 8 }}>
          {title}
        </h2>
        {message && (
          <p style={{ fontSize: 14, color: C.mauve500, marginBottom: 22, lineHeight: 1.5 }}>{message}</p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              flex: 1, padding: "11px", borderRadius: 12, border: `1.5px solid ${C.mauve500}`,
              background: "transparent", color: C.plum700, fontWeight: 600, fontSize: 14,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            autoFocus
            style={{
              flex: 1, padding: "11px", borderRadius: 12, border: "none",
              background: danger
                ? "linear-gradient(135deg, #8a2e28, #b3261e)"
                : `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`,
              color: "#fff", fontWeight: 700, fontSize: 14,
              boxShadow: "0 8px 20px rgba(25,0,25,0.2)",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default ConfirmModal;
