import React from "react";
import { useNavigate } from "react-router-dom";
import { HouseDoor } from "react-bootstrap-icons";
import logo from "../assets/logo-new.png.jpeg";
import { getUser } from "../utils/auth";

function NotFound() {
  const navigate = useNavigate();
  const user = getUser();

  const homePath = user ? (user.role === "admin" ? "/admin-dashboard" : "/dashboard") : "/";

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "var(--clothcore-bg, #f8f5f2)" }}
    >
      <div className="text-center px-3">
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            borderRadius: "22px",
            background: "rgba(255,255,255,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
          }}
        >
          <img src={logo} alt="ClothCore" width="56" height="56" style={{ objectFit: "contain" }} />
        </div>
        <h1 className="fw-bold" style={{ fontSize: "72px", color: "var(--clothcore-purple, #522b5b)" }}>404</h1>
        <h4 className="fw-bold mb-2" style={{ color: "var(--clothcore-text, #221033)" }}>Page not found</h4>
        <p className="text-muted mb-4">The page you're looking for doesn't exist or may have been moved.</p>
        <button
          className="btn fw-bold px-4 py-2"
          style={{
            background: "linear-gradient(135deg, var(--clothcore-purple, #522b5b), var(--clothcore-mauve, #854f6c))",
            color: "white",
            borderRadius: "12px",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
          onClick={() => navigate(homePath)}
        >
          <HouseDoor size={18} /> Back to {user ? "Dashboard" : "Home"}
        </button>
      </div>
    </div>
  );
}

export default NotFound;
