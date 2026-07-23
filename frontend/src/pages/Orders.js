import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import axios from "axios";
import {
  Search,
  Eye,
  ExclamationCircle,
  CheckCircle,
  Clock,
  Box,
  Wallet2,
  Calendar,
  XCircle,
  Truck,
  Send,
  Image,
  ArrowRepeat
} from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/orders";
const SAMPLES_API_URL = "http://localhost:5000/api/samples";
const ORDERS_PER_PAGE = 8;

const SAMPLE_STATUS_BADGE = {
  Preparing: "admin-badge-warning",
  "Awaiting Shop Approval": "admin-badge-info",
  Approved: "admin-badge-success",
  "Revision Requested": "admin-badge-danger",
};

function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [sample, setSample] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleComment, setSampleComment] = useState("");
  const [sampleActionError, setSampleActionError] = useState("");
  const [savingSampleAction, setSavingSampleAction] = useState(false);

  // The backend already scopes this to the logged-in shop owner's own
  // orders (Admins get everything) — no client-side filtering needed.
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Load Orders Error:", err);
      setError(err.response?.data?.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      String(order.orderId || "").toLowerCase().includes(search) ||
      String(order.item || "").toLowerCase().includes(search) ||
      String(order.status || "").toLowerCase().includes(search)
    );
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: Box, color: "var(--clothcore-blush)", bg: "var(--clothcore-info-bg)" },
    { label: "Pending Approval", value: pendingOrders, icon: Clock, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
    { label: "Delivered", value: deliveredOrders, icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" },
    { label: "Total Value", value: `LKR ${totalRevenue.toLocaleString()}`, icon: Wallet2, color: "var(--clothcore-blush)", bg: "var(--clothcore-info-bg)" },
  ];

  // Status values match the real Order model enum exactly.
  const getStatusBadgeStyle = (status) => {
    const styles = {
      Pending: { badgeClass: "admin-badge-warning", icon: Clock },
      Approved: { badgeClass: "admin-badge-info", icon: CheckCircle },
      Production: { badgeClass: "admin-badge-accent", icon: Send },
      Delivered: { badgeClass: "admin-badge-success", icon: Truck },
      Cancelled: { badgeClass: "admin-badge-danger", icon: XCircle },
    };
    return styles[status] || styles["Pending"];
  };

  const getProgressColor = (progress) => {
    const val = Number(progress) || 0;
    if (val >= 80) return "var(--clothcore-success)";
    if (val >= 50) return "var(--clothcore-warning)";
    return "var(--clothcore-info)";
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
    setSample(null);
    setSampleComment("");
    setSampleActionError("");
    setSampleLoading(true);
    try {
      const res = await axios.get(`${SAMPLES_API_URL}/order/${order._id}`);
      setSample(res.data);
    } catch (err) {
      setSample(null);
    } finally {
      setSampleLoading(false);
    }
  };

  const handleApproveSample = async () => {
    if (!sample) return;
    try {
      setSavingSampleAction(true);
      setSampleActionError("");
      const res = await axios.put(`${SAMPLES_API_URL}/${sample._id}/approve`);
      setSample(res.data.sample);
    } catch (err) {
      setSampleActionError(err.response?.data?.message || "Could not approve the sample.");
    } finally {
      setSavingSampleAction(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!sample) return;
    if (!sampleComment.trim()) {
      setSampleActionError("Please add a comment describing what needs to change.");
      return;
    }
    try {
      setSavingSampleAction(true);
      setSampleActionError("");
      const res = await axios.put(`${SAMPLES_API_URL}/${sample._id}/request-revision`, {
        comment: sampleComment,
      });
      setSample(res.data.sample);
    } catch (err) {
      setSampleActionError(err.response?.data?.message || "Could not request a revision.");
    } finally {
      setSavingSampleAction(false);
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfFirst + ORDERS_PER_PAGE);

  if (loading) {
    return (
      <ShopOwnerLayout contentClassName="d-flex align-items-center justify-content-center" contentStyle={{ minHeight: "60vh" }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 style={{ color: "var(--clothcore-blush)" }}>Loading Orders...</h5>
            </div>
      </ShopOwnerLayout>
    );
  }

  if (error) {
    return (
      <ShopOwnerLayout contentClassName="d-flex align-items-center justify-content-center" contentStyle={{ minHeight: "60vh" }}>
            <div className="text-center">
              <ExclamationCircle size={48} style={{ color: "var(--clothcore-danger)" }} />
              <h5 className="mt-3" style={{ color: "var(--clothcore-danger)" }}>{error}</h5>
              <button className="btn btn-primary mt-3" onClick={fetchOrders}>Retry</button>
            </div>
      </ShopOwnerLayout>
    );
  }

  return (
    <ShopOwnerLayout>
          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-xl-3 col-lg-6 col-md-6">
                <div className="card admin-stat-card h-100" style={{ borderRadius: "16px" }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>{stat.label}</div>
                        <div className="fw-bold" style={{ fontSize: "24px", color: "var(--clothcore-text)", marginTop: "4px" }}>{stat.value}</div>
                      </div>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "12px", background: stat.bg,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <stat.icon size={24} style={{ color: stat.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Header with Actions */}
          <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center mb-4 gap-3">
            <div>
              <h1 className="fw-bold" style={{ fontSize: "28px", color: "var(--clothcore-text)" }}>My Orders</h1>
              <p className="text-muted mb-0" style={{ fontSize: "15px" }}>View and track all of your garment orders</p>
            </div>

            <button
              className="btn fw-bold px-4 py-2"
              style={{
                background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                color: "white", borderRadius: "12px", border: "none"
              }}
              onClick={() => navigate("/step1")}
            >
              + Place Order
            </button>
          </div>

          {/* Table Card */}
          <div className="card admin-content-card" style={{ borderRadius: "20px", overflow: "hidden" }}>
            <div className="card-header border-0 px-4 py-4">
              <div className="position-relative" style={{ maxWidth: "400px" }}>
                <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Order ID, Item or Status..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ paddingLeft: "42px", borderRadius: "12px", border: "2px solid var(--clothcore-border)", fontSize: "14px", height: "44px" }}
                />
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px" }}>
                  <thead style={{ background: "rgba(223,182,178,0.10)", borderBottom: "2px solid var(--clothcore-border)" }}>
                    <tr>
                      <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Order ID</th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Item</th>
                      <th className="px-4 py-3 fw-bold text-center" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Qty</th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Date</th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Status</th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Progress</th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Payment</th>
                      <th className="px-4 py-3 fw-bold text-end" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Amount</th>
                      <th className="px-4 py-3 fw-bold text-center" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <div style={{ color: "var(--clothcore-text-soft)" }}>
                            <Box size={48} style={{ color: "var(--clothcore-text-soft)" }} />
                            <h5 className="mt-2">No orders found</h5>
                            <p style={{ fontSize: "14px" }}>
                              {orders.length === 0 ? "Place your first order to see it here." : "Try a different search."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentOrders.map((order) => {
                        const statusStyle = getStatusBadgeStyle(order.status);
                        const StatusIcon = statusStyle.icon;
                        return (
                          <tr key={order._id} style={{ borderBottom: "1px solid var(--clothcore-border)" }}>
                            <td className="px-4 py-3">
                              <span className="fw-bold" style={{ color: "var(--clothcore-blush)", fontSize: "13px" }}>{order.orderId}</span>
                            </td>
                            <td className="px-4 py-3">{order.item || "N/A"}</td>
                            <td className="px-4 py-3 text-center"><span className="fw-bold">{order.quantity || 0}</span></td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <Calendar size={14} className="text-muted me-2" />
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`admin-badge ${statusStyle.badgeClass}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <StatusIcon size={12} />
                                {order.status || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress" style={{ width: "80px", height: "6px" }}>
                                  <div className="progress-bar" style={{ width: `${order.progress || 0}%`, backgroundColor: getProgressColor(order.progress) }} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>{order.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`admin-badge ${
                                order.paymentStatus === "Paid" ? "admin-badge-success" :
                                order.paymentStatus === "Partial" ? "admin-badge-accent" : "admin-badge-warning"
                              }`}>
                                {order.paymentStatus || "Pending"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-end">
                              <span className="fw-bold" style={{ color: "var(--clothcore-text)" }}>
                                LKR {Number(order.totalAmount || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                className="btn btn-sm"
                                onClick={() => handleViewOrder(order)}
                                style={{ background: "rgba(82,43,91,0.08)", borderRadius: "8px", padding: "6px 12px", border: "none", color: "var(--clothcore-blush)" }}
                                title="View Order"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredOrders.length > 0 && (
              <div className="card-footer border-0 px-4 py-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: "14px" }}>
                    Showing <strong>{indexOfFirst + 1}</strong>–<strong>{Math.min(indexOfFirst + ORDERS_PER_PAGE, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong>
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm px-3 py-1"
                      style={{ borderRadius: "8px", border: "2px solid var(--clothcore-border)", background: "rgba(255,255,255,0.055)", fontWeight: "500", fontSize: "13px" }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <span className="d-flex align-items-center px-2" style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-sm px-3 py-1"
                      style={{ borderRadius: "8px", border: "2px solid var(--clothcore-border)", background: "rgba(255,255,255,0.055)", fontWeight: "500", fontSize: "13px" }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              className="btn px-4 py-2"
              style={{ background: "rgba(107,91,115,0.1)", color: "var(--clothcore-text-soft)", borderRadius: "12px", border: "none", fontWeight: "500" }}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>
                  Order Details — {selectedOrder.orderId}
                </h5>
                <button className="btn-close" onClick={() => setShowViewModal(false)} />
              </div>
              <div className="modal-body" style={{ padding: "24px" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Item</small>
                      <h6 className="mb-0">{selectedOrder.item || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Quantity</small>
                      <h6 className="mb-0">{selectedOrder.quantity || 0}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Unit Price</small>
                      <h6 className="mb-0">LKR {Number(selectedOrder.unitPrice || 0).toLocaleString()}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Total Amount</small>
                      <h6 className="mb-0" style={{ color: "var(--clothcore-blush)" }}>LKR {Number(selectedOrder.totalAmount || 0).toLocaleString()}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Payment Status</small>
                      <h6 className="mb-0">{selectedOrder.paymentStatus || "Pending"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Status</small>
                      <h6 className="mb-0">{selectedOrder.status || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Delivery Date</small>
                      <h6 className="mb-0">
                        {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : "Not scheduled yet"}
                      </h6>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Notes</small>
                      <p className="mb-0">{selectedOrder.notes || "No notes"}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <small className="text-muted">Placed On</small>
                      <p className="mb-0">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "N/A"}</p>
                    </div>
                  </div>

                  {/* Sample approval section */}
                  <div className="col-12">
                    <div className="p-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                      <h6 className="fw-bold mb-2" style={{ color: "var(--clothcore-blush)" }}>Sample</h6>
                      {sampleLoading ? (
                        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Loading sample...</p>
                      ) : !sample ? (
                        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>No sample has been created for this order yet.</p>
                      ) : (
                        <>
                          <span className={`admin-badge ${SAMPLE_STATUS_BADGE[sample.status] || "admin-badge-info"} mb-2`}>
                            {sample.status}
                          </span>

                          {sample.imageUrl && (
                            <div className="mt-2">
                              <a href={sample.imageUrl} target="_blank" rel="noreferrer" className="d-flex align-items-center gap-2" style={{ color: "var(--clothcore-blush)", fontSize: "13px" }}>
                                <Image size={14} /> View sample image
                              </a>
                            </div>
                          )}

                          {sample.notes && (
                            <p className="mt-2 mb-0" style={{ fontSize: "13px" }}>
                              <span className="text-muted">Production notes: </span>{sample.notes}
                            </p>
                          )}

                          {sample.shopComment && (
                            <p className="mt-2 mb-0" style={{ fontSize: "13px" }}>
                              <span className="text-muted">Your last comment: </span>{sample.shopComment}
                            </p>
                          )}

                          {sampleActionError && (
                            <div className="mt-2" style={{ fontSize: "13px", color: "var(--clothcore-danger)" }}>{sampleActionError}</div>
                          )}

                          {sample.status === "Awaiting Shop Approval" && (
                            <div className="mt-3">
                              <textarea
                                className="form-control admin-select mb-2"
                                rows={2}
                                placeholder="Optional comment (required if requesting a revision)"
                                value={sampleComment}
                                onChange={(e) => setSampleComment(e.target.value)}
                              />
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm px-3"
                                  style={{ background: "linear-gradient(135deg, #1a9c5f, #158a52)", color: "white", borderRadius: "8px", border: "none", fontWeight: 600 }}
                                  onClick={handleApproveSample}
                                  disabled={savingSampleAction}
                                >
                                  <CheckCircle size={14} className="me-1" /> Approve Sample
                                </button>
                                <button
                                  className="btn btn-sm px-3"
                                  style={{ background: "rgba(209,73,91,0.12)", color: "var(--clothcore-danger)", borderRadius: "8px", border: "none" }}
                                  onClick={handleRequestRevision}
                                  disabled={savingSampleAction}
                                >
                                  <ArrowRepeat size={14} className="me-1" /> Request Revision
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button
                  className="btn px-4"
                  onClick={() => setShowViewModal(false)}
                  style={{ borderRadius: "10px", background: "rgba(223,182,178,0.10)", color: "var(--clothcore-text-soft)" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ShopOwnerLayout>
  );
}

export default Orders;
