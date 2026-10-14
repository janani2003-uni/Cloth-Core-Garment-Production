// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import { getUser } from "../utils/auth";
import { getOrderDisplayStatus, getOrderActionTarget, goToOrder, getEffectivePayment, TONE_COLORS } from "../utils/orderStatus";
import { getProductionStage } from "../utils/productionStage";
import {
  Box,
  Clock,
  CheckCircle,
  Eye,
  ArrowRight,
  CreditCard,
  BoxSeam,
  ExclamationTriangle
} from "react-bootstrap-icons";
import { API_BASE_URL } from "../utils/apiConfig";

function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [shopChecked, setShopChecked] = useState(false);

  // Orders API has no per-user filter yet, so fetch everything and filter client-side.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/orders`);
        const allOrders = Array.isArray(res.data) ? res.data : [];
        const myOrders = user?._id
          ? allOrders.filter((o) => String(o.userId) === String(user._id))
          : [];
        setOrders(myOrders);
      } catch (err) {
        console.error("Load Orders Error:", err);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nudge the owner to register/wait for shop approval if needed.
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/shops/my-shop`);
        setShop(res.data);
      } catch (err) {
        setShop(null);
      } finally {
        setShopChecked(true);
      }
    };
    fetchShop();
  }, []);


  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalOrders = orders.length;
  // approval.status is the new pre-payment gate (Pending/Approved/Rejected)
  // — distinct from the older `status` field (Pending/Production/Delivered)
  // which tracks the production lifecycle *after* approval. This stat is
  // specifically about approval, so it must read the right field.
  const pendingApproval = orders.filter((o) => o.approval?.status === "Pending").length;
  const inProduction = orders.filter((o) => o.status === "Production").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;

  const stats = [
    { label: "Total Orders", value: String(totalOrders), icon: Box, color: "var(--clothcore-purple)", bg: "rgba(82,43,91,0.1)" },
    { label: "Pending Approval", value: String(pendingApproval), icon: Clock, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
    { label: "In Production", value: String(inProduction), icon: BoxSeam, color: "var(--clothcore-mauve)", bg: "rgba(133,79,108,0.12)" },
    { label: "Delivered", value: String(delivered), icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" }
  ];

  const recentOrders = sortedOrders.slice(0, 5);

  const activeOrder = sortedOrders.find(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );

  // A shop owner's Dashboard treats a submitted-but-not-yet-verified
  // payment as already paid (see getEffectivePayment) — Submitted vs
  // Verified is Admin's own review-queue detail, not something reflected
  // back here. Real remaining balance owed is whatever's left after that.
  const totalOutstanding = orders.reduce(
    (sum, o) => sum + getEffectivePayment(o).effectiveRemaining,
    0
  );

  const pendingPaymentsCount = orders.filter(
    (o) => getEffectivePayment(o).status === "Pending"
  ).length;

  return (
    <ShopOwnerLayout contentClassName="p-3 p-md-4" contentStyle={{ maxWidth: "100%" }} fitScreen>
            {/* Shop Profile banner — only fires when there's no profile yet.
                Shop approval status (Pending/Rejected/Approved) used to get
                its own banners here too, but that workflow no longer gates
                anything for the shop owner, so those were removed. */}
            {shopChecked && !shop && (
              <div
                className="admin-content-card mb-2 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ background: "var(--clothcore-warning-bg)", border: "1px solid rgba(255,166,76,0.28)", borderRadius: "16px", padding: "12px 18px", flexShrink: 0 }}
              >
                <div className="d-flex align-items-center gap-3">
                  <ExclamationTriangle size={22} style={{ color: "var(--clothcore-warning)" }} />
                  <div>
                    <span className="admin-badge admin-badge-warning me-2">Shop Profile Required</span>
                    <span style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                      Complete your shop profile before placing bulk orders.
                    </span>
                  </div>
                </div>
                <button className="admin-btn-primary" style={{ whiteSpace: "nowrap" }} onClick={() => navigate("/shop-profile")}>
                  Update Shop Profile
                </button>
              </div>
            )}

            {/* Stats Cards — kept compact so the Recent Orders / Active
                Tracking boxes below get most of the screen. */}
            <div className="row g-2 mb-2" style={{ flexShrink: 0 }}>
              {stats.map((stat, index) => (
                <div key={index} className="col-xl-3 col-lg-6 col-md-6">
                  <div className="card admin-stat-card h-100" style={{
                    borderRadius: "12px",
                    boxShadow: "var(--clothcore-shadow)",
                    transition: "all 0.3s ease",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "var(--clothcore-shadow-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--clothcore-shadow)";
                  }}>
                    <div className="card-body px-3 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                            {stat.label}
                          </div>
                          <div className="fw-bold" style={{ fontSize: "17px", color: "var(--clothcore-text)" }}>
                            {stat.value}
                          </div>
                        </div>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "9px",
                          background: stat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <stat.icon size={16} style={{ color: stat.color }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table + Tracking — pinned to fill the remaining viewport
                height (see ShopOwnerLayout's fitScreen) instead of pushing
                the page taller. Each card sizes itself to its own content
                (no forced full-height stretch, which used to leave a big
                blank gap below a short list) and only starts scrolling
                internally once its content actually outgrows the space
                left in the row — so the page itself never needs a
                scrollbar, but nothing is ever force-stretched either.
                Plain flexbox on purpose, not Bootstrap's row/col-lg-* — see
                the note on Payments.js's old split layout for why h-100
                inside a Bootstrap row that can wrap is unreliable. */}
            <div className="dashboard-split-row" style={{ flex: 1, minHeight: 0 }}>
              {/* Recent Orders Table */}
              <div className="dashboard-split-col" style={{ flex: "7 1 0", minHeight: 0, display: "flex" }}>
                <div className="card admin-content-card d-flex flex-column" style={{
                  borderRadius: "20px",
                  boxShadow: "var(--clothcore-shadow-hover)",
                  overflow: "hidden",
                  minHeight: 0,
                  flex: 1,
                  width: "100%"
                }}>
                  <div className="card-header border-0 px-4 py-3 d-flex justify-content-between align-items-center" style={{ flexShrink: 0 }}>
                    <h5 className="fw-bold mb-0" style={{ color: "var(--clothcore-text)" }}>My Recent Orders</h5>
                    <button
                      className="btn btn-sm"
                      style={{
                        color: "var(--clothcore-purple)",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                      onClick={() => navigate("/orders")}
                    >
                      View All <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Compact row list instead of a wide table — every field
                      that matters (status, amount, action) stays visible
                      without ever needing to scroll sideways; only the item
                      description truncates. */}
                  <div className="card-body p-0" style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
                    {ordersLoading ? (
                      <div className="text-center py-4 text-muted">Loading orders...</div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-4 text-muted">No orders yet</div>
                    ) : (
                      recentOrders.map((order) => {
                        const display = getOrderDisplayStatus(order);
                        const tone = TONE_COLORS[display.tone] || TONE_COLORS.purple;
                        return (
                          <div
                            key={order._id}
                            className="d-flex align-items-center px-4 py-3"
                            style={{ borderBottom: "1px solid var(--clothcore-border)", transition: "background 0.2s ease" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(82,43,91,0.02)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                              <div className="fw-bold" style={{ color: "var(--clothcore-purple)", fontSize: "13px" }}>
                                {order.orderId}
                              </div>
                              <div
                                className="text-truncate"
                                style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", maxWidth: "100%" }}
                                title={`${order.item} · Qty ${order.quantity}`}
                              >
                                {order.item} · Qty {order.quantity}
                              </div>
                            </div>

                            <span
                              className="badge mx-3 flex-shrink-0"
                              style={{
                                background: tone.bg,
                                color: tone.color,
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "600",
                                padding: "5px 10px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {display.label}
                            </span>

                            <div
                              className="fw-bold text-end flex-shrink-0"
                              style={{ color: "var(--clothcore-text)", fontSize: "13px", minWidth: "90px" }}
                            >
                              LKR {Number(order.totalAmount || 0).toLocaleString()}
                            </div>

                            <button
                              type="button"
                              className="btn btn-sm fw-bold flex-shrink-0 ms-3"
                              onClick={() => goToOrder(navigate, order)}
                              style={{
                                background: "transparent",
                                border: "1.5px solid var(--clothcore-mauve)",
                                color: "var(--clothcore-purple)",
                                borderRadius: "20px",
                                fontSize: "12px",
                                padding: "5px 14px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {getOrderActionTarget(order).label}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Active Order Tracking */}
              <div className="dashboard-split-col" style={{ flex: "5 1 0", minHeight: 0, display: "flex" }}>
                <div className="card admin-content-card d-flex flex-column" style={{
                  borderRadius: "20px",
                  boxShadow: "var(--clothcore-shadow-hover)",
                  overflow: "hidden",
                  minHeight: 0,
                  flex: 1,
                  width: "100%"
                }}>
                  <div className="card-body p-4" style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
                    <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-text)" }}>
                      <BoxSeam size={20} className="me-2" style={{ color: "var(--clothcore-purple)" }} />
                      Active Order Tracking
                    </h5>

                    {activeOrder ? (
                      <div className="p-3" style={{
                        background: "rgba(82,43,91,0.045)",
                        borderRadius: "16px"
                      }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold mb-0">{activeOrder.orderId}</h6>
                            <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                              {activeOrder.item}
                            </p>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold" style={{ color: "var(--clothcore-purple)", fontSize: "18px" }}>
                              {activeOrder.progress || 0}%
                            </div>
                          </div>
                        </div>

                        <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${activeOrder.progress || 0}%`,
                              background: "linear-gradient(90deg, var(--clothcore-purple), var(--clothcore-mauve))",
                              borderRadius: "4px",
                              transition: "width 0.5s ease"
                            }}
                          />
                        </div>

                        {/* Real Production stage — derived from order.progress,
                            which backend/routes/productionRoutes.js keeps in
                            sync with the linked Production record on every
                            Admin/Supervisor update (syncOrderProgress()), so
                            this always matches the real stage, never a
                            hardcoded example. */}
                        {activeOrder.status === "Production" && (
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted">Production Stage</small>
                            <small className="fw-bold" style={{ color: "var(--clothcore-purple)" }}>
                              {getProductionStage(activeOrder.progress)}
                            </small>
                          </div>
                        )}

                        <div className="d-flex justify-content-between mt-2">
                          <small className="text-muted">Order Status</small>
                          <small className="text-muted">
                            {activeOrder.deliveryDate
                              ? `Est. Delivery: ${new Date(activeOrder.deliveryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
                              : "Not scheduled yet"}
                          </small>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center" style={{
                        background: "rgba(82,43,91,0.045)",
                        borderRadius: "16px",
                        color: "var(--clothcore-text-soft)"
                      }}>
                        <BoxSeam size={28} className="mb-2" style={{ color: "var(--clothcore-text-soft)" }} />
                        <div style={{ fontSize: "14px" }}>No active orders</div>
                      </div>
                    )}

                    <hr className="my-4" />

                    {/* Payment Summary */}
                    <h6 className="fw-bold mb-3" style={{ color: "var(--clothcore-text)" }}>
                      <CreditCard size={18} className="me-2" style={{ color: "var(--clothcore-purple)" }} />
                      Payment Summary
                    </h6>

                    <div className="d-flex justify-content-between align-items-center p-3" style={{
                      background: "linear-gradient(135deg, rgba(217,131,36,0.1), rgba(217,131,36,0.2))",
                      borderRadius: "12px",
                      marginBottom: "12px"
                    }}>
                      <span className="text-muted">Total Outstanding</span>
                      <span className="fw-bold text-danger" style={{ fontSize: "16px" }}>
                        LKR {totalOutstanding.toLocaleString()}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3" style={{
                      background: "linear-gradient(135deg, rgba(82,43,91,0.08), rgba(82,43,91,0.16))",
                      borderRadius: "12px",
                      marginBottom: "16px"
                    }}>
                      <span className="text-muted">Payments Pending</span>
                      <span className="fw-bold" style={{ color: "var(--clothcore-purple)" }}>
                        {pendingPaymentsCount}
                      </span>
                    </div>

                    <button
                      className="btn w-100 py-2 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                        color: "white",
                        borderRadius: "12px",
                        border: "none",
                        transition: "all 0.3s ease"
                      }}
                      onClick={() => navigate("/payments")}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(82,43,91,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Eye size={16} className="me-2" /> View Payment History
                    </button>
                  </div>
                </div>
              </div>
            </div>

      <style>
        {`
          .dashboard-split-row {
            display: flex;
            gap: 16px;
          }
          @media (max-width: 991px) {
            .dashboard-split-row {
              flex-direction: column;
            }
          }
        `}
      </style>
    </ShopOwnerLayout>
  );
}

export default Dashboard;