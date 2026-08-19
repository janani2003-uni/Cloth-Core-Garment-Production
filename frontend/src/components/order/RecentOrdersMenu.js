// src/components/order/RecentOrdersMenu.js
// One reusable "Recent Orders" dropdown, rendered once inside
// OrderStepHeader so it's available on every order-flow page (Step 1
// through Payment) instead of seven separate copies. Clicking an order
// routes through the same goToOrder() helper the Shop Owner dashboard uses,
// so an Approved order always lands on the same Payment page whether it
// was opened from here, the dashboard, or a notification.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IconClipboardList, IconChevronDown } from "@tabler/icons-react";
import { ORDER_COLORS as C } from "../../utils/orderTheme";
import { getUser } from "../../utils/auth";
import { getOrderDisplayStatus, getOrderActionTarget, goToOrder, TONE_COLORS } from "../../utils/orderStatus";

const ORDERS_API_URL = "http://localhost:5000/api/orders";

function RecentOrdersMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  const user = getUser();

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(ORDERS_API_URL);
      const all = Array.isArray(res.data) ? res.data : [];
      const mine = all
        .filter((o) => String(o.userId) === String(user._id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      setOrders(mine);
      setLoaded(true);
    } catch (err) {
      // Silent — this is a convenience panel, not a critical page element.
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleToggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next && !loaded) load();
      return next;
    });
  };

  const handleSelect = (order) => {
    setOpen(false);
    goToOrder(navigate, order);
  };

  if (!user?._id) return null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleToggle}
        className="d-flex align-items-center gap-2"
        style={{
          background: "#fff",
          border: `1.5px solid ${C.pink200}`,
          borderRadius: 12,
          padding: "9px 16px",
          fontSize: 13,
          fontWeight: 600,
          color: C.plum700,
          boxShadow: "0 2px 8px rgba(25,0,25,0.06)",
        }}
      >
        <IconClipboardList size={16} stroke={2} />
        My Recent Orders
        <IconChevronDown size={14} stroke={2} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 0,
            width: 340,
            maxWidth: "90vw",
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${C.pink200}`,
            boxShadow: "0 20px 50px rgba(25,0,25,0.18)",
            overflow: "hidden",
            zIndex: 500,
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.pink200}`, fontSize: 12.5, fontWeight: 700, color: C.plum900, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Recent Orders
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm" role="status" style={{ color: C.mauve500 }} />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-4" style={{ color: C.mauve500, fontSize: 13 }}>
                No orders yet.
              </div>
            ) : (
              orders.map((order) => {
                const display = getOrderDisplayStatus(order);
                const action = getOrderActionTarget(order);
                const tone = TONE_COLORS[display.tone] || TONE_COLORS.purple;

                return (
                  <button
                    key={order._id}
                    type="button"
                    onClick={() => handleSelect(order)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1px solid rgba(82,43,91,0.08)`,
                      padding: "12px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.plum900 }}>{order.orderId}</div>
                      <span
                        style={{ background: tone.bg, color: tone.color, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}
                      >
                        {display.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.mauve500, marginTop: 2 }}>{order.item}</div>
                    <div style={{ fontSize: 11.5, color: C.plum700, fontWeight: 600, marginTop: 4 }}>{action.label} →</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecentOrdersMenu;
