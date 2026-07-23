import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, ClockHistory, Person } from "react-bootstrap-icons";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/activity-logs";

const TARGET_TYPES = ["All Types", "Order", "Payment", "Shop", "Staff", "Inventory", "Production", "Delivery", "User"];

function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (selectedType !== "All Types") params.targetType = selectedType;
      const response = await axios.get(API_URL, { params });
      setLogs(response.data.data || []);
    } catch (err) {
      console.error("Fetch Activity Logs Error:", err);
      setError(err.response?.data?.message || "Could not load activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      (log.message || "").toLowerCase().includes(search) ||
      (log.actorName || "").toLowerCase().includes(search) ||
      (log.action || "").toLowerCase().includes(search)
    );
  });

  return (
    <AdminLayout>
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Activity Logs</h2>
                <p className="admin-page-subtitle">
                  A record of significant actions taken across the system.
                </p>
              </div>
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
                        placeholder="Search by message, actor or action..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: "36px", height: "38px" }}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select admin-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{ height: "38px" }}
                    >
                      {TARGET_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th>Actor</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>Target</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={5} className="text-center py-4">
                          <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                        </td></tr>
                      ) : error ? (
                        <tr><td colSpan={5} className="text-center py-4" style={{ color: "var(--clothcore-danger)" }}>{error}</td></tr>
                      ) : filteredLogs.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-5" style={{ color: "var(--clothcore-text-soft)" }}>
                          <ClockHistory size={40} className="mb-2" style={{ opacity: 0.3 }} />
                          <div>No activity recorded yet.</div>
                        </td></tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <Person size={14} style={{ color: "var(--clothcore-text-soft)" }} />
                                <div>
                                  <div style={{ fontWeight: 600 }}>{log.actorName || "System"}</div>
                                  <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)" }}>{log.actorRole}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="admin-badge admin-badge-info">{log.action}</span></td>
                            <td>{log.message}</td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>{log.targetType || "—"}</td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>{formatRelativeTime(log.createdAt)}</td>
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

export default AdminActivityLogs;
