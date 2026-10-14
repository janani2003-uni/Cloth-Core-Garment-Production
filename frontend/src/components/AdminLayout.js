// src/components/AdminLayout.js
// Shared shell for every Admin page — replaces the identical
// Adminsidebar + Admintopbar + padding boilerplate that used to be
// copy-pasted at the top of all 14 Admin/*.js files.
import React from "react";
import Adminsidebar from "./Adminsidebar";
import Admintopbar from "./Admintopbar";

function AdminLayout({
  children,
  contentClassName = "",
  shellStyle,
  // Opt-in: pins the page to exactly one viewport height with no
  // page-level scrollbar — the caller is responsible for giving any
  // content that can overflow (a list, a table, etc.) its own
  // `overflow-y: auto` region. Off by default so every other Admin page
  // keeps its normal scrolling behavior. Mirrors ShopOwnerLayout's
  // fitScreen prop.
  fitScreen = false,
}) {
  return (
    <div className="d-flex admin-shell" style={shellStyle}>
      <Adminsidebar />

      {/* min-width: 0 overrides the flex item's default min-width: auto —
          without it, a wide child (e.g. Inventory's custom flex layout or
          any un-wrapped table) forces this whole pane wider than the
          viewport instead of scrolling within its own bounds. */}
      <div
        className={`flex-grow-1${contentClassName ? ` ${contentClassName}` : ""}`}
        style={{
          minWidth: 0,
          ...(fitScreen ? { height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" } : {}),
        }}
      >
        <Admintopbar />

        <div style={{ padding: "24px", ...(fitScreen ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}) }}>
          {/* Admin tables tend to be wider than Shop Owner content
              (more columns), so this gets a bit more breathing room than
              ShopOwnerLayout's/RoleLayout's 1280px — still centered instead
              of stretching to the viewport edge on wide monitors. */}
          <div
            className="container-fluid px-0"
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
              ...(fitScreen ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}),
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
