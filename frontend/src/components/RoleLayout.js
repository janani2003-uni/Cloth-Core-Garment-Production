// src/components/RoleLayout.js
// Shared shell for the Supervisor dashboard — mirrors AdminLayout's
// structure/classes so these pages look consistent with the rest of the
// app, using RoleSidebar (parametrized nav) instead of a dedicated
// sidebar component.
import React from "react";
import RoleSidebar from "./RoleSidebar";
import Admintopbar from "./Admintopbar";
import { getUser } from "../utils/auth";

function RoleLayout({ sidebarItems, roleLabel, children }) {
  // An Admin previewing the Supervisor dashboard via "View As" still has
  // their own account (role never changes) — this is just a subtle reminder
  // of which interface they're currently looking at.
  const isAdminPreview = getUser()?.role === "admin";

  return (
    <div className="d-flex admin-shell">
      <RoleSidebar items={sidebarItems} roleLabel={roleLabel} />

      <div className="flex-grow-1">
        <div style={{ padding: "16px 24px 0" }}>
          <Admintopbar />
        </div>

        {isAdminPreview && (
          <div
            style={{
              padding: "8px 24px",
              background: "rgba(217,131,36,0.08)",
              borderBottom: "1px solid rgba(217,131,36,0.18)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--clothcore-warning, #d98324)",
            }}
          >
            Admin Preview — Viewing as {roleLabel}
          </div>
        )}

        <div style={{ padding: "24px" }}>
          <div className="container-fluid px-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleLayout;
