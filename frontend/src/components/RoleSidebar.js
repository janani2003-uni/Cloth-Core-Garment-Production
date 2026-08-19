// src/components/RoleSidebar.js
// Lightweight sidebar for the Supervisor role — avoids duplicating a
// near-identical sidebar file. Adminsidebar/Sidebar stay as-is since their
// nav lists are already established and larger.
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BoxArrowRight } from "react-bootstrap-icons";
import logo from "../assets/logo-new.png.jpeg";
import { clearSession } from "../utils/auth";
import LogoutConfirmModal from "./modals/LogoutConfirmModal";

function RoleSidebar({ items, roleLabel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    clearSession();
    navigate("/login");
  };

  return (
    <div className="admin-sidebar">
      {/* Logo Section — sized up and given a soft accent-colored halo so it
          reads as part of the sidebar instead of a small sticker pasted on
          top of the dark purple background. The logo asset itself (a JPEG
          with a baked-in white background) is untouched. */}
      <div className="text-center mb-4 px-3">
        <div
          className="cc-sidebar-logo"
          style={{
            width: "92px",
            height: "92px",
            margin: "0 auto 12px",
            borderRadius: "26px",
            background: "linear-gradient(160deg, #ffffff, #f6ecf1)",
            border: "1px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={logo}
            alt="ClothCore"
            style={{ width: "66px", height: "66px", objectFit: "contain" }}
          />
        </div>
        <h5 className="fw-bold mb-0" style={{ color: "var(--sidebar-text)", fontSize: "18px" }}>
          ClothCore
        </h5>
        <small style={{ color: "var(--sidebar-text-soft)", fontSize: "11px" }}>
          {roleLabel}
        </small>
      </div>

      <div className="flex-grow-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`admin-sidebar-link${isActive ? " is-active" : ""}`}
            >
              <Icon size={20} style={{ marginRight: "12px" }} />
              <span style={{ fontSize: "14px" }}>{item.label}</span>
              {isActive && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--sidebar-accent)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 mt-auto">
        <div
          onClick={handleLogout}
          className="cc-logout-row"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 15px",
            borderRadius: "12px",
            cursor: "pointer",
            background: "var(--sidebar-danger-bg)",
            border: "1px solid var(--sidebar-danger-border)",
          }}
        >
          <BoxArrowRight size={20} style={{ marginRight: "12px", color: "var(--sidebar-danger-text)" }} />
          <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--sidebar-danger-text)" }}>Logout</span>
        </div>
      </div>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

export default RoleSidebar;
