// src/components/modals/AlertModal.js
// Styled replacement for window.alert() — same overlay/card shell as
// LogoutConfirmModal/SuccessModal (via AppModal) instead of the browser's
// native "localhost:3001 says" popup, which doesn't match the rest of the
// app's look.
import React from "react";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import AppModal from "./AppModal";

const C = {
  plum900: "#190019",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  amber200: "#F3D9A4",
  amber50: "#FFF6E8",
  warning: "#B5750B",
};

function AlertModal({ open, onClose, title = "Please check the form", message }) {
  return (
    <AppModal open={open} onClose={onClose} labelledBy="alert-modal-title" maxWidth={400}>
      <div style={{ padding: "30px 26px 26px", textAlign: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: C.amber50,
            border: `1.5px solid ${C.amber200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: C.warning,
          }}
        >
          <ExclamationTriangleFill size={24} />
        </div>

        <h2 id="alert-modal-title" style={{ fontSize: 19, fontWeight: 700, color: C.plum900, marginBottom: 8 }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: C.mauve500, marginBottom: 22, lineHeight: 1.5, whiteSpace: "pre-line" }}>
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          autoFocus
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: 12,
            border: "none",
            background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 8px 20px rgba(25,0,25,0.25)",
          }}
        >
          OK
        </button>
      </div>
    </AppModal>
  );
}

export default AlertModal;
