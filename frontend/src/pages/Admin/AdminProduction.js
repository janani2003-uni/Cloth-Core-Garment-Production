import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from "../../components/AdminLayout";
import axios from 'axios';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BoxSeam,
  Gear,
  CheckCircle,
  PauseCircle,
  GraphUp,
  PlusCircle
} from 'react-bootstrap-icons';

const API_URL = "http://localhost:5000/api/production";

function AdminProduction() {
  const [searchTerm, setSearchTerm] = useState('');
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

  const [managing, setManaging] = useState(null);
  const [manageForm, setManageForm] = useState(null);
  const [savingManage, setSavingManage] = useState(false);
  const [manageError, setManageError] = useState("");
  const [assignableStaff, setAssignableStaff] = useState([]);

  const ordersPerPage = 5;

  const STAGE_OPTIONS = ["Not Started", "Cutting", "Sewing", "Quality Assurance", "Packing", "Completed"];
  const STATUS_OPTIONS = ["In Production", "Completed", "On Hold", "Cancelled"];

  const STAGE_ICONS = {
    "Not Started": { icon: <PlusCircle size={16} color="#854f6c" />, text: "created" },
    Cutting: { icon: <Gear size={16} color="#d98324" />, text: "in cutting" },
    Sewing: { icon: <Gear size={16} color="#d98324" />, text: "in sewing" },
    "Quality Assurance": { icon: <Gear size={16} color="#d98324" />, text: "in QA" },
    Packing: { icon: <Gear size={16} color="#d98324" />, text: "in packing" },
    Completed: { icon: <CheckCircle size={16} color="#1a9c5f" />, text: "completed" },
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  // Real production status breakdown, derived from stats fetched from the backend
  const totalForPercentage = stats.totalOrders || 1;
  const productionStatus = [
    { label: 'In Production', value: `${stats.inProduction} (${Math.round((stats.inProduction / totalForPercentage) * 1000) / 10}%)`, color: 'var(--clothcore-purple)' },
    { label: 'Completed', value: `${stats.completed} (${Math.round((stats.completed / totalForPercentage) * 1000) / 10}%)`, color: 'var(--clothcore-success)' },
    { label: 'On Hold', value: `${stats.onHold} (${Math.round((stats.onHold / totalForPercentage) * 1000) / 10}%)`, color: 'var(--clothcore-danger)' },
    { label: 'Cancelled', value: `${stats.cancelled} (${Math.round((stats.cancelled / totalForPercentage) * 1000) / 10}%)`, color: 'var(--clothcore-text-soft)' }
  ];

  // Real progress-stage distribution, from the backend's $bucket aggregation
  const progressItems = (stats.progressDistribution || []).map((bucket) => ({
    label: `${bucket.label}: ${bucket.count} order${bucket.count === 1 ? "" : "s"}`,
    progress: bucket.progress,
  }));

  // Real recent activity, from the most recently updated production records
  const activities = (stats.recentActivity || []).map((record) => {
    const stageInfo = STAGE_ICONS[record.stage] || STAGE_ICONS["Not Started"];
    return {
      text: `${record.orderId} is ${stageInfo.text}`,
      time: formatRelativeTime(record.updatedAt),
      icon: stageInfo.icon,
    };
  });

  // Fetch production orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(API_URL, {
        params: {
          page: currentPage,
          limit: ordersPerPage,
          search: searchTerm.trim()
        }
      });
      
      const data = response.data;
      setOrders(data.items || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      setError(err.response?.data?.message || "Could not load production orders.");
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, searchTerm, ordersPerPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Fetch Stats Error:", err);
    }
  }, []);

  const openManage = (order) => {
    setManageError("");
    setManaging(order);
    setManageForm({
      stage: order.stage,
      progress: order.progress,
      status: order.status,
      assignedStaffIds: (order.assignedStaffIds || []).map((s) => (typeof s === "string" ? s : s._id)),
      assignmentNotes: order.assignmentNotes || "",
    });
  };

  const toggleManageStaff = (staffId) => {
    setManageForm((f) => ({
      ...f,
      assignedStaffIds: f.assignedStaffIds.includes(staffId)
        ? f.assignedStaffIds.filter((id) => id !== staffId)
        : [...f.assignedStaffIds, staffId],
    }));
  };

  // Stage and progress are two views of the same underlying number
  // (Production.stage is derived server-side from progress) — moving the
  // stage dropdown snaps progress to that stage's range so the two controls
  // stay in sync with each other and with the Supervisor's equivalent view.
  const STAGE_PROGRESS = { "Not Started": 0, Cutting: 25, Sewing: 50, "Quality Assurance": 75, Packing: 99, Completed: 100 };

  const handleManageStageChange = (stage) => {
    setManageForm((f) => ({ ...f, stage, progress: STAGE_PROGRESS[stage] }));
  };

  const handleManageProgressChange = (progress) => {
    const value = Math.max(0, Math.min(100, Number(progress) || 0));
    setManageForm((f) => ({ ...f, progress: value }));
  };

  const handleSaveManage = async () => {
    try {
      setSavingManage(true);
      setManageError("");
      await axios.put(`${API_URL}/${managing._id}`, {
        progress: manageForm.progress,
        status: manageForm.status,
      });
      await axios.patch(`${API_URL}/${managing._id}/assign`, {
        assignedStaffIds: manageForm.assignedStaffIds,
        assignmentNotes: manageForm.assignmentNotes,
      });
      setManaging(null);
      setManageForm(null);
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (err) {
      console.error("Manage Production Error:", err);
      setManageError(err.response?.data?.message || "Could not update production record.");
    } finally {
      setSavingManage(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSearching) {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isSearching, fetchOrders]);

  // Initial load and page changes
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  useEffect(() => {
    axios
      .get(`${API_URL}/assignable-staff`)
      .then((res) => setAssignableStaff(res.data.data || []))
      .catch((err) => console.error("Fetch Assignable Staff Error:", err));
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    setIsSearching(true);
  };

  const getStatusStyle = (status) => {
    const styles = {
      'In Production': { bg: 'var(--clothcore-warning-bg)', color: 'var(--clothcore-warning)' },
      'Completed': { bg: 'var(--clothcore-success-bg)', color: 'var(--clothcore-success)' },
      'On Hold': { bg: 'var(--clothcore-danger-bg)', color: 'var(--clothcore-danger)' },
      'Cancelled': { bg: 'rgba(107,91,115,0.12)', color: 'var(--clothcore-text-soft)' }
    };
    return styles[status] || styles['In Production'];
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#1a9c5f';
    if (progress >= 50) return '#d98324';
    if (progress >= 25) return '#854f6c';
    return '#d1495b';
  };
  const getProductionStage = (progress) => {
  const value = Number(progress);

  if (value <= 0) return "Not Started";
  if (value <= 25) return "Cutting";
  if (value <= 50) return "Sewing";
  if (value <= 75) return "Quality Assurance";
  if (value < 100) return "Packing";

  return "Completed";
};

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <AdminLayout>

            {/* Breadcrumb */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: 'var(--clothcore-text-soft)', fontSize: '14px' }}>Dashboard</span>
              <span style={{ color: 'var(--clothcore-text-soft)', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: 'var(--clothcore-purple)', fontWeight: '600', fontSize: '14px' }}>Production Management</span>
            </div>

            {/* Page Header */}
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Production Management</h2>
                <p className="admin-page-subtitle">
                  Monitor and manage garment production from start to finish
                </p>
              </div>
            </div>

            {/* Stats Cards - 5 in a row - Connected to Backend */}
            <div className="row g-3 mb-4">
              {[
                {
                  label: 'Total Orders',
                  value: stats.totalOrders || 0,
                  icon: <BoxSeam size={22} color="#522b5b" />,
                  bg: 'rgba(82,43,91,0.1)'
                },
                {
                  label: 'In Production',
                  value: stats.inProduction || 0,
                  icon: <Gear size={22} color="#d98324" />,
                  bg: 'var(--clothcore-warning-bg)'
                },
                {
                  label: 'Completed',
                  value: stats.completed || 0,
                  icon: <CheckCircle size={22} color="#1a9c5f" />,
                  bg: 'var(--clothcore-success-bg)'
                },
                {
                  label: 'On Hold',
                  value: stats.onHold || 0,
                  icon: <PauseCircle size={22} color="#d1495b" />,
                  bg: 'var(--clothcore-danger-bg)'
                },
                {
                  label: 'Avg. Progress',
                  value: `${stats.averageProgress || 0}%`,
                  icon: <GraphUp size={22} color="#2b124c" />,
                  bg: 'rgba(43,18,76,0.08)'
                }
              ].map((stat, index) => (
                <div key={index} className="col-xl-2 col-lg-3 col-md-6 col-sm-12">
                  <div className="card admin-stat-card">
                    <div className="card-body">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ 
                          width: "40px", 
                          height: "40px", 
                          borderRadius: "10px", 
                          background: stat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
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

            {/* 3 Cards in one row - real data from /api/production/stats */}
            <div className="row g-3 mb-4">
              {/* Production Status Card */}
              <div className="col-lg-4">
                <div className="card admin-content-card h-100" style={{ borderRadius: "12px" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "16px" }}>
                      Production Status
                    </h6>
                    
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--clothcore-text)" }}>Total</span>
                    </div>
                    
                    {productionStatus.map((item, index) => (
                      <div key={index} style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: index < productionStatus.length - 1 ? "1px solid var(--clothcore-border)" : "none"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ 
                            width: "8px", 
                            height: "8px", 
                            borderRadius: "50%", 
                            background: item.color 
                          }} />
                          <span style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--clothcore-text)" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Production Progress Card */}
              <div className="col-lg-4">
                <div className="card admin-content-card h-100" style={{ borderRadius: "12px" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "16px" }}>
                      Production Progress
                    </h6>
                    
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--clothcore-text)" }}>This Month</span>
                    </div>
                    
                    {progressItems.map((item, index) => (
                      <div key={index} style={{ marginBottom: index < progressItems.length - 1 ? "10px" : "0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>{item.label}</span>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: getProgressColor(item.progress) }}>
                            {item.progress}%
                          </span>
                        </div>
                        <div style={{ 
                          width: "100%", 
                          height: "4px", 
                          borderRadius: "2px", 
                          background: "var(--clothcore-border)",
                          overflow: "hidden"
                        }}>
                          <div style={{ 
                            width: `${item.progress}%`, 
                            height: "100%", 
                            background: getProgressColor(item.progress),
                            borderRadius: "2px"
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activities Card */}
              <div className="col-lg-4">
                <div className="card admin-content-card h-100" style={{ borderRadius: "12px" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "16px" }}>
                      Recent Activities
                    </h6>
                    
                    {activities.map((item, index) => (
                      <div key={index} style={{ 
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: index < activities.length - 1 ? "1px solid var(--clothcore-border)" : "none"
                      }}>
                        <div style={{ 
                          width: "28px", 
                          height: "28px", 
                          borderRadius: "50%", 
                          background: "var(--clothcore-peach)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                          flexShrink: 0
                        }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>
                            {item.text}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)", marginTop: "1px" }}>
                            {item.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table Card - Connected to Backend */}
            <div className="card admin-content-card" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                {/* Search Bar */}
                <div style={{ marginBottom: "16px" }}>
                  <div className="position-relative">
                    <Search 
                      size={16} 
                      style={{ 
                        position: "absolute", 
                        left: "12px", 
                        top: "50%", 
                        transform: "translateY(-50%)",
                        color: "var(--clothcore-text-soft)"
                      }} 
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search production orders..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      style={{
                        paddingLeft: "36px",
                        borderRadius: "8px",
                        border: "1px solid var(--clothcore-border)",
                        fontSize: "13px",
                        height: "38px",
                        maxWidth: "400px"
                      }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
                    <thead style={{ background: "var(--clothcore-peach)" }}>
                      <tr>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>#</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>ORDER ID</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>PRODUCT</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>STYLE / SKU</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>QUANTITY</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>PROGRESS</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>STATUS</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>START DATE</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}>DUE DATE</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-text-soft)" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: "center", padding: "40px 20px", color: "var(--clothcore-text-soft)" }}>
                            <div className="spinner-border text-primary" style={{ width: "2rem", height: "2rem" }} role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <div style={{ marginTop: "8px" }}>Loading production orders...</div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div style={{ color: "var(--clothcore-danger)", marginBottom: "8px" }}>
                              <strong>Error:</strong> {error}
                            </div>
                            <button
                              onClick={() => fetchOrders()}
                              style={{
                                padding: "6px 16px",
                                backgroundColor: "var(--clothcore-purple)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer"
                              }}
                            >
                              Retry
                            </button>
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: "center", padding: "40px 20px", color: "var(--clothcore-text-soft)" }}>
                            <div style={{ fontSize: "48px", marginBottom: "8px" }}>📋</div>
                            <div style={{ fontWeight: "500" }}>No production orders found</div>
                            <div style={{ fontSize: "13px", marginTop: "4px" }}>
                              {searchTerm ? "Try adjusting your search" : "Create your first production order"}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        orders.map((order, index) => {
                          const statusStyle = getStatusStyle(order.status);
                          const progressColor = getProgressColor(order.progress);
                          return (
                            <tr key={order._id}>
                              <td style={{ padding: "8px 10px", color: "var(--clothcore-text-soft)" }}>
                                {((currentPage - 1) * ordersPerPage) + index + 1}
                              </td>
                              <td style={{ padding: "8px 10px", fontWeight: "600", color: "var(--clothcore-purple)" }}>
                                {order.orderId}
                              </td>
                              <td style={{ padding: "8px 10px" }}>{order.product}</td>
                              <td style={{ padding: "8px 10px", color: "var(--clothcore-text-soft)" }}>{order.sku}</td>
                              <td style={{ padding: "8px 10px", color: "var(--clothcore-text-soft)" }}>
                                {order.quantity ? `${order.quantity.toLocaleString()} ${order.unit || 'Pcs'}` : 'N/A'}
                              </td>
                              <td style={{ padding: "8px 10px", minWidth: "175px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <div
      style={{
        width: "60px",
        height: "5px",
        borderRadius: "3px",
        background: "var(--clothcore-border)",
        overflow: "hidden",
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: `${order.progress || 0}%`,
          height: "100%",
          background: progressColor
        }}
      />
    </div>

    <span
      style={{
        fontSize: "12px",
        fontWeight: "600",
        color: progressColor
      }}
    >
      {order.progress || 0}%
    </span>
  </div>

  <div
    style={{
      marginTop: "4px",
      fontSize: "11px",
      fontWeight: "600",
      color: "var(--clothcore-text-soft)"
    }}
  >
    {getProductionStage(order.progress)}
  </div>
</td>
                              <td style={{ padding: "8px 10px" }}>
                                <span style={{
                                  padding: "2px 10px",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  background: statusStyle.bg,
                                  color: statusStyle.color
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td style={{ padding: "8px 10px", color: "var(--clothcore-text-soft)" }}>
                                {formatDate(order.startDate)}
                              </td>
                              <td style={{ padding: "8px 10px", color: "var(--clothcore-text-soft)" }}>
                                {formatDate(order.dueDate)}
                              </td>
                              <td style={{ padding: "8px 10px" }}>
                                <button
                                  onClick={() => openManage(order)}
                                  style={{
                                    padding: "4px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--clothcore-border-strong)",
                                    background: "rgba(82,43,91,0.06)",
                                    color: "var(--clothcore-purple)",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--clothcore-border)" }}>
                    <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>
                      Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalItems)} of {totalItems} orders
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: "4px 10px",
                          border: "1px solid var(--clothcore-border)",
                          borderRadius: "6px",
                          background: "rgba(82,43,91,0.06)",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          color: currentPage === 1 ? "#ccc" : "var(--clothcore-text)",
                          fontSize: "13px"
                        }}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (pageNum > 5) return null;
                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              padding: "4px 12px",
                              border: currentPage === pageNum ? "none" : "1px solid var(--clothcore-border)",
                              borderRadius: "6px",
                              background: currentPage === pageNum ? "var(--clothcore-purple)" : "rgba(82,43,91,0.06)",
                              color: currentPage === pageNum ? "white" : "var(--clothcore-text)",
                              fontWeight: currentPage === pageNum ? "600" : "400",
                              cursor: "pointer",
                              fontSize: "13px"
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span style={{ padding: "4px 8px", color: "var(--clothcore-text-soft)", fontSize: "13px" }}>...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            style={{
                              padding: "4px 12px",
                              border: currentPage === totalPages ? "none" : "1px solid var(--clothcore-border)",
                              borderRadius: "6px",
                              background: currentPage === totalPages ? "var(--clothcore-purple)" : "rgba(82,43,91,0.06)",
                              color: currentPage === totalPages ? "white" : "var(--clothcore-text)",
                              fontWeight: currentPage === totalPages ? "600" : "400",
                              cursor: "pointer",
                              fontSize: "13px"
                            }}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "4px 10px",
                          border: "1px solid var(--clothcore-border)",
                          borderRadius: "6px",
                          background: "rgba(82,43,91,0.06)",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          color: currentPage === totalPages ? "#ccc" : "var(--clothcore-text)",
                          fontSize: "13px"
                        }}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

      {managing && manageForm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <div>
                  <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-purple)" }}>Manage Production</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>{managing.orderId} — {managing.product}</p>
                </div>
                <button type="button" className="btn-close" onClick={() => !savingManage && setManaging(null)} />
              </div>
              <div className="modal-body" style={{ padding: "20px 24px" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Stage</label>
                    <select
                      className="form-select admin-select"
                      value={manageForm.stage}
                      onChange={(e) => handleManageStageChange(e.target.value)}
                      disabled={manageForm.status === "On Hold" || manageForm.status === "Cancelled"}
                    >
                      {STAGE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Progress (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="form-control admin-select"
                      value={manageForm.progress}
                      onChange={(e) => handleManageProgressChange(e.target.value)}
                      disabled={manageForm.status === "On Hold" || manageForm.status === "Cancelled"}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Status</label>
                    <select
                      className="form-select admin-select"
                      value={manageForm.status}
                      onChange={(e) => setManageForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-3 mb-0" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
                  Placing this on hold or cancelling it freezes stage/progress until it's resumed (set status back to "In Production").
                </p>

                <hr />

                <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Assigned Staff</label>
                {assignableStaff.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>No Staff accounts exist yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                    {assignableStaff.map((staffUser) => (
                      <label
                        key={staffUser._id}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--clothcore-border)", cursor: "pointer", fontSize: "13px" }}
                      >
                        <input
                          type="checkbox"
                          checked={manageForm.assignedStaffIds.includes(staffUser._id)}
                          onChange={() => toggleManageStaff(staffUser._id)}
                        />
                        {staffUser.firstName} {staffUser.lastName}
                        <span style={{ color: "var(--clothcore-text-soft)", fontSize: "12px" }}>({staffUser.email})</span>
                      </label>
                    ))}
                  </div>
                )}
                <textarea
                  className="form-control admin-select mt-2"
                  rows={2}
                  placeholder="Assignment notes (optional)"
                  value={manageForm.assignmentNotes}
                  onChange={(e) => setManageForm((f) => ({ ...f, assignmentNotes: e.target.value }))}
                />

                {manageError && (
                  <div className="mt-3" style={{ color: "var(--clothcore-danger)", fontSize: "13px" }}>{manageError}</div>
                )}
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setManaging(null)} disabled={savingManage}>
                  Cancel
                </button>
                <button type="button" className="admin-btn-primary" onClick={handleSaveManage} disabled={savingManage}>
                  {savingManage ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default AdminProduction;