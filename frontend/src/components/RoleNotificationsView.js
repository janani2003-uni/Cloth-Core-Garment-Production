// src/components/RoleNotificationsView.js
// Notifications inbox for Supervisor (and reused by Admin's own
// notifications page) — uses the existing per-user notification endpoints
// (/mine, /unread-count, mark-read, etc.).
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, ExclamationTriangle, CartPlus, CreditCard, ChatDots, Truck } from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/notifications";

const TYPE_ICON = {
  production: CartPlus,
  order: CartPlus,
  payment: CreditCard,
  ticket: ChatDots,
  inventory: ExclamationTriangle,
  system: CheckCircle,
  user: Bell,
  staff: Truck,
};

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function RoleNotificationsView({ heading, subtitle, dashboardPath, feedPath = "/mine" }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_URL}${feedPath}`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
      setError(err.response?.data?.message || "Could not load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [feedPath]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const markAsRead = async (notification) => {
    if (notification.isRead) {
      if (notification.relatedModel === "Production" || notification.relatedModel === "Order") {
        navigate(dashboardPath);
      }
      return;
    }
    setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)));
    try {
      await axios.put(`${API_URL}/${notification._id}/read`);
    } catch (err) {
      console.error("Mark Read Error:", err);
      fetchNotifications();
    }
    if (notification.relatedModel === "Production" || notification.relatedModel === "Order") {
      navigate(dashboardPath);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await axios.put(`${API_URL}/read-all`);
    } catch (err) {
      console.error("Mark All Read Error:", err);
      fetchNotifications();
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "4px" }}>{heading}</h2>
          <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>{subtitle}</p>
        </div>
        <button className="admin-btn-secondary" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </button>
      </div>

      <div className="admin-content-card">
        <div style={{ padding: "16px 20px 0", display: "flex", gap: "8px" }}>
          {["all", "unread"].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="admin-btn-secondary"
              style={{
                padding: "6px 16px",
                fontSize: "13px",
                background: filter === key ? "var(--clothcore-mauve)" : "rgba(255,255,255,0.055)",
                color: filter === key ? "#fff" : "var(--clothcore-text)",
                border: filter === key ? "1px solid var(--clothcore-mauve)" : "1px solid var(--clothcore-border-strong)",
              }}
            >
              {key === "all" ? "All" : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} /></div>
          ) : error ? (
            <div className="text-center py-5">
              <div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div>
              <button className="admin-btn-secondary" onClick={fetchNotifications}>Retry</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="admin-empty-state">
              <Bell size={36} className="admin-empty-state-icon" />
              <div className="admin-empty-state-title">{filter === "unread" ? "No unread notifications" : "No notifications yet"}</div>
              <div className="admin-empty-state-message">Updates about orders, production and deliveries will appear here.</div>
            </div>
          ) : (
            visible.map((n) => {
              const Icon = TYPE_ICON[n.type] || Bell;
              return (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n)}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "14px 8px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    background: n.isRead ? "transparent" : "rgba(133,79,108,0.08)",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(133,79,108,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} style={{ color: "var(--clothcore-blush)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                      <span style={{ fontSize: "13px", fontWeight: n.isRead ? 500 : 700, color: "var(--clothcore-text)" }}>{n.title}</span>
                      {!n.isRead && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--clothcore-blush)", flexShrink: 0, marginTop: "4px" }} />}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--clothcore-text-soft)", marginTop: "2px" }}>{n.message}</div>
                    <div style={{ fontSize: "11px", color: "var(--clothcore-text-muted)", marginTop: "4px" }}>{formatRelativeTime(n.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default RoleNotificationsView;
