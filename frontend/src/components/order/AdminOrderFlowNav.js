// src/components/order/AdminOrderFlowNav.js
// Admin-only fast-access panel for the order-placement flow — lets an Admin
// jump directly to any step (Garment through Payment) for testing/demo
// purposes without walking through the wizard in order. Never rendered for
// Shop Owner or Supervisor (role-gated at render time, see usage in
// OrderStepHeader.js).
//
// Step 6 (Approval) and Step 7 (Payment) need a *real* saved order to show
// anything meaningful — rather than fabricating fake data (which the spec
// explicitly forbids), this panel lets the Admin pick one of the system's
// actual recent orders and stores that choice in its own localStorage key
// (clothCoreAdminPreviewOrderId), completely separate from the real
// clothCoreOrderDraft a Shop Owner (or an Admin currently previewing Shop
// Owner) is actually building — so jumping around for testing can never
// contaminate or short-circuit a real in-progress order.
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { IconFlask2, IconChevronDown } from "@tabler/icons-react";
import { ORDER_COLORS as C, ORDER_STEPS } from "../../utils/orderTheme";

const ORDERS_API_URL = "http://localhost:5000/api/orders";
export const ADMIN_PREVIEW_ORDER_KEY = "clothCoreAdminPreviewOrderId";

function AdminOrderFlowNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(localStorage.getItem(ADMIN_PREVIEW_ORDER_KEY) || "");
  const [open, setOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await axios.get(ORDERS_API_URL);
      const all = Array.isArray(res.data) ? res.data : [];
      const recent = all
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setOrders(recent);

      // Auto-pick the most recent order the first time there's no saved
      // preview selection yet, so Step 6/7 links are useful immediately.
      if (!selectedId && recent.length > 0) {
        setSelectedId(recent[0]._id);
        localStorage.setItem(ADMIN_PREVIEW_ORDER_KEY, recent[0]._id);
      }
    } catch (err) {
      // Silent — this is a testing convenience panel, never load-bearing.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSelectOrder = (e) => {
    const value = e.target.value;
    setSelectedId(value);
    localStorage.setItem(ADMIN_PREVIEW_ORDER_KEY, value);
  };

  return (
    <div
      className="mb-3"
      style={{
        background: "#fff",
        border: `1.5px dashed ${C.mauve500}`,
        borderRadius: 14,
        padding: "12px 16px",
      }}
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <div className="d-flex align-items-center gap-2" style={{ fontSize: 12.5, fontWeight: 700, color: C.plum700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <IconFlask2 size={16} stroke={2} />
          Admin Test Navigation
        </div>

        <button
          type="button"
          className="d-flex align-items-center gap-1"
          onClick={() => setOpen((v) => !v)}
          style={{ background: "transparent", border: "none", color: C.mauve500, fontSize: 12, fontWeight: 600 }}
        >
          Preview order <IconChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
        </button>
      </div>

      {open && (
        <div className="mb-3">
          <select
            className="form-select form-select-sm"
            value={selectedId}
            onChange={handleSelectOrder}
            style={{ borderRadius: 8, border: `1.5px solid ${C.pink200}`, fontSize: 12.5, maxWidth: 420 }}
          >
            <option value="">— No order selected —</option>
            {orders.map((o) => (
              <option key={o._id} value={o._id}>
                {o.orderId} · {o.customerName} · {o.approval?.status || "Not Required"}
              </option>
            ))}
          </select>
          <small className="d-block mt-1" style={{ color: C.mauve500, fontSize: 11 }}>
            Used to load real data on Step 6 (Approval) and Step 7 (Payment) when jumping directly there.
          </small>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2">
        {ORDER_STEPS.map((step, index) => {
          const isCurrent = location.pathname === step.path;
          return (
            <button
              key={step.path}
              type="button"
              onClick={() => navigate(step.path)}
              style={{
                background: isCurrent ? C.plum700 : "rgba(82,43,91,0.06)",
                color: isCurrent ? "#fff" : C.plum700,
                border: "none",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {index + 1}. {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AdminOrderFlowNav;
