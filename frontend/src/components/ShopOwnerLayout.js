// src/components/ShopOwnerLayout.js
// Shared shell for Shop Owner pages — replaces the identical
// Sidebar + ShopTopbar + wrapper boilerplate that used to be
// copy-pasted at the top of every shop-owner page.
import React from "react";
import Sidebar from "./Sidebar";
import ShopTopbar from "./ShopTopbar";
import { getUser } from "../utils/auth";

function ShopOwnerLayout({
  children,
  contentClassName = "container-fluid px-0",
  contentStyle = { padding: "20px" },
  shellStyle,
  topbarTitle,
}) {
  // An Admin browsing shop-owner pages via "View As" still has their own
  // account (role never changes) — this is just a subtle reminder of which
  // interface they're currently looking at.
  const isAdminPreview = getUser()?.role === "admin";

  return (
    <div className="d-flex admin-shell" style={{ background: "linear-gradient(145deg, var(--clothcore-app-bg) 0%, var(--clothcore-bg-secondary) 50%, var(--clothcore-surface) 100%)", ...shellStyle }}>
      <Sidebar />

      <div className="flex-grow-1">
        <ShopTopbar title={topbarTitle} />

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
            Admin Preview — Viewing as Shop Owner
          </div>
        )}

        <div className={contentClassName} style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default ShopOwnerLayout;
