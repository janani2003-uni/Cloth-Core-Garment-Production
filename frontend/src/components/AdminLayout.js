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

      <div className={`flex-grow-1${contentClassName ? ` ${contentClassName}` : ""}`}>
        <div style={{ padding: "16px 24px 0" }}>
          <Admintopbar />
        </div>

        <div style={{ padding: "24px" }}>
          <div className="container-fluid px-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
