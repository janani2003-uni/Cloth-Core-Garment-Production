// src/components/RoleSidebar.js
// Lightweight sidebar for the Supervisor role — avoids duplicating a
// near-identical sidebar file. Adminsidebar/Sidebar stay as-is since their
// nav lists are already established and larger.
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BoxArrowRight } from "react-bootstrap-icons";
import logo from "../assets/logo-new.png.jpeg";
import { clearSession } from "../utils/auth";

function RoleSidebar({ items, roleLabel }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      clearSession();
      navigate("/login");
    }
  };

  return (
    <div className="admin-sidebar">
      <div className="text-center mb-4 px-3">
        <div
          style={{
            width: "68px",
            height: "68px",
            margin: "0 auto 10px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.28)",
            overflow: "hidden",
          }}
        >
          <img
            src={logo}
            alt="ClothCore"
            style={{ width: "48px", height: "48px", objectFit: "contain" }}
          />
        </div>
        <h5 className="fw-bold mb-0" style={{ color: "white", fontSize: "18px" }}>
          ClothCore
        </h5>
        <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>
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
                    background: "var(--clothcore-blush)",
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
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 15px",
            borderRadius: "12px",
            cursor: "pointer",
            background: "rgba(220, 53, 69, 0.15)",
            transition: "all 0.3s ease",
            border: "1px solid rgba(220, 53, 69, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220, 53, 69, 0.25)";
            e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(220, 53, 69, 0.15)";
            e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.2)";
          }}
        >
          <BoxArrowRight size={20} style={{ marginRight: "12px", color: "#ff6b6b" }} />
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#ff6b6b" }}>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default RoleSidebar;
