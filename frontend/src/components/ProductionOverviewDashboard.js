// src/components/ProductionOverviewDashboard.js
// Production-floor overview used by SupervisorDashboard. Visual patterns
// (stat cards, status/progress/activity row, table, pagination) are
// intentionally copied from AdminProduction.js so this reads as part of the
// same design system rather than a new one-off style.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BoxSeam,
  Gear,
  CheckCircle,
  PauseCircle,
  GraphUp,
  PlusCircle,
  People,
  Eye,
} from "react-bootstrap-icons";
import OrderDetailsModal from "./OrderDetailsModal";

const API_URL = "http://localhost:5000/api/production";
const ORDERS_PER_PAGE = 6;

const STAGE_OPTIONS = [
  "Not Started",
  "Cutting",
  "Sewing",
  "Quality Assurance",
  "Packing",
  "Completed",
];

const STAGE_ICONS = {
  "Not Started": { icon: <PlusCircle size={16} color="#854f6c" />, text: "created" },
  Cutting: { icon: <Gear size={16} color="#d98324" />, text: "in cutting" },
  Sewing: { icon: <Gear size={16} color="#d98324" />, text: "in sewing" },
  "Quality Assurance": { icon: <Gear size={16} color="#d98324" />, text: "in QA" },
  Packing: { icon: <Gear size={16} color="#d98324" />, text: "in packing" },
  Completed: { icon: <CheckCircle size={16} color="#1a9c5f" />, text: "completed" },
};

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

function getStatusStyle(status) {
  const styles = {
    "In Production": { bg: "var(--clothcore-warning-bg)", color: "var(--clothcore-warning)" },
    Completed: { bg: "var(--clothcore-success-bg)", color: "var(--clothcore-success)" },
    "On Hold": { bg: "var(--clothcore-danger-bg)", color: "var(--clothcore-danger)" },
    Cancelled: { bg: "rgba(107,91,115,0.12)", color: "var(--clothcore-text-soft)" },
  };
  return styles[status] || styles["In Production"];
}

function getProgressColor(progress) {
  if (progress >= 75) return "#1a9c5f";
  if (progress >= 50) return "#d98324";
  if (progress >= 25) return "#854f6c";
  return "#d1495b";
}

function ProductionOverviewDashboard({ heading, subtitle, canUpdateStage, canAssign }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProduction: 0,
    completed: 0,
    onHold: 0,
    cancelled: 0,
    averageProgress: 0,
    progressDistribution: [],
    recentActivity: [],
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const [pendingStage, setPendingStage] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [stageError, setStageError] = useState("");

  const [assignableStaff, setAssignableStaff] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [assignForm, setAssignForm] = useState({ staffIds: [], notes: "" });
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [viewingOrderId, setViewingOrderId] = useState(null);

  const totalForPercentage = stats.totalOrders || 1;
  const productionStatus = [
    { label: "In Production", value: `${stats.inProduction} (${Math.round((stats.inProduction / totalForPercentage) * 1000) / 10}%)`, color: "var(--clothcore-purple)" },
    { label: "Completed", value: `${stats.completed} (${Math.round((stats.completed / totalForPercentage) * 1000) / 10}%)`, color: "var(--clothcore-success)" },
    { label: "On Hold", value: `${stats.onHold} (${Math.round((stats.onHold / totalForPercentage) * 1000) / 10}%)`, color: "var(--clothcore-danger)" },
    { label: "Cancelled", value: `${stats.cancelled} (${Math.round((stats.cancelled / totalForPercentage) * 1000) / 10}%)`, color: "var(--clothcore-text-soft)" },
  ];

  const progressItems = (stats.progressDistribution || []).map((bucket) => ({
    label: `${bucket.label}: ${bucket.count} order${bucket.count === 1 ? "" : "s"}`,
    progress: bucket.progress,
  }));

  const activities = (stats.recentActivity || []).map((record) => {
    const stageInfo = STAGE_ICONS[record.stage] || STAGE_ICONS["Not Started"];
    return {
      text: `${record.orderId} is ${stageInfo.text}`,
      time: formatRelativeTime(record.updatedAt),
      icon: stageInfo.icon,
    };
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        params: {
          page: currentPage,
          limit: ORDERS_PER_PAGE,
          search: searchTerm.trim(),
        },
      });

      const data = response.data;
      setOrders(data.items || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Production Orders Error:", err);
      setError(err.response?.data?.message || "Could not load production orders.");
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Fetch Production Stats Error:", err);
    }
  }, []);

  const fetchAssignableStaff = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/assignable-staff`);
      setAssignableStaff(response.data.data || []);
    } catch (err) {
      console.error("Fetch Assignable Staff Error:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSearching) fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [isSearching, fetchOrders]);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    if (canAssign) fetchAssignableStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOrders, fetchStats]);

  const openAssign = (order) => {
    setAssigning(order);
    setAssignForm({
      staffIds: (order.assignedStaffIds || []).map((id) => (typeof id === "string" ? id : id._id)),
      notes: order.assignmentNotes || "",
    });
    setAssignError("");
  };

  const toggleAssignStaff = (staffId) => {
    setAssignForm((prev) => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...prev.staffIds, staffId],
    }));
  };

  const handleSaveAssignment = async () => {
    if (!assigning) return;
    try {
      setSavingAssignment(true);
      setAssignError("");
      await axios.patch(`${API_URL}/${assigning._id}/assign`, {
        assignedStaffIds: assignForm.staffIds,
        assignmentNotes: assignForm.notes,
      });
      setAssigning(null);
      await fetchOrders();
    } catch (err) {
      console.error("Save Assignment Error:", err);
      setAssignError(err.response?.data?.message || "Could not save assignment.");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    setIsSearching(true);
  };

  const handleUpdateStage = async (id) => {
    const stage = pendingStage[id];
    if (!stage) return;

    try {
      setUpdatingId(id);
      setStageError("");
      await axios.patch(`${API_URL}/${id}/stage`, { stage });
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (err) {
      console.error("Update Stage Error:", err);
      setStageError(err.response?.data?.message || "Could not update stage.");
    } finally {
      setUpdatingId(null);
    }
  };

  const columnCount = 7 + (canAssign ? 1 : 0) + (canUpdateStage ? 1 : 0);

  return (
    <>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">{heading}</h2>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Orders", value: stats.totalOrders || 0, icon: <BoxSeam size={22} color="#522b5b" />, bg: "rgba(82,43,91,0.1)" },
          { label: "In Production", value: stats.inProduction || 0, icon: <Gear size={22} color="#d98324" />, bg: "var(--clothcore-warning-bg)" },
          { label: "Completed", value: stats.completed || 0, icon: <CheckCircle size={22} color="#1a9c5f" />, bg: "var(--clothcore-success-bg)" },
          { label: "On Hold", value: stats.onHold || 0, icon: <PauseCircle size={22} color="#d1495b" />, bg: "var(--clothcore-danger-bg)" },
          { label: "Avg. Progress", value: `${stats.averageProgress || 0}%`, icon: <GraphUp size={22} color="#2b124c" />, bg: "rgba(43,18,76,0.08)" },
        ].map((stat, index) => (
          <div key={index} className="col-xl-2 col-lg-3 col-md-6 col-sm-12">
            <div className="card admin-stat-card">
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", fontWeight: "500", marginBottom: "2px" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)" }}>
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status / Progress / Activity row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="card admin-content-card border-0 h-100" style={{ borderRadius: "12px", boxShadow: "var(--clothcore-shadow)" }}>
            <div className="card-body">
              <h6 style={{ fontSize: "15px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "16px" }}>
                Production Status
              </h6>
              {productionStatus.map((item, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: index < productionStatus.length - 1 ? "1px solid var(--clothcore-border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--clothcore-text)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card admin-content-card border-0 h-100" style={{ borderRadius: "12px", boxShadow: "var(--clothcore-shadow)" }}>
            <div className="card-body">
              <h6 style={{ fontSize: "15px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "16px" }}>
                Stage Distribution
              </h6>
              {progressItems.map((item, index) => (
                <div key={index} style={{ marginBottom: index < progressItems.length - 1 ? "10px" : "0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <span style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>{item.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: getProgressColor(item.progress) }}>{item.progress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", borderRadius: "2px", background: "var(--clothcore-border)", overflow: "hidden" }}>
                    <div style={{ width: `${item.progress}%`, height: "100%", background: getProgressColor(item.progress), borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card admin-content-card border-0 h-100" style={{ borderRadius: "12px", boxShadow: "var(--clothcore-shadow)" }}>
            <div className="card-body">
              <h6 style={{ fontSize: "15px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "16px" }}>
                Recent Activity
              </h6>
              {activities.length === 0 ? (
                <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>No recent activity yet.</div>
              ) : (
                activities.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: index < activities.length - 1 ? "1px solid var(--clothcore-border)" : "none" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--clothcore-peach)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "10px", flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>{item.text}</div>
                      <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)", marginTop: "1px" }}>{item.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card admin-content-card border-0" style={{ borderRadius: "12px", boxShadow: "var(--clothcore-shadow)" }}>
        <div className="card-body">
          <div style={{ marginBottom: "16px" }}>
            <div className="position-relative">
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search production orders..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ paddingLeft: "36px", borderRadius: "8px", border: "1px solid var(--clothcore-border)", fontSize: "13px", height: "38px", maxWidth: "400px" }}
              />
            </div>
          </div>

          {canUpdateStage && stageError && (
            <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "8px", background: "var(--clothcore-danger-bg)", color: "var(--clothcore-danger)", fontSize: "13px" }}>
              {stageError}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
              <thead style={{ background: "var(--clothcore-peach)" }}>
                <tr>
                  <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>ORDER ID</th>
                  <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>PRODUCT</th>
                  <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>QUANTITY</th>
                  <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>PROGRESS / STAGE</th>
                  <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>STATUS</th>
                  <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>DUE DATE</th>
                  {canAssign && (
                    <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>ASSIGNED TO</th>
                  )}
                  {canUpdateStage && (
                    <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>UPDATE STAGE</th>
                  )}
                  <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columnCount} style={{ textAlign: "center", padding: "40px 20px", color: "var(--clothcore-text-soft)" }}>
                      <div className="spinner-border text-primary" style={{ width: "2rem", height: "2rem" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div style={{ marginTop: "8px" }}>Loading production orders...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={columnCount} style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ color: "var(--clothcore-danger)", marginBottom: "8px" }}>
                        <strong>Error:</strong> {error}
                      </div>
                      <button
                        onClick={() => fetchOrders()}
                        style={{ padding: "6px 16px", backgroundColor: "var(--clothcore-purple)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={columnCount} style={{ textAlign: "center", padding: "40px 20px", color: "var(--clothcore-text-soft)" }}>
                      <BoxSeam size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                      <div style={{ fontWeight: "500" }}>No production orders found</div>
                      <div style={{ fontSize: "13px", marginTop: "4px" }}>
                        {searchTerm ? "Try adjusting your search." : "Orders in production will appear here."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    const progressColor = getProgressColor(order.progress);
                    const locked = order.status === "On Hold" || order.status === "Cancelled";
                    const selectedStage = pendingStage[order._id] ?? order.stage;

                    return (
                      <tr key={order._id}>
                        <td style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-purple)" }}>
                          {order.orderId}
                        </td>
                        <td style={{ padding: "8px 10px" }}>{order.product}</td>
                        <td style={{ padding: "8px 10px", color: "var(--clothcore-text-soft)" }}>
                          {order.quantity ? `${order.quantity.toLocaleString()} ${order.unit || "Pcs"}` : "N/A"}
                        </td>
                        <td style={{ padding: "8px 10px", minWidth: "175px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "60px", height: "5px", borderRadius: "3px", background: "var(--clothcore-border)", overflow: "hidden", flexShrink: 0 }}>
                              <div style={{ width: `${order.progress || 0}%`, height: "100%", background: progressColor }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "600", color: progressColor }}>{order.progress || 0}%</span>
                          </div>
                          <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>
                            {order.stage}
                          </div>
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "500", background: statusStyle.bg, color: statusStyle.color }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "var(--clothcore-text-soft)" }}>
                          {formatDate(order.dueDate)}
                        </td>
                        {canAssign && (
                          <td style={{ padding: "8px 10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                              {(order.assignedStaffIds || []).length === 0 ? (
                                <span style={{ fontSize: "11px", color: "var(--clothcore-text-soft)" }}>Unassigned</span>
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--clothcore-text)" }}>
                                  {(order.assignedStaffIds || [])
                                    .map((s) => (typeof s === "string" ? s : `${s.firstName || ""} ${s.lastName || ""}`.trim()))
                                    .join(", ")}
                                </span>
                              )}
                              <button
                                onClick={() => openAssign(order)}
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--clothcore-border)",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  color: "var(--clothcore-purple)",
                                  background: "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <People size={12} /> Assign
                              </button>
                            </div>
                          </td>
                        )}
                        {canUpdateStage && (
                          <td style={{ padding: "8px 10px" }}>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <select
                                value={selectedStage}
                                disabled={locked}
                                onChange={(e) =>
                                  setPendingStage((prev) => ({ ...prev, [order._id]: e.target.value }))
                                }
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--clothcore-border-strong)",
                                  fontSize: "12px",
                                  background: locked ? "var(--clothcore-bg)" : "#fff",
                                  color: "var(--clothcore-text)",
                                }}
                              >
                                {STAGE_OPTIONS.map((s) => (
                                  <option key={s} value={s} style={{ background: "var(--clothcore-card)", color: "var(--clothcore-text)" }}>{s}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleUpdateStage(order._id)}
                                disabled={locked || updatingId === order._id || selectedStage === order.stage}
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "6px",
                                  border: "none",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "white",
                                  background:
                                    locked || updatingId === order._id || selectedStage === order.stage
                                      ? "rgba(82,43,91,0.35)"
                                      : "var(--clothcore-purple)",
                                  cursor:
                                    locked || updatingId === order._id || selectedStage === order.stage
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                {updatingId === order._id ? "..." : "Update"}
                              </button>
                            </div>
                          </td>
                        )}
                        <td style={{ padding: "8px 10px" }}>
                          <button
                            onClick={() => setViewingOrderId(order.orderId)}
                            title="View order details"
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--clothcore-border)",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "var(--clothcore-purple)",
                              background: "transparent",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalItems > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--clothcore-border)" }}>
              <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>
                Showing {((currentPage - 1) * ORDERS_PER_PAGE) + 1} to {Math.min(currentPage * ORDERS_PER_PAGE, totalItems)} of {totalItems} orders
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "4px 10px", border: "1px solid var(--clothcore-border)", borderRadius: "6px", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? "var(--clothcore-text-muted)" : "var(--clothcore-text)", fontSize: "13px" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ padding: "4px 12px", fontSize: "13px", color: "var(--clothcore-text)" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "4px 10px", border: "1px solid var(--clothcore-border)", borderRadius: "6px", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? "var(--clothcore-text-muted)" : "var(--clothcore-text)", fontSize: "13px" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {assigning && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px", background: "var(--clothcore-card)", color: "var(--clothcore-text)" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-purple)" }}>
                  Assign Staff — {assigning.orderId}
                </h5>
                <button type="button" className="btn-close" onClick={() => setAssigning(null)} />
              </div>
              <div className="modal-body" style={{ padding: "24px" }}>
                {assignError && (
                  <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "8px", background: "var(--clothcore-danger-bg)", color: "var(--clothcore-danger)", fontSize: "13px" }}>
                    {assignError}
                  </div>
                )}

                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--clothcore-text-soft)", marginBottom: "8px", display: "block" }}>
                  Staff members
                </label>
                {assignableStaff.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>
                    No Staff accounts exist yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto", marginBottom: "16px" }}>
                    {assignableStaff.map((staffUser) => (
                      <label
                        key={staffUser._id}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--clothcore-border)", cursor: "pointer", fontSize: "13px" }}
                      >
                        <input
                          type="checkbox"
                          checked={assignForm.staffIds.includes(staffUser._id)}
                          onChange={() => toggleAssignStaff(staffUser._id)}
                        />
                        {staffUser.firstName} {staffUser.lastName}
                        <span style={{ color: "var(--clothcore-text-soft)", fontSize: "12px" }}>({staffUser.email})</span>
                      </label>
                    ))}
                  </div>
                )}

                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--clothcore-text-soft)", marginBottom: "8px", display: "block" }}>
                  Assignment notes (optional)
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any instructions for the assigned staff..."
                />
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button className="admin-btn-secondary" onClick={() => setAssigning(null)} disabled={savingAssignment}>
                  Cancel
                </button>
                <button className="admin-btn-primary" onClick={handleSaveAssignment} disabled={savingAssignment}>
                  {savingAssignment ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <OrderDetailsModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />
    </>
  );
}

export default ProductionOverviewDashboard;
