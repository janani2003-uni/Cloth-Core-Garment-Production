// src/pages/SupervisorStaffManagement.js
// Staff roster management for Supervisor — same /api/staff endpoints as
// Admin's version, minus delete (kept Admin-only on the backend). Lets a
// Supervisor see and maintain the people they assign production work to
// without needing full Admin access.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Search, PersonPlus, PersonBadge, Eye, Pencil } from "react-bootstrap-icons";
import RoleLayout from "../components/RoleLayout";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

const API_URL = "http://localhost:5000/api/staff";

const DEPARTMENTS = ["Cutting", "Sewing", "Quality Control", "Finishing", "Maintenance", "Packing", "Stores", "Delivery", "Administration", "HR"];
const POSITIONS = ["Cutter", "Sewing Operator", "QC Inspector", "Finishing Operator", "Technician", "Packing Operator", "Store Keeper", "Driver", "Supervisor", "Manager", "Assistant"];

const EMPTY_FORM = { staffId: "", name: "", department: DEPARTMENTS[0], position: POSITIONS[0], phone: "", attendance: "Present", status: "Active" };

function SupervisorStaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [viewing, setViewing] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_URL);
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Staff Error:", err);
      setError(err.response?.data?.message || "Could not load staff.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = staff.filter((s) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      s.name?.toLowerCase().includes(term) ||
      s.staffId?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term) ||
      s.position?.toLowerCase().includes(term)
    );
  });

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!addForm.staffId.trim() || !addForm.name.trim() || !addForm.phone.trim()) {
      setFormError("Staff ID, name and phone are required.");
      return;
    }
    try {
      setSaving(true);
      setFormError("");
      await axios.post(API_URL, addForm);
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      await fetchStaff();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not add staff member.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (member) => {
    setEditing(member);
    setEditForm({ name: member.name, department: member.department, position: member.position, phone: member.phone, status: member.status });
    setFormError("");
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      setFormError("");
      await axios.put(`${API_URL}/${editing.staffId}`, editForm);
      setEditing(null);
      await fetchStaff();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not update staff member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "4px" }}>Staff Management</h2>
          <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>View and maintain the staff roster you assign production work to.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => { setAddForm(EMPTY_FORM); setFormError(""); setShowAddModal(true); }}>
          <PersonPlus size={16} /> Add Staff
        </button>
      </div>

      <div className="admin-content-card">
        <div style={{ padding: "20px 20px 0" }}>
          <div className="position-relative" style={{ maxWidth: "360px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
            <input
              type="text"
              className="form-control admin-select"
              placeholder="Search by name, ID, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>

        <div className="table-responsive" style={{ marginTop: "16px" }}>
          <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Phone</th>
                <th>Attendance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} /></td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="text-center py-5">
                  <div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div>
                  <button className="admin-btn-secondary" onClick={fetchStaff}>Retry</button>
                </td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={8} className="p-0">
                  <div className="admin-empty-state" style={{ border: "none", borderRadius: 0 }}>
                    <PersonBadge size={36} className="admin-empty-state-icon" />
                    <div className="admin-empty-state-title">No staff found</div>
                    <div className="admin-empty-state-message">{staff.length === 0 ? "Add your first staff member to get started." : "Try a different search."}</div>
                  </div>
                </td></tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600, color: "var(--clothcore-blush)" }}>{s.staffId}</td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.position}</td>
                    <td>{s.phone}</td>
                    <td><span className={`admin-badge ${s.attendance === "Present" ? "admin-badge-success" : s.attendance === "On Leave" ? "admin-badge-warning" : "admin-badge-danger"}`}>{s.attendance}</span></td>
                    <td><span className={`admin-badge ${s.status === "Active" ? "admin-badge-success" : "admin-badge-danger"}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="admin-link-btn" onClick={() => setViewing(s)}><Eye size={14} /></button>
                        <button className="admin-link-btn" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>Add Staff Member</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} />
              </div>
              <form onSubmit={handleAddStaff}>
                <div className="modal-body" style={{ padding: "20px 24px" }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Staff ID</label>
                      <input className="form-control admin-select" value={addForm.staffId} onChange={(e) => setAddForm((f) => ({ ...f, staffId: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Full Name</label>
                      <input className="form-control admin-select" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Department</label>
                      <select className="form-select admin-select" value={addForm.department} onChange={(e) => setAddForm((f) => ({ ...f, department: e.target.value }))}>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Position</label>
                      <select className="form-select admin-select" value={addForm.position} onChange={(e) => setAddForm((f) => ({ ...f, position: e.target.value }))}>
                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Phone</label>
                      <input className="form-control admin-select" value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} />
                    </div>
                  </div>
                  {formError && <div className="mt-3" style={{ color: "var(--clothcore-danger)", fontSize: "13px" }}>{formError}</div>}
                </div>
                <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                  <button type="button" className="admin-btn-secondary" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
                  <button type="submit" className="admin-btn-primary" disabled={saving}>{saving ? "Saving..." : "Add Staff"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editing && editForm && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>Edit {editing.name}</h5>
                <button type="button" className="btn-close" onClick={() => setEditing(null)} />
              </div>
              <div className="modal-body" style={{ padding: "20px 24px" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Full Name</label>
                    <input className="form-control admin-select" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Phone</label>
                    <input className="form-control admin-select" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Department</label>
                    <select className="form-select admin-select" value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Position</label>
                    <select className="form-select admin-select" value={editForm.position} onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}>
                      {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Status</label>
                    <select className="form-select admin-select" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                {formError && <div className="mt-3" style={{ color: "var(--clothcore-danger)", fontSize: "13px" }}>{formError}</div>}
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
                <button type="button" className="admin-btn-primary" onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {viewing && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }} onClick={() => setViewing(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>{viewing.name}</h5>
                <button type="button" className="btn-close" onClick={() => setViewing(null)} />
              </div>
              <div className="modal-body" style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Staff ID</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.staffId}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Phone</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.phone}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Department</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.department}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Position</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.position}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Attendance</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.attendance}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Status</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.status}</div></div>
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setViewing(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}

export default SupervisorStaffManagement;
