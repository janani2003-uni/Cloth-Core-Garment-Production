// src/components/NotificationBell.js
// Shared real-data notification bell for Shop Owner-facing pages
// (Dashboard, Orders, etc.) — mirrors Admintopbar's notification behavior
// but reads the current user's own notifications instead of the Admin
// broadcast feed.
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Bell, CheckCircle, ExclamationTriangle, CreditCard, PersonPlus, Truck, ChatDots } from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/notifications";

function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function getIcon(type) {
  switch (type) {
    case "payment":
      return <CreditCard size={16} />;
    case "inventory":
      return <ExclamationTriangle size={16} />;
    case "order":
    case "production":
      return <Truck size={16} />;
    case "ticket":
      return <ChatDots size={16} />;
    case "user":
      return <PersonPlus size={16} />;
    default:
      return <CheckCircle size={16} />;
  }
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/mine`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await axios.put(`${API_URL}/${id}/read`);
    } catch (err) {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await axios.put(`${API_URL}/read-all`);
    } catch (err) {
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    setOpen(false);
    try {
      await axios.delete(API_URL);
    } catch (err) {
      fetchNotifications();
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: open ? "rgba(82,43,91,0.15)" : "rgba(82,43,91,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <Bell size={20} style={{ color: "var(--clothcore-blush)" }} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{
              background: "linear-gradient(135deg, var(--clothcore-danger), #b83d4d)",
              fontSize: "10px",
              padding: "3px 7px",
              border: "2px solid white",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            width: "340px",
            maxWidth: "90vw",
            background: "var(--clothcore-card)",
            borderRadius: "14px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
            border: "1px solid var(--clothcore-border-strong)",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--clothcore-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--clothcore-text)" }}>Notifications</div>
            <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
              {unreadCount} unread
            </div>
          </div>

          <div style={{ maxHeight: "340px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--clothcore-text-soft)" }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
                <div style={{ fontSize: "13px" }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => markAsRead(n._id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 16px",
                    display: "flex",
                    gap: "10px",
                    border: "none",
                    borderBottom: "1px solid var(--clothcore-border)",
                    background: n.isRead ? "transparent" : "rgba(133,79,108,0.1)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "rgba(133,79,108,0.2)",
                      color: "var(--clothcore-blush)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: n.isRead ? 500 : 700, color: "var(--clothcore-text)" }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginTop: "2px" }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)", marginTop: "4px" }}>
                      {formatRelativeTime(n.createdAt)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div
              style={{
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid var(--clothcore-border)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                style={{ background: "transparent", border: "none", fontSize: "12px", fontWeight: 600, color: unreadCount === 0 ? "var(--clothcore-text-muted)" : "var(--clothcore-blush)", cursor: unreadCount === 0 ? "not-allowed" : "pointer" }}
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={clearAll}
                style={{ background: "transparent", border: "none", fontSize: "12px", fontWeight: 600, color: "var(--clothcore-danger)", cursor: "pointer" }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
