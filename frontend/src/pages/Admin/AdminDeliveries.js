import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Truck,
  Clock,
  CheckCircle,
  Pencil,
  Box,
} from "react-bootstrap-icons";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/deliveries";
// Exactly three statuses — the backend enum (backend/models/Delivery.js)
// only accepts these three now.
const DELIVERY_STATUSES = ["Not Yet Delivered", "Delivery In Progress", "Delivered"];

function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setDeliveries(response.data || []);
    } catch (err) {
      console.error("Fetch Deliveries Error:", err);
      setError(err.response?.data?.message || "Could not load deliveries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const openEdit = (delivery) => {
    setEditingDelivery(delivery);
    setEditError("");
    setEditForm({
      deliveryStaffName: delivery.deliveryStaffName || "",
      // Defaults to whatever the shop owner asked for at order placement
      // (backend already fills this in when the delivery record is first
      // created) — editable here. Tracking number, Delivery Method and
      // Notes are no longer part of this popup at all — the system only
      // ever uses Factory Delivery, tracking numbers have been removed
      // everywhere in the UI, and this popup now focuses purely on the
      // delivery-status update action.
      address: delivery.address || delivery.orderId?.deliveryAddress || "",
      scheduledDate: delivery.scheduledDate ? delivery.scheduledDate.slice(0, 10) : "",
      status: delivery.status || "Not Yet Delivered",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setEditError("");
      await axios.put(`${API_URL}/${editingDelivery._id}`, editForm);
      setEditingDelivery(null);
      await fetchDeliveries();
    } catch (err) {
      setEditError(err.response?.data?.message || "Could not update delivery.");
    } finally {
      setSaving(false);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (d.orderId?.orderId || "").toLowerCase().includes(search) ||
      (d.orderId?.customerName || "").toLowerCase().includes(search);
    const matchesStatus = selectedStatus === "All Status" || d.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const delivered = deliveries.filter((d) => d.status === "Delivered").length;
  const inProgress = deliveries.filter((d) => d.status === "Delivery In Progress").length;
  const notYetDelivered = deliveries.filter((d) => d.status === "Not Yet Delivered").length;

  const stats = [
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" },
    { label: "Delivery In Progress", value: inProgress, icon: Truck, color: "var(--clothcore-purple)", bg: "rgba(82,43,91,0.1)" },
    { label: "Not Yet Delivered", value: notYetDelivered, icon: Clock, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
  ];

  const getStatusBadge = (status) => {
    if (status === "Delivered") return "admin-badge-success";
    if (status === "Delivery In Progress") return "admin-badge-accent";
    return "admin-badge-warning";
  };

  return (
    <AdminLayout>
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Deliveries</h2>
                <p className="admin-page-subtitle">
                  Track and update delivery status for all orders.
                </p>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className="col-xl-3 col-lg-6 col-md-6">
                  <div className="card admin-stat-card">
                    <div className="card-body">
                      <div className="admin-stat-icon mb-2" style={{ background: stat.bg, width: "40px", height: "40px" }}>
                        <stat.icon size={18} style={{ color: stat.color }} />
                      </div>
                      <div className="admin-stat-label">{stat.label}</div>
                      <div className="admin-stat-value" style={{ fontSize: "22px" }}>{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card admin-content-card">
              <div className="card-body">
                <div className="row g-2 mb-3">
                  <div className="col-md-8">
                    <div className="position-relative">
                      <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
                      <input
                        type="text"
                        className="form-control admin-select"
                        placeholder="Search by Order ID, Customer or Tracking Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: "36px", height: "38px" }}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select admin-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{ height: "38px" }}
                    >
                      {["All Status", ...DELIVERY_STATUSES].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Shop Owner</th>
                        <th>Delivery Details</th>
                        <th>Staff</th>
                        <th>Scheduled Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="text-center py-4">
                          <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                        </td></tr>
                      ) : error ? (
                        <tr><td colSpan={7} className="text-center py-4" style={{ color: "var(--clothcore-danger)" }}>{error}</td></tr>
                      ) : filteredDeliveries.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-5" style={{ color: "var(--clothcore-text-soft)" }}>
                          <Box size={40} className="mb-2" style={{ opacity: 0.3 }} />
                          <div>No delivery records found.</div>
                        </td></tr>
                      ) : (
                        filteredDeliveries.map((d) => (
                          <tr key={d._id}>
                            <td style={{ fontWeight: 600, color: "var(--clothcore-purple)" }}>{d.orderId?.orderId || "N/A"}</td>
                            <td>{d.orderId?.customerName || "N/A"}</td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>
                              {d.orderId?.item || "—"}{d.orderId?.quantity ? ` · ${d.orderId.quantity} pcs` : ""}
                              <div style={{ fontSize: "11px" }}>Factory Delivery</div>
                            </td>
                            <td>{d.deliveryStaffName || "Not assigned"}</td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>
                              {d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : "Not scheduled"}
                            </td>
                            <td><span className={`admin-badge ${getStatusBadge(d.status)}`}>{d.status}</span></td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                className="btn btn-sm"
                                style={{ background: "rgba(82,43,91,0.08)", borderRadius: "8px", border: "none", color: "var(--clothcore-purple)" }}
                                onClick={() => openEdit(d)}
                              >
                                <Pencil size={13} /> Update
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

      {editingDelivery && editForm && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <form onSubmit={handleSave}>
                <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                  <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-purple)" }}>
                    Update Delivery — {editingDelivery.orderId?.orderId}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => { setEditingDelivery(null); setEditError(""); }} />
                </div>
                <div className="modal-body" style={{ padding: "24px" }}>
                  {editError && (
                    <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "10px", background: "var(--clothcore-danger-bg)", color: "var(--clothcore-danger)", fontSize: "13px", fontWeight: 600 }}>
                      {editError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Delivery Staff Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.deliveryStaffName}
                      onChange={(e) => setEditForm({ ...editForm, deliveryStaffName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Delivery Address</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Scheduled Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editForm.scheduledDate}
                      onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      {DELIVERY_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                  <button type="button" className="btn px-4" onClick={() => { setEditingDelivery(null); setEditError(""); }} style={{ borderRadius: "10px", background: "var(--clothcore-peach)", color: "var(--clothcore-text-soft)" }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn px-4" disabled={saving} style={{ borderRadius: "10px", background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", border: "none" }}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDeliveries;
