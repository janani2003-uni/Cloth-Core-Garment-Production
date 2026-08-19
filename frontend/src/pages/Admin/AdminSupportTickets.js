import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, ChatDots, Clock, CheckCircle, XCircle, ArrowRepeat } from "react-bootstrap-icons";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/tickets";
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setTickets(response.data.data || []);
    } catch (err) {
      console.error("Fetch Tickets Error:", err);
      setError(err.response?.data?.message || "Could not load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicket = async (ticketId) => {
    try {
      const response = await axios.get(`${API_URL}/${ticketId}`);
      setActiveTicket(response.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Could not load this ticket.");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setReplying(true);
      const response = await axios.post(`${API_URL}/${activeTicket._id}/reply`, { message: replyText });
      setActiveTicket({ ...response.data.data, shopOwnerId: activeTicket.shopOwnerId });
      setReplyText("");
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Could not send reply.");
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.put(`${API_URL}/${activeTicket._id}/status`, { status });
      setActiveTicket({ ...response.data.data, shopOwnerId: activeTicket.shopOwnerId });
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (t.subject || "").toLowerCase().includes(search) ||
      (t.shopOwnerId?.firstName || "").toLowerCase().includes(search) ||
      (t.shopOwnerId?.lastName || "").toLowerCase().includes(search) ||
      (t.shopOwnerId?.shopName || "").toLowerCase().includes(search);
    const matchesStatus = selectedStatus === "All Status" || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    const styles = {
      Open: { badge: "admin-badge-warning", icon: Clock },
      "In Progress": { badge: "admin-badge-info", icon: ArrowRepeat },
      Resolved: { badge: "admin-badge-success", icon: CheckCircle },
      Closed: { badge: "admin-badge-danger", icon: XCircle },
    };
    return styles[status] || styles.Open;
  };

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <AdminLayout>
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Support Tickets</h2>
                <p className="admin-page-subtitle">Respond to issues raised by shop owners.</p>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {[
                { label: "Open", value: openCount, icon: Clock, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
                { label: "In Progress", value: inProgressCount, icon: ArrowRepeat, color: "var(--clothcore-purple)", bg: "rgba(82,43,91,0.1)" },
                { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" },
              ].map((stat) => (
                <div key={stat.label} className="col-xl-4 col-md-4">
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
                        placeholder="Search by subject or shop owner..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: "36px", height: "38px" }}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select className="form-select admin-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ height: "38px" }}>
                      {["All Status", ...STATUSES].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr><th>Subject</th><th>Shop Owner</th><th>Status</th><th>Last Updated</th><th></th></tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={5} className="text-center py-4"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></td></tr>
                      ) : error ? (
                        <tr><td colSpan={5} className="text-center py-4" style={{ color: "var(--clothcore-danger)" }}>{error}</td></tr>
                      ) : filteredTickets.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-5" style={{ color: "var(--clothcore-text-soft)" }}>
                          <ChatDots size={40} className="mb-2" style={{ opacity: 0.3 }} />
                          <div>No support tickets found.</div>
                        </td></tr>
                      ) : (
                        filteredTickets.map((t) => {
                          const style = getStatusStyle(t.status);
                          const StatusIcon = style.icon;
                          return (
                            <tr key={t._id} style={{ cursor: "pointer" }} onClick={() => openTicket(t._id)}>
                              <td style={{ fontWeight: 600 }}>{t.subject}</td>
                              <td>
                                {t.shopOwnerId ? `${t.shopOwnerId.firstName} ${t.shopOwnerId.lastName}` : "Unknown"}
                                <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)" }}>{t.shopOwnerId?.shopName}</div>
                              </td>
                              <td><span className={`admin-badge ${style.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><StatusIcon size={12} /> {t.status}</span></td>
                              <td style={{ color: "var(--clothcore-text-soft)" }}>{new Date(t.updatedAt).toLocaleString()}</td>
                              <td style={{ color: "var(--clothcore-purple)" }}>View →</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

      {activeTicket && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <div>
                  <h5 className="modal-title fw-bold mb-1" style={{ color: "var(--clothcore-purple)" }}>{activeTicket.subject}</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                    {activeTicket.shopOwnerId?.firstName} {activeTicket.shopOwnerId?.lastName} — {activeTicket.shopOwnerId?.shopName}
                  </p>
                </div>
                <button type="button" className="btn-close" onClick={() => setActiveTicket(null)} />
              </div>
              <div className="modal-body" style={{ padding: "24px", maxHeight: "50vh", overflowY: "auto" }}>
                <div className="p-3 mb-3" style={{ background: "var(--clothcore-peach)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
                    {activeTicket.shopOwnerId?.firstName} — {new Date(activeTicket.createdAt).toLocaleString()}
                  </div>
                  <div>{activeTicket.message}</div>
                </div>
                {activeTicket.replies.map((r, i) => (
                  <div key={i} className="p-3 mb-3" style={{
                    background: r.fromRole === "admin" ? "rgba(82,43,91,0.08)" : "var(--clothcore-peach)",
                    borderRadius: "12px",
                    marginLeft: r.fromRole === "admin" ? "24px" : "0",
                  }}>
                    <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
                      {r.fromRole === "admin" ? "You (Admin)" : activeTicket.shopOwnerId?.firstName} — {new Date(r.createdAt).toLocaleString()}
                    </div>
                    <div>{r.message}</div>
                  </div>
                ))}
              </div>
              <div className="modal-footer border-0 d-block" style={{ padding: "0 24px 24px" }}>
                <div className="d-flex gap-2 mb-3">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn btn-sm"
                      disabled={updatingStatus || activeTicket.status === s}
                      onClick={() => handleStatusChange(s)}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid var(--clothcore-border)",
                        background: activeTicket.status === s ? "var(--clothcore-mauve)" : "rgba(82,43,91,0.06)",
                        color: activeTicket.status === s ? "white" : "var(--clothcore-text)",
                        fontSize: "12px",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleReply} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                  <button type="submit" disabled={replying} className="btn px-4" style={{ borderRadius: "10px", background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", border: "none" }}>
                    {replying ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSupportTickets;
