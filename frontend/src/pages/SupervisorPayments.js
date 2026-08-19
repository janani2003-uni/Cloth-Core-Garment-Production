// src/pages/SupervisorPayments.js
// View-only payment monitoring for Supervisor — no verify/reject/amount
// edit capability (Admin remains solely responsible for that). Supervisor
// can add an internal note and flag a payment for Admin attention.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Search, CreditCard, X, FlagFill } from "react-bootstrap-icons";
import RoleLayout from "../components/RoleLayout";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

const UPLOAD_BASE_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api/payments";
const STATUS_OPTIONS = ["All Status", "Submitted", "Verified", "Rejected"];
const STAGE_OPTIONS = ["All Stages", "Advance", "Final"];

function getStatusBadgeClass(status) {
  const map = { Submitted: "admin-badge-warning", Verified: "admin-badge-success", Rejected: "admin-badge-danger" };
  return map[status] || "admin-badge-warning";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "N/A";
  }
}

function SupervisorPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [selected, setSelected] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [flagDraft, setFlagDraft] = useState(false);
  const [flagReasonDraft, setFlagReasonDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_URL);
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Payments Error:", err);
      setError(err.response?.data?.message || "Could not load payments.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const term = searchTerm.trim().toLowerCase();
  const filtered = payments.filter((p) => {
    const matchesSearch =
      !term ||
      p._id?.toLowerCase().includes(term) ||
      p.orderId?.orderId?.toLowerCase().includes(term) ||
      p.orderId?.customerName?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
    const matchesStage = stageFilter === "All Stages" || p.stage === stageFilter;
    return matchesSearch && matchesStatus && matchesStage;
  });

  const openDetails = (payment) => {
    setActionError("");
    setSelected(payment);
    setNoteDraft(payment.supervisorNote || "");
    setFlagDraft(!!payment.flaggedForReview);
    setFlagReasonDraft(payment.flaggedReason || "");
  };

  const saveNote = async () => {
    try {
      setSaving(true);
      setActionError("");
      await axios.put(`${API_URL}/${selected._id}/note`, {
        note: noteDraft,
        flagged: flagDraft,
        flaggedReason: flagDraft ? flagReasonDraft : "",
      });
      setSelected(null);
      await fetchPayments();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not save note.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Payments</h2>
          <p className="admin-page-subtitle">
            Monitor customer payments. Final verification stays with Admin — flag anything that needs their attention.
          </p>
        </div>
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
                  placeholder="Search by payment ID, order ID or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select admin-select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                {STAGE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
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
                <th>Stage</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} /></td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="text-center py-5"><div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div><button className="admin-btn-secondary" onClick={fetchPayments}>Retry</button></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <div className="admin-empty-state" style={{ border: "none", borderRadius: 0 }}>
                      <CreditCard size={36} className="admin-empty-state-icon" />
                      <div className="admin-empty-state-title">No payments found</div>
                      <div className="admin-empty-state-message">
                        {payments.length === 0 ? "Submitted payments will appear here." : "Try adjusting your search or filters."}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: "var(--clothcore-purple)" }}>{p.orderId?.orderId || "N/A"}</td>
                    <td>{p.orderId?.customerName || "N/A"}</td>
                    <td>{p.stage || "N/A"}</td>
                    <td>LKR {Number(p.amount).toLocaleString()}</td>
                    <td>{p.paymentMethod}</td>
                    <td style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className={`admin-badge ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                      {p.flaggedForReview && <FlagFill size={13} style={{ color: "var(--clothcore-danger)" }} title="Flagged for review" />}
                    </td>
                    <td style={{ color: "var(--clothcore-text-soft)" }}>{formatDate(p.createdAt)}</td>
                    <td><button className="admin-link-btn" onClick={() => openDetails(p)}>View</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: "16px" }} onClick={() => !saving && setSelected(null)}>
          <div style={{ background: "var(--clothcore-card)", border: "1px solid var(--clothcore-border-strong)", borderRadius: "18px", boxShadow: "0 24px 60px rgba(0,0,0,0.32)", maxWidth: "480px", width: "100%", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--clothcore-text)" }}>{selected.orderId?.orderId}</div>
                <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>{selected.orderId?.customerName} · {selected.orderId?.customerEmail}</div>
              </div>
              <button onClick={() => !saving && setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--clothcore-text-soft)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px", marginBottom: "16px" }}>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Garment</div><div style={{ color: "var(--clothcore-text)" }}>{selected.orderId?.item || "N/A"}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Order Total</div><div style={{ color: "var(--clothcore-text)" }}>LKR {Number(selected.orderId?.totalAmount || 0).toLocaleString()}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Payment Stage</div><div style={{ color: "var(--clothcore-text)" }}>{selected.stage}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Amount Paid</div><div style={{ color: "var(--clothcore-text)" }}>LKR {Number(selected.amount).toLocaleString()}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Method</div><div style={{ color: "var(--clothcore-text)" }}>{selected.paymentMethod}{selected.cardLast4 ? ` (•••• ${selected.cardLast4})` : ""}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Status</div><span className={`admin-badge ${getStatusBadgeClass(selected.status)}`}>{selected.status}</span></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Submitted</div><div style={{ color: "var(--clothcore-text)" }}>{formatDate(selected.createdAt)}</div></div>
              {selected.verifiedAt && (
                <div><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Verified</div><div style={{ color: "var(--clothcore-text)" }}>{formatDate(selected.verifiedAt)}</div></div>
              )}
              {selected.rejectionReason && (
                <div style={{ gridColumn: "1 / -1" }}><div style={{ color: "var(--clothcore-text-muted)", marginBottom: "2px" }}>Rejection Reason</div><div style={{ color: "var(--clothcore-danger)" }}>{selected.rejectionReason}</div></div>
              )}
              {selected.proofFile && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <a href={`${UPLOAD_BASE_URL}${selected.proofFile}`} target="_blank" rel="noreferrer" className="admin-link-btn">View Payment Proof</a>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--clothcore-border)", paddingTop: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Internal Note</label>
              <textarea className="form-control admin-select" rows={3} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a note visible to Admin and other Supervisors..." />

              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", fontSize: "13px", color: "var(--clothcore-text)", cursor: "pointer" }}>
                <input type="checkbox" checked={flagDraft} onChange={(e) => setFlagDraft(e.target.checked)} />
                Flag this payment for Admin review
              </label>

              {flagDraft && (
                <input
                  className="form-control admin-select"
                  style={{ marginTop: "8px" }}
                  placeholder="Reason for flagging..."
                  value={flagReasonDraft}
                  onChange={(e) => setFlagReasonDraft(e.target.value)}
                />
              )}

              {actionError && <div style={{ color: "var(--clothcore-danger)", fontSize: "12px", marginTop: "8px" }}>{actionError}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button className="admin-btn-secondary" onClick={() => setSelected(null)} disabled={saving}>Cancel</button>
                <button className="admin-btn-primary" onClick={saveNote} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}

export default SupervisorPayments;
