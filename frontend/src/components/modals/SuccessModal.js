// src/components/modals/SuccessModal.js
// One flexible success modal reused for Registration Successful and the
// "Get In Touch" inquiry-sent confirmation — a single check-icon layout
// with a configurable title/message/primary action rather than two
// separate popups.
import React from "react";
import { CheckCircleFill, X } from "react-bootstrap-icons";
import AppModal from "./AppModal";

const C = {
  plum900: "#190019",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  pink200: "#DFB6B2",
  cream100: "#FBE4D8",
  success: "#1f7a44",
};

function SuccessModal({ open, onClose, title, message, primaryLabel = "Done", onPrimary }) {
  const handlePrimary = () => {
    if (onPrimary) onPrimary();
    else onClose?.();
  };

  return (
    <AppModal open={open} onClose={onClose} labelledBy="success-modal-title" maxWidth={400}>
      <div style={{ padding: "30px 26px 26px", textAlign: "center", position: "relative" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            background: "rgba(82,43,91,0.08)",
            color: C.mauve500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.cream100}, #ffffff)`,
            border: "1.5px solid rgba(31,122,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            color: C.success,
            boxShadow: "0 6px 18px rgba(31,122,68,0.18)",
          }}
        >
          <CheckCircleFill size={30} />
        </div>

        <h2 id="success-modal-title" style={{ fontSize: 20, fontWeight: 700, color: C.plum900, marginBottom: 10 }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: C.mauve500, marginBottom: 24, lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {message}
        </p>

        <button
          type="button"
          onClick={handlePrimary}
          autoFocus
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "none",
            background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14.5,
            boxShadow: "0 8px 20px rgba(25,0,25,0.25)",
          }}
        >
          {primaryLabel}
        </button>
      </div>
    </AppModal>
  );
}

export default SuccessModal;
