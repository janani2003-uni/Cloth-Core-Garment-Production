// src/components/AdminLayout.js
// Shared shell for every Admin page — replaces the identical
// Adminsidebar + Admintopbar + padding boilerplate that used to be
// copy-pasted at the top of all 14 Admin/*.js files.
import React from "react";
import Adminsidebar from "./Adminsidebar";
import Admintopbar from "./Admintopbar";

function AdminLayout({ children, contentClassName = "", shellStyle }) {
  return (
    <div className="d-flex admin-shell" style={shellStyle}>
      <Adminsidebar />

      {/* min-width: 0 overrides the flex item's default min-width: auto —
          without it, a wide child (e.g. Inventory's custom flex layout or
          any un-wrapped table) forces this whole pane wider than the
          viewport instead of scrolling within its own bounds. */}
      <div
        className={`flex-grow-1${contentClassName ? ` ${contentClassName}` : ""}`}
        style={{ minWidth: 0 }}
      >
        <Admintopbar />

        <div style={{ padding: "24px" }}>
          {/* Admin tables tend to be wider than Shop Owner content
              (more columns), so this gets a bit more breathing room than
              ShopOwnerLayout's/RoleLayout's 1280px — still centered instead
              of stretching to the viewport edge on wide monitors. */}
          <div className="container-fluid px-0" style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
