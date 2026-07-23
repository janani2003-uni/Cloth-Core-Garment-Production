// src/components/RoleOrdersView.js
// Read-only order-monitoring view for Supervisor — order visibility
// (search/filter/details); the actual production-stage-update workflow
// lives on the Dashboard (ProductionOverviewDashboard), not here, so this
// stays a pure browser.
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Search, ChevronLeft, ChevronRight, Clipboard, X, Image } from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/orders";
const SAMPLES_API_URL = "http://localhost:5000/api/samples";
const ORDERS_PER_PAGE = 8;
const STATUS_OPTIONS = ["All Status", "Pending", "Approved", "Production", "Delivered", "Cancelled"];

function getStatusBadgeClass(status) {
  const map = {
    Pending: "admin-badge-warning",
    Approved: "admin-badge-info",
    Production: "admin-badge-info",
    Delivered: "admin-badge-success",
    Cancelled: "admin-badge-danger",
  };
  return map[status] || "admin-badge-info";
}

function getPaymentBadgeClass(paymentStatus) {
  const map = {
    Pending: "admin-badge-warning",
    Partial: "admin-badge-info",
    Paid: "admin-badge-success",
  };
  return map[paymentStatus] || "admin-badge-warning";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "N/A";
  }
}

function RoleOrdersView({ heading, subtitle, canManageSample }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [sample, setSample] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleForm, setSampleForm] = useState({ imageUrl: "", notes: "", status: "Preparing" });
  const [savingSample, setSavingSample] = useState(false);
  const [sampleError, setSampleError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_URL);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      setError(err.response?.data?.message || "Could not load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.orderId?.toLowerCase().includes(term) ||
        order.customerName?.toLowerCase().includes(term) ||
        order.item?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "All Status" || order.status === statusFilter;
      const matchesDate = !dateFilter || (order.deliveryDate && order.deliveryDate.slice(0, 10) === dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const pageStart = (currentPage - 1) * ORDERS_PER_PAGE;
  const pageOrders = filteredOrders.slice(pageStart, pageStart + ORDERS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const openOrder = async (order) => {
    setSelectedOrder(order);
    if (!canManageSample) return;
    setSample(null);
    setSampleError("");
    setSampleLoading(true);
    try {
      const res = await axios.get(`${SAMPLES_API_URL}/order/${order._id}`);
      setSample(res.data);
      setSampleForm({ imageUrl: res.data.imageUrl || "", notes: res.data.notes || "", status: res.data.status });
    } catch (err) {
      setSample(null);
      setSampleForm({ imageUrl: "", notes: "", status: "Preparing" });
    } finally {
      setSampleLoading(false);
    }
  };

  const handleSaveSample = async () => {
    if (!selectedOrder) return;
    try {
      setSavingSample(true);
      setSampleError("");
      if (sample) {
        const res = await axios.put(`${SAMPLES_API_URL}/${sample._id}`, sampleForm);
        setSample(res.data.sample);
      } else {
        const res = await axios.post(SAMPLES_API_URL, { orderId: selectedOrder._id, ...sampleForm });
        setSample(res.data.sample);
      }
    } catch (err) {
      setSampleError(err.response?.data?.message || "Could not save the sample.");
    } finally {
      setSavingSample(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "4px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>{subtitle}</p>
      </div>

      <div className="admin-content-card">
        <div style={{ padding: "20px 20px 0" }}>
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <div className="position-relative">
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
                <input
                  type="text"
                  className="form-control admin-select"
                  placeholder="Search by order ID, shop or garment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control admin-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                title="Filter by required delivery date"
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Shop / Customer</th>
                <th>Garment</th>
                <th>Qty</th>
                <th>Order Date</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="text-center py-5">
                    <div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div>
                    <button className="admin-btn-secondary" onClick={fetchOrders}>Retry</button>
                  </td>
                </tr>
              ) : pageOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-0">
                    <div className="admin-empty-state" style={{ border: "none", borderRadius: 0 }}>
                      <Clipboard size={36} className="admin-empty-state-icon" />
                      <div className="admin-empty-state-title">No orders found</div>
                      <div className="admin-empty-state-message">
                        {orders.length === 0 ? "Orders will appear here once shops start placing them." : "Try adjusting your search or filters."}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pageOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, color: "var(--clothcore-blush)" }}>{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td>{order.item}</td>
                    <td>{order.quantity}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatDate(order.deliveryDate)}</td>
                    <td><span className={`admin-badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "50px", height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{ width: `${order.progress || 0}%`, height: "100%", background: "var(--clothcore-mauve)" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--clothcore-text-soft)" }}>{order.progress || 0}%</span>
                      </div>
                    </td>
                    <td><span className={`admin-badge ${getPaymentBadgeClass(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                    <td>
                      <button className="admin-link-btn" onClick={() => openOrder(order)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && filteredOrders.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <span style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>
              Showing {pageStart + 1}–{Math.min(pageStart + ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="admin-btn-secondary" style={{ padding: "6px 10px" }} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: "13px", color: "var(--clothcore-text)", alignSelf: "center" }}>{currentPage} / {totalPages}</span>
              <button className="admin-btn-secondary" style={{ padding: "6px 10px" }} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: "16px" }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{ background: "var(--clothcore-card)", border: "1px solid var(--clothcore-border-strong)", borderRadius: "18px", boxShadow: "0 24px 60px rgba(0,0,0,0.32)", maxWidth: "480px", width: "100%", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--clothcore-text)" }}>{selectedOrder.orderId}</div>
                <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>{selectedOrder.customerName}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "transparent", border: "none", color: "var(--clothcore-text-soft)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Garment</div><div style={{ color: "var(--clothcore-text)" }}>{selectedOrder.item}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Quantity</div><div style={{ color: "var(--clothcore-text)" }}>{selectedOrder.quantity}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Order Date</div><div style={{ color: "var(--clothcore-text)" }}>{formatDate(selectedOrder.createdAt)}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Delivery Date</div><div style={{ color: "var(--clothcore-text)" }}>{formatDate(selectedOrder.deliveryDate)}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Status</div><span className={`admin-badge ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Payment</div><span className={`admin-badge ${getPaymentBadgeClass(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Progress</div><div style={{ color: "var(--clothcore-text)" }}>{selectedOrder.progress || 0}%</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Customer Email</div><div style={{ color: selectedOrder.customerEmail ? "var(--clothcore-text)" : "var(--clothcore-text-muted)", fontStyle: selectedOrder.customerEmail ? "normal" : "italic" }}>{selectedOrder.customerEmail || "Legacy order data incomplete"}</div></div>
            </div>

            {selectedOrder.notes && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--clothcore-border)" }}>
                <div style={{ color: "var(--clothcore-text-muted)", fontSize: "12px", marginBottom: "4px" }}>Notes</div>
                <div style={{ color: "var(--clothcore-text-soft)", fontSize: "13px" }}>{selectedOrder.notes}</div>
              </div>
            )}

            {canManageSample && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--clothcore-border)" }}>
                <div style={{ color: "var(--clothcore-text-muted)", fontSize: "12px", marginBottom: "8px" }}>Sample</div>
                {sampleLoading ? (
                  <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>Loading...</div>
                ) : (
                  <>
                    {sample?.imageUrl && (
                      <a href={sample.imageUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--clothcore-blush)", fontSize: "13px", marginBottom: "8px" }}>
                        <Image size={14} /> View current sample image
                      </a>
                    )}
                    <input
                      type="text"
                      className="form-control admin-select mb-2"
                      placeholder="Sample image URL (optional)"
                      value={sampleForm.imageUrl}
                      onChange={(e) => setSampleForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    />
                    <textarea
                      className="form-control admin-select mb-2"
                      rows={2}
                      placeholder="Notes for the shop owner"
                      value={sampleForm.notes}
                      onChange={(e) => setSampleForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                    {sample && (
                      <select
                        className="form-select admin-select mb-2"
                        value={sampleForm.status}
                        onChange={(e) => setSampleForm((f) => ({ ...f, status: e.target.value }))}
                      >
                        {["Preparing", "Awaiting Shop Approval", "Approved", "Revision Requested"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                    {sampleError && (
                      <div style={{ fontSize: "12.5px", color: "var(--clothcore-danger)", marginBottom: "8px" }}>{sampleError}</div>
                    )}
                    <button className="admin-btn-primary" style={{ padding: "6px 16px", fontSize: "13px" }} onClick={handleSaveSample} disabled={savingSample}>
                      {savingSample ? "Saving..." : sample ? "Update Sample" : "Create Sample (mark ready for review)"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default RoleOrdersView;
