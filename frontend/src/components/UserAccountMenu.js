// src/components/UserAccountMenu.js
// Shared top-right account dropdown used across Admin, Shop Owner and
// Supervisor pages. Renders the Admin-only "View As" switcher directly in
// JSX only when the current user's role is actually "admin" — never
// CSS-hidden — so a non-Admin user's dropdown never contains that markup
// at all. The current view is derived from location.pathname, the single
// source of truth, rather than threaded through as a prop.
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Person,
  Gear,
  BoxArrowRight,
  Shield,
  House,
} from "react-bootstrap-icons";
import { getUser, clearSession } from "../utils/auth";
import { formatRoleLabel } from "../utils/roles";
import LogoutConfirmModal from "./modals/LogoutConfirmModal";

const DASHBOARD_VIEWS = [
  { key: "admin", label: "Admin Dashboard", path: "/admin-dashboard", icon: Shield },
  { key: "shop-owner", label: "Shop Owner View", path: "/dashboard", icon: House },
  { key: "supervisor", label: "Supervisor View", path: "/supervisor-dashboard", icon: Gear },
];

const ADMIN_MANAGEMENT_PATHS = ["/users", "/staff", "/production", "/inventory"];

function detectViewFromPath(pathname) {
  if (pathname.startsWith("/supervisor-dashboard")) return "supervisor";
  if (pathname.startsWith("/admin") || ADMIN_MANAGEMENT_PATHS.includes(pathname)) return "admin";
  return "shop-owner";
}

const VIEW_LABELS = {
  admin: "Administrator",
  "shop-owner": "Shop Owner View",
  supervisor: "Supervisor View",
};

function UserAccountMenu({ user: userProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const ref = useRef(null);

  const user = userProp || getUser();
  const isAdmin = user?.role === "admin";
  const view = detectViewFromPath(location.pathname);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials =
    firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "U";
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : "Account";

  // Admin sees their real role plus whichever dashboard they're currently
  // previewing; every other role just shows their own role — their database
  // role never changes just because of what they're viewing (it can't, they
  // can only ever view their own dashboard).
  const roleLabel = isAdmin
    ? (view === "admin" ? "Administrator" : `Admin · ${VIEW_LABELS[view]}`)
    : formatRoleLabel(user?.role || "shopOwner");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const goTo = (path, state) => {
    setOpen(false);
    navigate(path, state ? { state } : undefined);
  };

  const handleLogout = () => {
    setOpen(false);
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 6px",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--sidebar-accent), var(--sidebar-accent-strong))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        {/* Uses --sidebar-* tokens, not var(--clothcore-text*) — this button
            sits on the dark topbar chrome, not the light content surface. */}
        <div className="d-none d-md-block text-start">
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--sidebar-text)" }}>{displayName}</div>
          <div style={{ fontSize: "11px", color: "var(--sidebar-text-soft)" }}>{roleLabel}</div>
        </div>
        <ChevronDown size={14} style={{ color: "var(--sidebar-text-soft)" }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            width: "230px",
            background: "var(--clothcore-card)",
            borderRadius: "14px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
            border: "1px solid var(--clothcore-border-strong)",
            overflow: "hidden",
            zIndex: 999,
            padding: "6px",
          }}
        >
          {isAdmin && (
            <>
              <div
                style={{
                  padding: "6px 12px 4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--clothcore-text-soft)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                View As
              </div>

              {DASHBOARD_VIEWS.map((dashboardView) => {
                const Icon = dashboardView.icon;
                const active = view === dashboardView.key;

                return (
                  <button
                    key={dashboardView.key}
                    role="menuitem"
                    type="button"
                    className="dropdown-item d-flex align-items-center gap-2"
                    style={{
                      ...menuItemStyle,
                      background: active ? "rgba(133,79,108,0.16)" : "transparent",
                      fontWeight: active ? 600 : 400,
                    }}
                    onClick={() => goTo(dashboardView.path)}
                  >
                    <Icon size={15} color={active ? "var(--clothcore-mauve)" : "var(--clothcore-text-soft)"} />
                    {dashboardView.label}
                    {active && (
                      <span style={{ marginLeft: "auto", color: "var(--clothcore-mauve)", fontWeight: 700 }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}

              <hr className="my-1" style={{ opacity: 0.5 }} />
            </>
          )}

          <button
            role="menuitem"
            type="button"
            className="dropdown-item d-flex align-items-center gap-2"
            style={menuItemStyle}
            onClick={() => goTo("/settings", { activeTab: "profile" })}
          >
            <Person size={15} color="var(--clothcore-text-soft)" /> My Profile
          </button>

          <button
            role="menuitem"
            type="button"
            className="dropdown-item d-flex align-items-center gap-2"
            style={menuItemStyle}
            onClick={() => goTo("/settings")}
          >
            <Gear size={15} color="var(--clothcore-text-soft)" /> Settings
          </button>

          <hr className="my-1" style={{ opacity: 0.5 }} />

          <button
            role="menuitem"
            type="button"
            className="dropdown-item d-flex align-items-center gap-2"
            style={{ ...menuItemStyle, color: "var(--clothcore-danger)" }}
            onClick={handleLogout}
          >
            <BoxArrowRight size={15} color="var(--clothcore-danger)" /> Logout
          </button>
        </div>
      )}

      <LogoutConfirmModal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

const menuItemStyle = {
  width: "100%",
  textAlign: "left",
  border: "none",
  background: "transparent",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "13px",
  cursor: "pointer",
  color: "var(--clothcore-text)",
};

export default UserAccountMenu;
