// src/components/RoleDeliveriesView.js
// Deliveries view for Supervisor (full management: schedule, assign,
// reschedule, any status). The canManage=false branch is unused now that
// the Staff role has been removed, but left in place rather than torn out.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Search, TruckFront, X } from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/deliveries";
// Exactly three statuses — the backend enum (backend/models/Delivery.js)
// only accepts these three now.
const ALL_STATUSES = ["Not Yet Delivered", "Delivery In Progress", "Delivered"];
const STAFF_STATUSES = ["Not Yet Delivered", "Delivery In Progress", "Delivered"];

function getStatusBadgeClass(status) {
  const map = {
    "Not Yet Delivered": "admin-badge-warning",
    "Delivery In Progress": "admin-badge-info",
    Delivered: "admin-badge-success",
  };
  return map[status] || "admin-badge-info";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "N/A";
  }
}

function RoleDeliveriesView({ heading, subtitle, canManage }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_URL);
      setDeliveries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Deliveries Error:", err);
      setError(err.response?.data?.message || "Could not load deliveries.");
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const term = searchTerm.trim().toLowerCase();
  const filtered = deliveries.filter((d) => {
    const matchesSearch =
      !term ||
      d.orderId?.orderId?.toLowerCase().includes(term) ||
      d.orderId?.customerName?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "All Status" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openEdit = (delivery) => {
    setActionError("");
    setEditing(delivery);
    setForm({
      deliveryStaffName: delivery.deliveryStaffName || "",
      // Defaults to whatever the shop owner asked for at order placement
      // (backend already fills this in when the delivery record is first
      // created) — editable here. Tracking number, Delivery Method and
      // Notes are no longer part of this popup — it now focuses purely on
      // the delivery-status update action, matching the Admin version.
      address: delivery.address || delivery.orderId?.deliveryAddress || "",
      scheduledDate: delivery.scheduledDate ? delivery.scheduledDate.slice(0, 10) : "",
      status: delivery.status,
    });
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      setActionError("");
      await axios.put(`${API_URL}/${editing._id}`, form);
      setEditing(null);
      await fetchDeliveries();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not update delivery.");
    } finally {
      setSaving(false);
    }
  };

  const quickStatusUpdate = async (delivery, status) => {
    try {
      setActionError("");
      await axios.patch(`${API_URL}/${delivery._id}/status`, { status });
      await fetchDeliveries();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not update delivery status.");
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">{heading}</h2>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>
      </div>

      {actionError && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", background: "var(--clothcore-danger-bg)", color: "var(--clothcore-danger)", fontSize: "13px" }}>
          {actionError}
        </div>
      )}

      <div className="admin-content-card">
        <div style={{ padding: "20px 20px 0" }}>
          <div className="row g-2 mb-3">
            <div className="col-md-8">
              <div className="position-relative">
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
                <input
                  type="text"
                  className="form-control admin-select"
                  placeholder="Search by order ID, shop or tracking number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All Status</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Shop Owner</th>
                <th>Garment</th>
                <th>Scheduled</th>
                <th>Assigned Staff</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Last Update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-5"><div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} /></td></tr>
              ) : error ? (
                <tr><td colSpan={9} className="text-center py-5"><div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div><button className="admin-btn-secondary" onClick={fetchDeliveries}>Retry</button></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <div className="admin-empty-state" style={{ border: "none", borderRadius: 0 }}>
                      <TruckFront size={36} className="admin-empty-state-icon" />
                      <div className="admin-empty-state-title">No deliveries found</div>
                      <div className="admin-empty-state-message">
                        {deliveries.length === 0 ? "Delivery records will appear here once production is complete." : "Try adjusting your search or filters."}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600, color: "var(--clothcore-purple)" }}>{d.orderId?.orderId || "N/A"}</td>
                    <td>{d.orderId?.customerName || "N/A"}</td>
                    <td>{d.orderId?.item || "N/A"}{d.orderId?.quantity ? ` (${d.orderId.quantity})` : ""}</td>
                    <td>{formatDate(d.scheduledDate)}</td>
                    <td>{d.deliveryStaffName || "Unassigned"}</td>
                    <td><span className={`admin-badge ${getStatusBadgeClass(d.status)}`}>{d.status}</span></td>
                    <td><span className={`admin-badge ${d.orderId?.paymentStatus === "Paid" ? "admin-badge-success" : "admin-badge-warning"}`}>{d.orderId?.paymentStatus || "N/A"}</span></td>
                    <td style={{ color: "var(--clothcore-text-soft)" }}>{formatDate(d.updatedAt)}</td>
                    <td>
                      {canManage ? (
                        <button className="admin-link-btn" onClick={() => openEdit(d)}>Manage</button>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {STAFF_STATUSES.filter((s) => s !== d.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => quickStatusUpdate(d, s)}
                              className="admin-btn-secondary"
                              style={{ padding: "3px 8px", fontSize: "11px" }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: "16px" }} onClick={() => !saving && setEditing(null)}>
          <div style={{ background: "var(--clothcore-card)", border: "1px solid var(--clothcore-border-strong)", borderRadius: "18px", boxShadow: "0 24px 60px rgba(0,0,0,0.32)", maxWidth: "440px", width: "100%", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--clothcore-text)" }}>Manage Delivery</div>
                <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>{editing.orderId?.orderId}</div>
              </div>
              <button onClick={() => !saving && setEditing(null)} style={{ background: "transparent", border: "none", color: "var(--clothcore-text-soft)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Assigned Delivery Staff</label>
                <input className="form-control admin-select" value={form.deliveryStaffName} onChange={(e) => setForm((f) => ({ ...f, deliveryStaffName: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Delivery Address</label>
                <textarea className="form-control admin-select" rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Scheduled Date</label>
                <input type="date" className="form-control admin-select" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Status</label>
                <select className="form-select admin-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button className="admin-btn-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button className="admin-btn-primary" onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoleDeliveriesView;
