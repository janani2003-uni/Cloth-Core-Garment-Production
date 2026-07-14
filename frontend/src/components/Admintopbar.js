// src/components/Admintopbar.js

import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Search,
  PersonPlus,
  ExclamationTriangle,
  CartPlus,
  CreditCard,
  CheckCircle,
  X,
} from "react-bootstrap-icons";

function Admintopbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New user registered",
      message: "A new user has created an account.",
      time: "2 mins ago",
      type: "user",
      read: false,
    },
    {
      id: 2,
      title: "Low stock alert",
      message: "Cotton Fabric stock is running low.",
      time: "10 mins ago",
      type: "stock",
      read: false,
    },
    {
      id: 3,
      title: "New order received",
      message: "Order #ORD-1056 has been placed.",
      time: "25 mins ago",
      type: "order",
      read: false,
    },
    {
      id: 4,
      title: "Payment received",
      message: "Payment for Order #ORD-1048 was received.",
      time: "1 hour ago",
      type: "payment",
      read: false,
    },
    {
      id: 5,
      title: "System update",
      message: "Daily backup completed successfully.",
      time: "Today",
      type: "system",
      read: false,
    },
  ]);

  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

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
      case "stock":
        return <ExclamationTriangle size={18} />;
      case "order":
        return <CartPlus size={18} />;
      case "payment":
        return <CreditCard size={18} />;
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

      case "stock":
        return {
          backgroundColor: "#fff3e0",
          color: "#e65100",
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

      default:
        return {
          backgroundColor: "#eef2f7",
          color: "#475569",
        };
    }
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        padding: "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
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
              backgroundColor: showNotifications ? "#eef2ff" : "transparent",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            <Bell size={20} color="#1e293b" />

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
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
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
                  borderBottom: "1px solid #e2e8f0",
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
                      color: "#0f172a",
                    }}
                  >
                    Notifications
                  </div>

                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "12px",
                      color: "#64748b",
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
                    backgroundColor: "#f1f5f9",
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
                      color="#cbd5e1"
                      style={{
                        marginBottom: "12px",
                      }}
                    />

                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#475569",
                      }}
                    >
                      No notifications
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "#94a3b8",
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
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(notification.id)
                        }
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          display: "flex",
                          gap: "12px",
                          textAlign: "left",
                          backgroundColor: notification.read
                            ? "white"
                            : "#f8faff",
                          border: "none",
                          borderBottom: "1px solid #f1f5f9",
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
                                fontWeight: notification.read ? "600" : "700",
                                color: "#0f172a",
                              }}
                            >
                              {notification.title}
                            </div>

                            {!notification.read && (
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
                              color: "#64748b",
                            }}
                          >
                            {notification.message}
                          </div>

                          <div
                            style={{
                              marginTop: "6px",
                              fontSize: "11px",
                              color: "#94a3b8",
                            }}
                          >
                            {notification.time}
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
                    borderTop: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
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
                      color: unreadCount === 0 ? "#94a3b8" : "#2563eb",
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

        {/* ADMIN USER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "#0b3aa0",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            A
          </div>

          <span
            style={{
              fontWeight: "bold",
              color: "#0f172a",
            }}
          >
            Admin User
          </span>
        </div>
      </div>
    </div>
  );
}

export default Admintopbar;