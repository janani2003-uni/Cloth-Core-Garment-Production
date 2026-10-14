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
  contentClassName = "p-3 p-md-4",
  contentStyle = { maxWidth: "1280px", margin: "0 auto" },
  shellStyle,
  topbarTitle,
  // Opt-in: pins the page to exactly one viewport height with no page-level
  // scrollbar — the caller is then responsible for giving any content that
  // can overflow (a list, a table, etc.) its own `overflow-y: auto` region.
  // Off by default so every other page keeps its normal scrolling page.
  fitScreen = false,
}) {
  // An Admin browsing shop-owner pages via "View As" still has their own
  // account (role never changes) — this is just a subtle reminder of which
  // interface they're currently looking at.
  const isAdminPreview = getUser()?.role === "admin";

  return (
    <div className="d-flex admin-shell" style={shellStyle}>
      <Sidebar />

      <div
        className="flex-grow-1"
        style={fitScreen ? { height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" } : undefined}
      >
        <ShopTopbar title={topbarTitle} />

        {isAdminPreview && (
          <div className="admin-preview-banner">
            Admin Preview — Viewing as Shop Owner
          </div>
        )}

        <div
          className={contentClassName}
          style={fitScreen ? { ...contentStyle, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : contentStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default ShopOwnerLayout;
