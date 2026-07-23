// src/components/Admintopbar.js

import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import {
  Bell,
  PersonPlus,
  ExclamationTriangle,
  CartPlus,
  CreditCard,
  CheckCircle,
  ChatDots,
  X,
} from "react-bootstrap-icons";
import UserAccountMenu from "./UserAccountMenu";

const NOTIFICATIONS_API_URL = "http://localhost:5000/api/notifications";

function formatRelativeTime(dateInput) {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function Admintopbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(NOTIFICATIONS_API_URL);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "user":
        return <PersonPlus size={18} />;
      case "staff":
        return <PersonPlus size={18} />;
      case "inventory":
        return <ExclamationTriangle size={18} />;
      case "production":
        return <CartPlus size={18} />;
      case "order":
        return <CartPlus size={18} />;
      case "payment":
        return <CreditCard size={18} />;
      case "ticket":
        return <ChatDots size={18} />;
      case "system":
        return <CheckCircle size={18} />;
      default:
        return <CheckCircle size={18} />;
    }
  };

  const getNotificationIconStyle = (type) => {
    switch (type) {
      case "user":
        return {
          backgroundColor: "#e8f0fe",
          color: "#2563eb",
        };

      case "staff":
        return {
          backgroundColor: "#e0f2fe",
          color: "#0369a1",
        };

      case "inventory":
        return {
          backgroundColor: "#fff3e0",
          color: "#e65100",
        };

      case "production":
        return {
          backgroundColor: "#f3e8ff",
          color: "#9333ea",
        };

      case "order":
        return {
          backgroundColor: "#ede9fe",
          color: "#7c3aed",
        };

      case "payment":
        return {
          backgroundColor: "#e8f5e9",
          color: "#2e7d32",
        };

      case "ticket":
        return {
          backgroundColor: "#fce7f3",
          color: "#be185d",
        };

      case "system":
        return {
          backgroundColor: "#eef2f7",
          color: "#475569",
        };

      default:
        return {
          backgroundColor: "#eef2f7",
          color: "#475569",
        };
    }
  };

  const handleNotificationClick = async (notificationId) => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        notification._id === notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    );

    try {
      await axios.put(`${NOTIFICATIONS_API_URL}/${notificationId}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    try {
      await axios.put(`${NOTIFICATIONS_API_URL}/read-all`);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      fetchNotifications();
    }
  };

  const handleClearNotifications = async () => {
    setNotifications([]);
    setShowNotifications(false);

    try {
      await axios.delete(NOTIFICATIONS_API_URL);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      fetchNotifications();
    }
  };

  return (
    <div
      className="admin-topbar"
      style={{ position: "relative", zIndex: 100 }}
    >
      <div style={{ flex: 1 }}></div>

      {/* RIGHT SECTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* NOTIFICATION */}
        <div
          ref={notificationRef}
          style={{
            position: "relative",
          }}
        >
          <button
            type="button"
            aria-label="Open notifications"
            onClick={() =>
              setShowNotifications((previousValue) => !previousValue)
            }
            style={{
              position: "relative",
              width: "38px",
              height: "38px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: showNotifications ? "rgba(82,43,91,0.08)" : "transparent",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            <Bell size={20} color="var(--clothcore-blush)" />

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0px",
                  minWidth: "17px",
                  height: "17px",
                  padding: "0 4px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "700",
                  borderRadius: "20px",
                  border: "2px solid white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                right: "0",
                width: "380px",
                maxWidth: "90vw",
                backgroundColor: "var(--clothcore-card)",
                border: "1px solid var(--clothcore-border-strong)",
                borderRadius: "14px",
                boxShadow: "0 15px 40px rgba(15,23,42,0.18)",
                overflow: "hidden",
                zIndex: 9999,
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid var(--clothcore-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "var(--clothcore-text)",
                    }}
                  >
                    Notifications
                  </div>

                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "12px",
                      color: "var(--clothcore-text-soft)",
                    }}
                  >
                    {unreadCount} unread notification
                    {unreadCount === 1 ? "" : "s"}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* NOTIFICATION LIST */}
              <div
                style={{
                  maxHeight: "390px",
                  overflowY: "auto",
                }}
              >
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "45px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Bell
                      size={38}
                      color="var(--clothcore-text-muted)"
                      style={{
                        marginBottom: "12px",
                      }}
                    />

                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "var(--clothcore-text)",
                      }}
                    >
                      No notifications
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "var(--clothcore-text-muted)",
                      }}
                    >
                      New updates will appear here.
                    </div>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const iconStyle = getNotificationIconStyle(
                      notification.type
                    );

                    return (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(notification._id)
                        }
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          display: "flex",
                          gap: "12px",
                          textAlign: "left",
                          backgroundColor: notification.isRead
                            ? "transparent"
                            : "rgba(133,79,108,0.1)",
                          border: "none",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "10px",
                            backgroundColor: iconStyle.backgroundColor,
                            color: iconStyle.color,
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "10px",
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: notification.isRead
                                  ? "600"
                                  : "700",
                                color: "var(--clothcore-text)",
                              }}
                            >
                              {notification.title}
                            </div>

                            {!notification.isRead && (
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  marginTop: "5px",
                                  flexShrink: 0,
                                  backgroundColor: "#2563eb",
                                  borderRadius: "50%",
                                }}
                              />
                            )}
                          </div>

                          <div
                            style={{
                              marginTop: "3px",
                              fontSize: "12px",
                              lineHeight: "1.5",
                              color: "var(--clothcore-text-soft)",
                            }}
                          >
                            {notification.message}
                          </div>

                          <div
                            style={{
                              marginTop: "6px",
                              fontSize: "11px",
                              color: "var(--clothcore-text-muted)",
                            }}
                          >
                            {formatRelativeTime(notification.createdAt)}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* FOOTER */}
              {notifications.length > 0 && (
                <div
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    borderTop: "1px solid var(--clothcore-border)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    style={{
                      padding: "7px 12px",
                      backgroundColor: "transparent",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: unreadCount === 0 ? "var(--clothcore-text-muted)" : "var(--clothcore-blush)",
                      cursor: unreadCount === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    Mark all as read
                  </button>

                  <button
                    type="button"
                    onClick={handleClearNotifications}
                    style={{
                      padding: "7px 12px",
                      backgroundColor: "transparent",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#dc2626",
                      cursor: "pointer",
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <UserAccountMenu />
      </div>
    </div>
  );
}

export default Admintopbar;