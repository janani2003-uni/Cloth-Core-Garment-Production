import React, { useEffect, useState } from "react";
import axios from "axios";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import {
  Plus,
  ChatDots,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRepeat,
} from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/tickets";

function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/mine`);
      setTickets(response.data.data || []);
    } catch (err) {
      console.error("Fetch Tickets Error:", err);
      setError(err.response?.data?.message || "Could not load your support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.post(API_URL, { subject: newSubject, message: newMessage });
      setShowNewModal(false);
      setNewSubject("");
      setNewMessage("");
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit your ticket.");
    } finally {
      setSubmitting(false);
    }
  };

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
      setActiveTicket(response.data.data);
      setReplyText("");
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Could not send your reply.");
    } finally {
      setReplying(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Open: { badge: "admin-badge-warning", icon: Clock },
      "In Progress": { badge: "admin-badge-info", icon: ArrowRepeat },
      Resolved: { badge: "admin-badge-success", icon: CheckCircle },
      Closed: { badge: "admin-badge-danger", icon: XCircle },
    };
    return styles[status] || styles.Open;
  };

  return (
    <ShopOwnerLayout>
          <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center mb-4 gap-3">
            <div>
              <h1 className="fw-bold" style={{ fontSize: "28px", color: "var(--clothcore-text)" }}>Support</h1>
              <p className="text-muted mb-0" style={{ fontSize: "15px" }}>Raise an issue and track responses from our team</p>
            </div>
            <button
              className="btn fw-bold px-4 py-2"
              style={{ background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", borderRadius: "12px", border: "none", display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => setShowNewModal(true)}
            >
              <Plus size={18} /> New Ticket
            </button>
          </div>

          <div className="card admin-content-card" style={{ borderRadius: "20px", boxShadow: "var(--clothcore-shadow-hover)", overflow: "hidden" }}>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px" }}>
                  <thead style={{ background: "rgba(255,255,255,0.04)", borderBottom: "2px solid var(--clothcore-border)" }}>
                    <tr>
                      {["Subject", "Status", "Last Updated", ""].map((h) => (
                        <th key={h} className="px-4 py-3 fw-bold" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">Loading...</td></tr>
                    ) : error ? (
                      <tr><td colSpan="4" className="text-center py-4" style={{ color: "var(--clothcore-danger)" }}>{error}</td></tr>
                    ) : tickets.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-5">
                        <div style={{ color: "var(--clothcore-text-soft)" }}>
                          <ChatDots size={40} style={{ opacity: 0.3 }} />
                          <div className="mt-2">No support tickets yet</div>
                        </div>
                      </td></tr>
                    ) : (
                      tickets.map((t) => {
                        const style = getStatusStyle(t.status);
                        const StatusIcon = style.icon;
                        return (
                          <tr key={t._id} style={{ cursor: "pointer" }} onClick={() => openTicket(t._id)}>
                            <td className="px-4 py-3 fw-medium">{t.subject}</td>
                            <td className="px-4 py-3">
                              <span className={`admin-badge ${style.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <StatusIcon size={12} /> {t.status}
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--clothcore-text-soft)" }}>
                              {new Date(t.updatedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-end" style={{ color: "var(--clothcore-blush)", fontSize: "13px" }}>View →</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <form onSubmit={handleCreateTicket}>
                <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                  <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>New Support Ticket</h5>
                  <button type="button" className="btn-close" onClick={() => setShowNewModal(false)} />
                </div>
                <div className="modal-body" style={{ padding: "24px" }}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Subject</label>
                    <input type="text" className="form-control" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} required />
                  </div>
                  <div className="mb-0">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea className="form-control" rows="4" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} required />
                  </div>
                </div>
                <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                  <button type="button" className="btn px-4" onClick={() => setShowNewModal(false)} style={{ borderRadius: "10px", background: "rgba(223,182,178,0.10)", color: "var(--clothcore-text-soft)" }}>Cancel</button>
                  <button type="submit" className="btn px-4" disabled={submitting} style={{ borderRadius: "10px", background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", border: "none" }}>
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Thread Modal */}
      {activeTicket && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>{activeTicket.subject}</h5>
                <button type="button" className="btn-close" onClick={() => setActiveTicket(null)} />
              </div>
              <div className="modal-body" style={{ padding: "24px", maxHeight: "60vh", overflowY: "auto" }}>
                <div className="p-3 mb-3" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>You — {new Date(activeTicket.createdAt).toLocaleString()}</div>
                  <div>{activeTicket.message}</div>
                </div>
                {activeTicket.replies.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 mb-3"
                    style={{
                      background: r.fromRole === "admin" ? "rgba(82,43,91,0.16)" : "rgba(223,182,178,0.10)",
                      borderRadius: "12px",
                      marginLeft: r.fromRole === "admin" ? "24px" : "0",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
                      {r.fromRole === "admin" ? "ClothCore Support" : "You"} — {new Date(r.createdAt).toLocaleString()}
                    </div>
                    <div>{r.message}</div>
                  </div>
                ))}
              </div>
              <div className="modal-footer border-0 d-block" style={{ padding: "0 24px 24px" }}>
                {activeTicket.status === "Closed" ? (
                  <p className="text-muted mb-0" style={{ fontSize: "13px" }}>This ticket is closed.</p>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ShopOwnerLayout>
  );
}

export default Support;
