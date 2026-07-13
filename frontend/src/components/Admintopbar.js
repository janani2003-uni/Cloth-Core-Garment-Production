// src/components/Admintopbar.js
import React from "react";
import { Bell, Search } from "react-bootstrap-icons";

function Admintopbar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        padding: "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      {/* LEFT - TITLE */}
      <div>
        <h4 style={{ margin: 0, fontWeight: "bold", color: "#0b3aa0" }}>
          Dashboard
        </h4>
        <small style={{ color: "gray" }}>
          Welcome back, Admin! Here's what's happening.
        </small>
      </div>

      {/* RIGHT - SEARCH + ICONS */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        
        {/* SEARCH BOX */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f5f7fb",
            padding: "8px 12px",
            borderRadius: "8px",
            gap: "8px",
          }}
        >
          <Search />
          <input
            type="text"
            placeholder="Search anything..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          />
        </div>

        {/* NOTIFICATION ICON */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={20} />
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "red",
              color: "white",
              fontSize: "10px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            5
          </span>
        </div>

        {/* USER */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              background: "#0b3aa0",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            A
          </div>
          <span style={{ fontWeight: "bold" }}>Admin User</span>
        </div>
      </div>
    </div>
  );
}

export default Admintopbar; // Fixed: export as Admintopbar