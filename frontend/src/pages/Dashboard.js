// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import { getUser } from "../utils/auth";
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
        const res = await axios.get("http://localhost:5000/api/orders");
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
        const res = await axios.get("http://localhost:5000/api/shops/my-shop");
        setShop(res.data);
      } catch (err) {
        setShop(null);
      } finally {
        setShopChecked(true);
      }
    };
    fetchShop();
  }, []);

  const getStatusBadgeBg = (status) => {
    switch (status) {
      case "Delivered":
        return "linear-gradient(135deg, var(--clothcore-success), #158a52)";
      case "Cancelled":
        return "linear-gradient(135deg, var(--clothcore-danger), #b83d4d)";
      case "Approved":
        return "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))";
      case "Production":
        return "linear-gradient(135deg, var(--clothcore-warning), #b8701d)";
      case "Pending":
      default:
        return "linear-gradient(135deg, var(--clothcore-warning), #b8701d)";
    }
  };

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalOrders = orders.length;
  const pendingApproval = orders.filter((o) => o.status === "Pending").length;
  const inProduction = orders.filter((o) => o.status === "Production").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;

  const stats = [
    { label: "Total Orders", value: String(totalOrders), icon: Box, color: "var(--clothcore-blush)", bg: "rgba(82,43,91,0.1)" },
    { label: "Pending Approval", value: String(pendingApproval), icon: Clock, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
    { label: "In Production", value: String(inProduction), icon: BoxSeam, color: "var(--clothcore-mauve)", bg: "rgba(133,79,108,0.12)" },
    { label: "Delivered", value: String(delivered), icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" }
  ];

  const recentOrders = sortedOrders.slice(0, 5);

  const activeOrder = sortedOrders.find(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );

  const totalOutstanding = orders
    .filter((o) => o.paymentStatus !== "Paid")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const pendingPaymentsCount = orders.filter((o) => o.paymentStatus === "Pending").length;

  const shopCompletion = shop
    ? Math.round(
        ([shop.shopName, shop.shopAddress, shop.phone, shop.email, shop.city, shop.businessType, shop.garmentCategories, shop.businessDescription]
          .filter((v) => v && String(v).trim() !== "").length /
          8) * 100
      )
    : 0;

  return (
    <ShopOwnerLayout contentClassName="p-3 p-md-4" contentStyle={undefined}>
            {/* Shop Status Banner — 4 states: no profile / pending / rejected / approved */}
            {shopChecked && !shop && (
              <div
                className="admin-content-card mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ background: "var(--clothcore-warning-bg)", border: "1px solid rgba(255,166,76,0.28)", borderRadius: "16px", padding: "16px 20px" }}
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
                  Create Shop Profile
                </button>
              </div>
            )}

            {shopChecked && shop && shop.approvalStatus === "Pending" && (
              <div
                className="admin-content-card mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ background: "var(--clothcore-warning-bg)", border: "1px solid rgba(255,166,76,0.28)", borderRadius: "16px", padding: "16px 20px" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <ExclamationTriangle size={22} style={{ color: "var(--clothcore-warning)" }} />
                  <div>
                    <span className="admin-badge admin-badge-warning me-2">Approval Pending</span>
                    <span style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                      Your shop profile has been submitted and is waiting for Admin approval.
                    </span>
                  </div>
                </div>
                <button className="admin-btn-secondary" style={{ whiteSpace: "nowrap" }} onClick={() => navigate("/shop-profile")}>
                  View Shop Profile
                </button>
              </div>
            )}

            {shopChecked && shop && shop.approvalStatus === "Rejected" && (
              <div
                className="admin-content-card mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ background: "var(--clothcore-danger-bg)", border: "1px solid rgba(220,90,100,0.3)", borderRadius: "16px", padding: "16px 20px" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <ExclamationTriangle size={22} style={{ color: "var(--clothcore-danger)" }} />
                  <div>
                    <span className="admin-badge admin-badge-danger me-2">Changes Required</span>
                    <span style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                      Your shop profile needs changes before approval.
                      {shop.rejectionReason ? ` "${shop.rejectionReason}"` : ""}
                    </span>
                  </div>
                </div>
                <button className="admin-btn-primary" style={{ whiteSpace: "nowrap" }} onClick={() => navigate("/shop-profile")}>
                  Update Shop Profile
                </button>
              </div>
            )}

            {shopChecked && shop && shop.approvalStatus === "Approved" && (
              <div
                className="admin-content-card mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ background: "var(--clothcore-success-bg)", border: "1px solid rgba(70,180,120,0.25)", borderRadius: "16px", padding: "16px 20px" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <CheckCircle size={22} style={{ color: "var(--clothcore-success)" }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--clothcore-text)" }}>{shop.shopName}</span>
                      <span className="admin-badge admin-badge-success">Approved Shop</span>
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>
                      Shop ID: {shop.shopCode || "N/A"} · Profile {shopCompletion}% complete
                    </span>
                  </div>
                </div>
                <button className="admin-btn-secondary" style={{ whiteSpace: "nowrap" }} onClick={() => navigate("/shop-profile")}>
                  Manage Shop Profile
                </button>
              </div>
            )}

            {/* Stats Cards - Same as before */}
            <div className="row g-3 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className="col-xl-3 col-lg-6 col-md-6">
                  <div className="card admin-stat-card h-100" style={{
                    borderRadius: "16px",
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
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                            {stat.label}
                          </div>
                          <div className="fw-bold" style={{ fontSize: "28px", color: "var(--clothcore-text)", marginTop: "4px" }}>
                            {stat.value}
                          </div>
                        </div>
                        <div style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: stat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <stat.icon size={24} style={{ color: stat.color }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table + Tracking - Same as before */}
            <div className="row g-4">
              {/* Recent Orders Table */}
              <div className="col-lg-7">
                <div className="card admin-content-card" style={{
                  borderRadius: "20px",
                  boxShadow: "var(--clothcore-shadow-hover)",
                  overflow: "hidden"
                }}>
                  <div className="card-header border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0" style={{ color: "var(--clothcore-text)" }}>My Recent Orders</h5>
                    <button
                      className="btn btn-sm"
                      style={{
                        color: "var(--clothcore-blush)",
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

                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px" }}>
                        <thead style={{
                          background: "rgba(255,255,255,0.04)",
                          borderBottom: "2px solid var(--clothcore-border)"
                        }}>
                          <tr>
                            <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Order ID
                            </th>
                            <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Item
                            </th>
                            <th className="px-4 py-3 fw-bold text-center" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Qty
                            </th>
                            <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Status
                            </th>
                            <th className="px-4 py-3 fw-bold text-end" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersLoading ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-muted">
                                Loading orders...
                              </td>
                            </tr>
                          ) : recentOrders.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-muted">
                                No orders yet
                              </td>
                            </tr>
                          ) : (
                            recentOrders.map((order) => (
                              <tr key={order._id} style={{
                                transition: "all 0.2s ease",
                                borderBottom: "1px solid var(--clothcore-border)"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(82,43,91,0.02)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}>
                                <td className="px-4 py-3">
                                  <span className="fw-bold" style={{ color: "var(--clothcore-blush)", fontSize: "13px" }}>
                                    {order.orderId}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{order.item}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="fw-bold">{order.quantity}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="badge px-3 py-2" style={{
                                    background: getStatusBadgeBg(order.status),
                                    color: "white",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                  }}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-end">
                                  <span className="fw-bold" style={{ color: "var(--clothcore-text)" }}>
                                    LKR {Number(order.totalAmount || 0).toLocaleString()}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Order Tracking */}
              <div className="col-lg-5">
                <div className="card admin-content-card" style={{
                  borderRadius: "20px",
                  boxShadow: "var(--clothcore-shadow-hover)",
                  overflow: "hidden"
                }}>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-text)" }}>
                      <BoxSeam size={20} className="me-2" style={{ color: "var(--clothcore-blush)" }} />
                      Active Order Tracking
                    </h5>

                    {activeOrder ? (
                      <div className="p-3" style={{
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "16px"
                      }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="badge" style={{
                              background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "11px"
                            }}>
                              {activeOrder.status}
                            </span>
                            <h6 className="fw-bold mt-2 mb-0">{activeOrder.orderId}</h6>
                            <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                              {activeOrder.item}
                            </p>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold" style={{ color: "var(--clothcore-blush)", fontSize: "18px" }}>
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

                        <div className="d-flex justify-content-between mt-2">
                          <small className="text-muted">Started</small>
                          <small className="text-muted">
                            {activeOrder.deliveryDate
                              ? `Estimated: ${new Date(activeOrder.deliveryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
                              : "Not scheduled yet"}
                          </small>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center" style={{
                        background: "rgba(255,255,255,0.04)",
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
                      <CreditCard size={18} className="me-2" style={{ color: "var(--clothcore-blush)" }} />
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
                      <span className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>
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
    </ShopOwnerLayout>
  );
}

export default Dashboard;