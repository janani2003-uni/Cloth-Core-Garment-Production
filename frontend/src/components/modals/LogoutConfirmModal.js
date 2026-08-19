// src/components/modals/LogoutConfirmModal.js
// One shared logout-confirmation modal used by every interface (Admin,
// Shop Owner, Supervisor, and the topbar account menu) instead of each
// sidebar rolling its own window.confirm(). Behavior is unchanged from
// before — Cancel leaves the session untouched, Sign Out runs whatever
// logout logic the caller passes in (clearSession + navigate), so this
// component never touches auth itself.
import React from "react";
import { BoxArrowRight, X } from "react-bootstrap-icons";
import AppModal from "./AppModal";

const C = {
  plum900: "#190019",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  pink200: "#DFB6B2",
  cream100: "#FBE4D8",
};

function LogoutConfirmModal({ open, onCancel, onConfirm }) {
  return (
    <AppModal open={open} onClose={onCancel} labelledBy="logout-modal-title" maxWidth={380}>
      <div style={{ padding: "28px 26px 24px", textAlign: "center", position: "relative" }}>
        <button
          type="button"
          onClick={onCancel}
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
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: C.cream100,
            border: `1.5px solid ${C.pink200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: C.plum700,
          }}
        >
          <BoxArrowRight size={24} />
        </div>

        <h2 id="logout-modal-title" style={{ fontSize: 19, fontWeight: 700, color: C.plum900, marginBottom: 8 }}>
          Sign Out?
        </h2>
        <p style={{ fontSize: 14, color: C.mauve500, marginBottom: 22, lineHeight: 1.5 }}>
          Are you sure you want to sign out of ClothCore?
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            className="app-modal-btn-secondary"
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 12,
              border: `1.5px solid ${C.mauve500}`,
              background: "transparent",
              color: C.plum700,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="app-modal-btn-primary"
            style={{
              flex: 1,
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
            Sign Out
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default LogoutConfirmModal;
