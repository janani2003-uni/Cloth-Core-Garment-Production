// src/components/NotificationBell.js
// Shared real-data notification bell for Shop Owner-facing pages
// (Dashboard, Orders, etc.) — mirrors Admintopbar's notification behavior
// but reads the current user's own notifications instead of the Admin
// broadcast feed.
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, ExclamationTriangle, CreditCard, PersonPlus, Truck, ChatDots } from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/notifications";
const ORDERS_API_URL = "http://localhost:5000/api/orders";

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
  const navigate = useNavigate();
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

  // Clicking an "Order Approved" notification takes the shop owner straight
  // to Step 7 Payment instead of just marking it read — the notification's
  // relatedId (the order's Mongo _id) is written into the order draft so
  // OrderStep5 can load the order even if the shop owner is on a different
  // device/session than the one that placed it. We re-check the order's
  // live approval status here rather than trusting the notification's own
  // wording, since it could be stale by the time it's clicked.
  const DELIVERY_NOTIFICATION_TITLES = ["Delivery Scheduled", "Delivery In Progress", "Order Delivered"];

  const handleNotificationClick = async (n) => {
    markAsRead(n._id);

    if (n.relatedModel !== "Order" || !n.relatedId) return;

    // Delivery-lifecycle updates aren't about the approval gate — re-deriving
    // a destination from approval status here would just bounce the shop
    // owner back toward Payment. Send them to Deliveries instead.
    if (DELIVERY_NOTIFICATION_TITLES.includes(n.title)) {
      setOpen(false);
      navigate("/deliveries");
      return;
    }

    try {
      const res = await axios.get(`${ORDERS_API_URL}/${n.relatedId}/approval-status`);
      const status = res.data?.data?.approval?.status;
      if (!status) return;

      const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
      localStorage.setItem(
        "clothCoreOrderDraft",
        JSON.stringify({ ...draft, orderId: n.relatedId })
      );
      setOpen(false);

      // Approved goes straight to Payment; Pending/Rejected/anything else
      // goes to the Admin Approval status page instead (never Payment) so
      // a rejection reason or "still pending" state is always visible.
      navigate(status === "Approved" ? "/step5" : "/order-approval");
    } catch (err) {
      // Silent — worst case the shop owner just doesn't get auto-routed and
      // can navigate manually from the Admin Approval page.
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
        className="cc-bell-btn"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: open ? "rgba(217,155,168,0.2)" : "var(--sidebar-bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <Bell className="cc-bell-icon" size={20} style={{ color: "var(--sidebar-accent)" }} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill cc-notif-badge"
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
          className="cc-notif-dropdown"
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
                  className="cc-notif-item"
                  onClick={() => handleNotificationClick(n)}
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
                      background: "rgba(133,79,108,0.16)",
                      color: "var(--clothcore-mauve)",
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
                background: "rgba(82,43,91,0.03)",
              }}
            >
              <button
                type="button"
                className="cc-text-btn"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                style={{ background: "transparent", border: "none", fontSize: "12px", fontWeight: 600, color: unreadCount === 0 ? "var(--clothcore-text-muted)" : "var(--clothcore-mauve)", cursor: unreadCount === 0 ? "not-allowed" : "pointer" }}
              >
                Mark all as read
              </button>
              <button
                type="button"
                className="cc-text-btn"
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
