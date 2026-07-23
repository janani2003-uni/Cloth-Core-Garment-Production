// src/pages/Admin/AdminAccessCodes.js
// Admin-only management of the codes stored in MongoDB that let an existing
// account log in as Admin (see Login.js's "Login as Admin" toggle and
// backend/routes/adminAccessCodeRoutes.js). Codes are shown in plaintext
// here deliberately — this whole page is the access control for them.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ShieldLock, PlusCircle, Copy, Clock } from "react-bootstrap-icons";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/admin-codes";

function AdminAccessCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ code: "", label: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_URL);
      setCodes(res.data.data || []);
    } catch (err) {
      console.error("Fetch Admin Codes Error:", err);
      setError(err.response?.data?.message || "Could not load admin access codes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFormError("");
      await axios.post(API_URL, createForm);
      setShowCreateModal(false);
      setCreateForm({ code: "", label: "" });
      await fetchCodes();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not create the code.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (codeDoc) => {
    try {
      setBusyId(codeDoc._id);
      await axios.patch(`${API_URL}/${codeDoc._id}`, { isActive: !codeDoc.isActive });
      await fetchCodes();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update the code.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (codeDoc) => {
    if (!window.confirm(`Delete admin access code "${codeDoc.code}"? This cannot be undone.`)) return;
    try {
      setBusyId(codeDoc._id);
      await axios.delete(`${API_URL}/${codeDoc._id}`);
      await fetchCodes();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete the code.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldLock size={22} /> Admin Access Codes
          </h2>
          <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>
            Codes an existing account can enter at login (with their normal password) to become an Admin. Share these only with people you trust.
          </p>
        </div>
        <button className="admin-btn-primary" onClick={() => { setCreateForm({ code: "", label: "" }); setFormError(""); setShowCreateModal(true); }}>
          <PlusCircle size={16} /> New Code
        </button>
      </div>

      <div className="admin-content-card">
        <div className="table-responsive">
          <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Label</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Times Used</th>
                <th>Last Used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-5"><div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} /></td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="text-center py-5">
                  <div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div>
                  <button className="admin-btn-secondary" onClick={fetchCodes}>Retry</button>
                </td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={7} className="p-0">
                  <div className="admin-empty-state" style={{ border: "none", borderRadius: 0 }}>
                    <ShieldLock size={36} className="admin-empty-state-icon" />
                    <div className="admin-empty-state-title">No admin access codes yet</div>
                    <div className="admin-empty-state-message">Create one so a trusted account can log in as Admin.</div>
                  </div>
                </td></tr>
              ) : (
                codes.map((c) => {
                  const lastUse = c.usageHistory?.length ? c.usageHistory[c.usageHistory.length - 1] : null;
                  return (
                    <tr key={c._id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--clothcore-blush)", letterSpacing: "0.05em" }}>{c.code}</span>
                        <button
                          className="admin-link-btn"
                          style={{ marginLeft: "8px", padding: 0 }}
                          onClick={() => handleCopy(c.code)}
                          title="Copy code"
                        >
                          <Copy size={13} />
                        </button>
                      </td>
                      <td>{c.label || <span style={{ color: "var(--clothcore-text-muted)" }}>—</span>}</td>
                      <td>
                        <span className={`admin-badge ${c.isActive ? "admin-badge-success" : "admin-badge-danger"}`}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ color: "var(--clothcore-text-soft)" }}>
                        {c.createdBy ? `${c.createdBy.firstName} ${c.createdBy.lastName}` : "—"}
                      </td>
                      <td>{c.usageHistory?.length || 0}</td>
                      <td style={{ color: "var(--clothcore-text-soft)" }}>
                        {lastUse ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} /> {new Date(lastUse.usedAt).toLocaleString()}
                          </span>
                        ) : "Never"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="admin-link-btn"
                            disabled={busyId === c._id}
                            onClick={() => handleToggleActive(c)}
                          >
                            {c.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                          <button
                            className="admin-link-btn"
                            style={{ color: "var(--clothcore-danger)" }}
                            disabled={busyId === c._id}
                            onClick={() => handleDelete(c)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>New Admin Access Code</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body" style={{ padding: "20px 24px" }}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Code (optional — leave blank to auto-generate)</label>
                    <input
                      className="form-control admin-select"
                      style={{ fontFamily: "monospace" }}
                      placeholder="e.g. Q1-2026-ADMIN"
                      value={createForm.code}
                      onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Label (optional)</label>
                    <input
                      className="form-control admin-select"
                      placeholder="e.g. For the new operations lead"
                      value={createForm.label}
                      onChange={(e) => setCreateForm((f) => ({ ...f, label: e.target.value }))}
                    />
                  </div>
                  {formError && <div className="mt-3" style={{ color: "var(--clothcore-danger)", fontSize: "13px" }}>{formError}</div>}
                </div>
                <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                  <button type="button" className="admin-btn-secondary" onClick={() => setShowCreateModal(false)} disabled={saving}>Cancel</button>
                  <button type="submit" className="admin-btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Code"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminAccessCodes;
