import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Check,
  X,
  Search,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Wallet2,
} from "react-bootstrap-icons";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/payments";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [busyId, setBusyId] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setPayments(response.data || []);
    } catch (err) {
      console.error("Fetch Payments Error:", err);
      setError(err.response?.data?.message || "Could not load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (payment) => {
    if (!window.confirm(`Verify payment of Rs. ${payment.amount} for order ${payment.orderId?.orderId || ""}?`)) return;
    try {
      setBusyId(payment._id);
      await axios.put(`${API_URL}/${payment._id}/verify`);
      await fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Could not verify payment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (payment) => {
    const reason = window.prompt("Reason for rejecting this payment:");
    if (reason === null) return;
    try {
      setBusyId(payment._id);
      await axios.put(`${API_URL}/${payment._id}/reject`, { reason });
      await fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Could not reject payment.");
    } finally {
      setBusyId(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (p.orderId?.orderId || "").toLowerCase().includes(search) ||
      (p.orderId?.customerName || "").toLowerCase().includes(search) ||
      (p.transactionReference || "").toLowerCase().includes(search);
    const matchesStatus = selectedStatus === "All Status" || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalVerified = payments
    .filter((p) => p.status === "Verified")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalSubmitted = payments
    .filter((p) => p.status === "Submitted")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const submittedCount = payments.filter((p) => p.status === "Submitted").length;
  const rejectedCount = payments.filter((p) => p.status === "Rejected").length;

  const stats = [
    { label: "Verified (Total)", value: `LKR ${totalVerified.toLocaleString()}`, icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" },
    { label: "Awaiting Verification", value: `LKR ${totalSubmitted.toLocaleString()}`, icon: Clock, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
    { label: "Submitted Payments", value: submittedCount, icon: Wallet2, color: "var(--clothcore-blush)", bg: "rgba(82,43,91,0.1)" },
    { label: "Rejected Payments", value: rejectedCount, icon: XCircle, color: "var(--clothcore-danger)", bg: "var(--clothcore-danger-bg)" },
  ];

  const getStatusBadge = (status) => {
    if (status === "Verified") return "admin-badge-success";
    if (status === "Rejected") return "admin-badge-danger";
    return "admin-badge-warning";
  };

  return (
    <AdminLayout>
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Payments</h2>
                <p className="admin-page-subtitle">
                  Review payment submissions from all shops, verify or reject them.
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
                        placeholder="Search by Order ID, Customer or Reference..."
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
                      {["All Status", "Submitted", "Verified", "Rejected"].map((s) => (
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
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={9} className="text-center py-4">
                          <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                        </td></tr>
                      ) : error ? (
                        <tr><td colSpan={9} className="text-center py-4" style={{ color: "var(--clothcore-danger)" }}>{error}</td></tr>
                      ) : filteredPayments.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-5" style={{ color: "var(--clothcore-text-soft)" }}>
                          <CreditCard size={40} className="mb-2" style={{ opacity: 0.3 }} />
                          <div>No payments found.</div>
                        </td></tr>
                      ) : (
                        filteredPayments.map((p) => (
                          <tr key={p._id}>
                            <td style={{ fontWeight: 600, color: "var(--clothcore-blush)" }}>{p.orderId?.orderId || "N/A"}</td>
                            <td>{p.orderId?.customerName || "N/A"}</td>
                            <td>{p.paymentType}</td>
                            <td>{p.paymentMethod}</td>
                            <td style={{ fontWeight: 600 }}>LKR {Number(p.amount || 0).toLocaleString()}</td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>{p.transactionReference || "N/A"}</td>
                            <td>
                              <span className={`admin-badge ${getStatusBadge(p.status)}`}>{p.status}</span>
                              {p.status === "Rejected" && p.rejectionReason && (
                                <div style={{ fontSize: "11px", color: "var(--clothcore-danger)" }}>{p.rejectionReason}</div>
                              )}
                            </td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {p.status === "Submitted" ? (
                                <div className="d-flex gap-1 justify-content-center">
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "linear-gradient(135deg, #1a9c5f, #158a52)", color: "white", borderRadius: "8px", border: "none", fontWeight: 600 }}
                                    disabled={busyId === p._id}
                                    onClick={() => handleVerify(p)}
                                  >
                                    <Check size={13} /> Verify
                                  </button>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "linear-gradient(135deg, #d1495b, #b83d4d)", color: "white", borderRadius: "8px", border: "none", fontWeight: 600 }}
                                    disabled={busyId === p._id}
                                    onClick={() => handleReject(p)}
                                  >
                                    <X size={13} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
                                  {p.status === "Verified" ? "Verified" : "Rejected"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
    </AdminLayout>
  );
}

export default AdminPayments;
