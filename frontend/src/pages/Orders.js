import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { 
  Search, 
  Filter, 
  Plus, 
  Bell, 
  ChevronDown,
  Eye,
  Download,
  ExclamationCircle,
  CheckCircle,
  Clock,
  GraphUp,
  Box,
  Person,
  Wallet2,
  Calendar,
  Pencil,
  Trash,
  XCircle,
  Truck,
  Scissors,
  Palette,
  Cash,
  CreditCard,
  XLg
} from "react-bootstrap-icons";
import logo from "../assets/logo.png";

function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  
  // State variables
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  
  const API_URL = "http://localhost:5000/api/orders";

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Load Orders Error:", err);
      setError(err.response?.data?.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Helper function to generate display Order ID from _id
  const getDisplayOrderId = (id) => {
    if (!id) return "N/A";
    return id.slice(-6).toUpperCase();
  };

  // Filter orders based on search
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.trim().toLowerCase();
    return (
      getDisplayOrderId(order._id).toLowerCase().includes(search) ||
      String(order.shopName || "").toLowerCase().includes(search) ||
      String(order.garment || "").toLowerCase().includes(search) ||
      String(order.fabric || "").toLowerCase().includes(search) ||
      String(order.color || "").toLowerCase().includes(search) ||
      String(order.progress || "").toLowerCase().includes(search)
    );
  });

  // Calculate statistics from MongoDB schema
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "Pending").length;
  const completedOrders = orders.filter(order => order.status === "Delivered" || order.status === "Completed").length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Box,
      color: "#0b3aa0",
      bg: "rgba(11,58,160,0.1)",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "#f57c00",
      bg: "rgba(245,124,0,0.1)",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: CheckCircle,
      color: "#2e7d32",
      bg: "rgba(46,125,50,0.1)",
    },
    {
      label: "Revenue",
      value: `LKR ${totalRevenue.toLocaleString()}`,
      icon: Wallet2,
      color: "#0b3aa0",
      bg: "rgba(11,58,160,0.1)",
    },
  ];

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    const styles = {
      "Pending": { 
        bg: "linear-gradient(135deg, #ffc107, #f57c00)", 
        icon: Clock,
        color: "white"
      },
      "Processing": { 
        bg: "linear-gradient(135deg, #17a2b8, #0d6efd)", 
        icon: GraphUp,
        color: "white"
      },
      "Completed": { 
        bg: "linear-gradient(135deg, #28a745, #1e7e34)", 
        icon: CheckCircle,
        color: "white"
      },
      "Delivered": { 
        bg: "linear-gradient(135deg, #28a745, #1e7e34)", 
        icon: Truck,
        color: "white"
      },
      "Cancelled": { 
        bg: "linear-gradient(135deg, #dc3545, #c62828)", 
        icon: XCircle,
        color: "white"
      }
    };
    return styles[status] || styles["Pending"];
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (!progress) return "#e9ecef";
    const val = parseInt(progress);
    if (val >= 80) return "#28a745";
    if (val >= 50) return "#ffc107";
    return "#17a2b8";
  };

  // CRUD Operations
  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`);
      setSelectedOrder(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error("View Order Error:", err);
      alert("Could not load order details.");
    }
  };

  const handleEditOrder = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`);
      setEditFormData(response.data);
      setShowEditModal(true);
    } catch (err) {
      console.error("Edit Order Error:", err);
      alert("Could not load order for editing.");
    }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${editFormData._id}`, editFormData);
      alert("Order updated successfully!");
      setShowEditModal(false);
      await fetchOrders();
    } catch (err) {
      console.error("Update Order Error:", err);
      alert(err.response?.data?.message || "Could not update order.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    
    try {
      setDeletingOrderId(orderId);
      await axios.delete(`${API_URL}/${orderId}`);
      alert("Order deleted successfully!");
      await fetchOrders();
    } catch (err) {
      console.error("Delete Order Error:", err);
      alert(err.response?.data?.message || "Could not delete order.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  // Export filtered orders to CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const headers = [
      "Order ID", "Shop Name", "Garment", "Fabric", "Color", 
      "Quantity", "Amount (LKR)", "Advance Paid (LKR)", 
      "Balance Payment (LKR)", "Payment Method", "Payment Status", 
      "Status", "Progress (%)", "Created At"
    ];
    
    const rows = filteredOrders.map(order => [
      getDisplayOrderId(order._id),
      order.shopName || "",
      order.garment || "",
      order.fabric || "",
      order.color || "",
      order.quantity || 0,
      order.amount || 0,
      order.advancePaid || 0,
      order.balancePayment || 0,
      order.paymentMethod || "",
      order.paymentStatus || "",
      order.status || "",
      order.progress || "",
      new Date(order.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
        <Sidebar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 style={{ color: "#0b3aa0" }}>Loading Orders...</h5>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
        <Sidebar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <ExclamationCircle size={48} style={{ color: "#dc3545" }} />
            <h5 className="mt-3" style={{ color: "#dc3545" }}>{error}</h5>
            <button 
              className="btn btn-primary mt-3"
              onClick={fetchOrders}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Sidebar />

      <div className="flex-grow-1" style={{ padding: "20px" }}>
        <div className="container-fluid px-0">
          {/* Top Navigation Bar */}
          <div className="px-4 py-3 mb-4" style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
          }}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <img
                    src={logo}
                    alt="logo"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "contain"
                    }}
                  />
                  <div className="ms-2">
                    <div className="fw-bold" style={{ fontSize: "18px", color: "#0b3aa0" }}>
                      ClothCore
                    </div>
                    <div style={{ fontSize: "10px", color: "#6c757d", lineHeight: "1.1" }}>
                      Garment Productions
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="position-relative" style={{ cursor: "pointer" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(11,58,160,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(11,58,160,0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(11,58,160,0.08)"}
                  >
                    <Bell size={20} style={{ color: "#0b3aa0" }} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{
                      background: "linear-gradient(135deg, #dc3545, #c62828)",
                      fontSize: "10px",
                      padding: "3px 7px",
                      border: "2px solid white"
                    }}>
                      3
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}>
                    <Person size={18} />
                  </div>
                  <div className="d-none d-md-block">
                    <div className="fw-bold" style={{ fontSize: "13px", color: "#1a1a2e" }}>
                      Saman Fashions
                    </div>
                    <div style={{ fontSize: "11px", color: "#6c757d" }}>
                      Shop Owner
                    </div>
                  </div>
                  <ChevronDown size={14} style={{ color: "#6c757d" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-xl-3 col-lg-6 col-md-6">
                <div className="card border-0 h-100" style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500" }}>
                          {stat.label}
                        </div>
                        <div className="fw-bold" style={{ fontSize: "26px", color: "#1a1a2e", marginTop: "4px" }}>
                          {stat.value}
                        </div>
                      </div>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: stat.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <stat.icon size={24} style={{ color: stat.color }} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span style={{ fontSize: "12px", color: "#28a745" }}>
                        ↑ 12.5%
                      </span>
                      <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "5px" }}>
                        vs last month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Header with Actions */}
          <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center mb-4 gap-3">
            <div>
              <h1 className="fw-bold" style={{ fontSize: "28px", color: "#1a1a2e" }}>
                Order Management
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: "15px" }}>
                View and manage all garment orders
              </p>
            </div>

            <button
              className="btn fw-bold px-4 py-2"
              style={{
                background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                color: "white",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 15px rgba(11,58,160,0.3)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onClick={() => navigate("/step1")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(11,58,160,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(11,58,160,0.3)";
              }}
            >
              <Plus size={20} /> Place Order
            </button>
          </div>

          {/* Table Card */}
          <div className="card border-0" style={{
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            overflow: "hidden"
          }}>
            
            <div className="card-header bg-white border-0 px-4 py-4">
              <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center gap-3">
                <div className="position-relative" style={{ flex: "1", maxWidth: "400px" }}>
                  <Search size={18} style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#adb5bd"
                  }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Order ID, Shop, Garment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: "42px",
                      borderRadius: "12px",
                      border: "2px solid #e9ecef",
                      fontSize: "14px",
                      height: "44px",
                      transition: "all 0.3s ease"
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0b3aa0";
                      e.currentTarget.style.boxShadow = "0 0 0 4px rgba(11,58,160,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e9ecef";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn px-3 py-2"
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e9ecef",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.3s ease",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    <Filter size={16} /> Filter
                  </button>
                  <button
                    className="btn px-3 py-2"
                    onClick={exportToCSV}
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e9ecef",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.3s ease",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: "14px" }}>
                  <thead style={{
                    background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                    borderBottom: "2px solid #dee2e6"
                  }}>
                    <tr>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Order ID
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Shop Name
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Garment
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Fabric / Color
                      </th>
                      <th className="px-4 py-3 fw-bold text-center" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Qty
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Date
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Status
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Progress
                      </th>
                      <th className="px-4 py-3 fw-bold text-end" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Amount
                      </th>
                      <th className="px-4 py-3 fw-bold text-center" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <div style={{ color: "#6c757d" }}>
                            <Box size={48} style={{ color: "#adb5bd" }} />
                            <h5 className="mt-2">No orders found</h5>
                            <p style={{ fontSize: "14px" }}>Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const statusStyle = getStatusBadgeStyle(order.status);
                        const StatusIcon = statusStyle.icon;
                        const progressColor = getProgressColor(order.progress);
                        
                        return (
                          <tr key={order._id} style={{
                            transition: "all 0.2s ease",
                            borderBottom: "1px solid #f0f0f0"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(11,58,160,0.02)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}>
                            <td className="px-4 py-3">
                              <span className="fw-bold" style={{ color: "#0b3aa0", fontSize: "13px" }}>
                                #{getDisplayOrderId(order._id)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <div style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: "rgba(11,58,160,0.08)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginRight: "10px",
                                  fontSize: "16px"
                                }}>
                                  <Person size={16} />
                                </div>
                                <span className="fw-medium">{order.shopName || "N/A"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <Scissors size={14} className="text-muted me-2" />
                                {order.garment || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex flex-column">
                                <span>{order.fabric || "N/A"}</span>
                                <small style={{ fontSize: "11px", color: "#6c757d" }}>
                                  <Palette size={10} className="me-1" />
                                  {order.color || "N/A"}
                                </small>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="fw-bold">{order.quantity || 0}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <Calendar size={14} className="text-muted me-2" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="badge px-3 py-2" style={{
                                background: statusStyle.bg,
                                color: "white",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                <StatusIcon size={12} />
                                {order.status || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress" style={{ width: "80px", height: "6px" }}>
                                  <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${order.progress || 0}%`, 
                                      backgroundColor: progressColor,
                                      transition: "width 0.3s ease"
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "#495057" }}>
                                  {order.progress || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-end">
                              <span className="fw-bold" style={{ color: "#1a1a2e" }}>
                                LKR {Number(order.amount || 0).toLocaleString()}
                              </span>
                              {order.advancePaid > 0 && (
                                <div style={{ fontSize: "11px", color: "#28a745" }}>
                                  Advance: LKR {Number(order.advancePaid).toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                className="btn btn-sm"
                                onClick={() => handleViewOrder(order._id)}
                                style={{
                                  background: "rgba(11,58,160,0.08)",
                                  borderRadius: "8px",
                                  padding: "6px 12px",
                                  border: "none",
                                  color: "#0b3aa0",
                                  transition: "all 0.2s ease"
                                }}
                                title="View Order"
                              >
                                <Eye size={16} />
                              </button>
                              
                              <button
                                className="btn btn-sm ms-1"
                                onClick={() => handleEditOrder(order._id)}
                                style={{
                                  background: "rgba(40,167,69,0.08)",
                                  borderRadius: "8px",
                                  padding: "6px 12px",
                                  border: "none",
                                  color: "#28a745",
                                  transition: "all 0.2s ease"
                                }}
                                title="Edit Order"
                              >
                                <Pencil size={16} />
                              </button>
                              
                              <button
                                className="btn btn-sm ms-1"
                                onClick={() => handleDeleteOrder(order._id)}
                                disabled={deletingOrderId === order._id}
                                style={{
                                  background: deletingOrderId === order._id ? "rgba(220,53,69,0.3)" : "rgba(220,53,69,0.08)",
                                  borderRadius: "8px",
                                  padding: "6px 12px",
                                  border: "none",
                                  color: "#dc3545",
                                  transition: "all 0.2s ease",
                                  opacity: deletingOrderId === order._id ? 0.6 : 1,
                                  cursor: deletingOrderId === order._id ? "not-allowed" : "pointer"
                                }}
                                title="Delete Order"
                              >
                                {deletingOrderId === order._id ? (
                                  <span className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px" }} />
                                ) : (
                                  <Trash size={16} />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-footer bg-white border-0 px-4 py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <div>
                  <span className="text-muted" style={{ fontSize: "14px" }}>
                    Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> entries
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm px-3 py-1" style={{
                    borderRadius: "8px",
                    border: "2px solid #e9ecef",
                    background: "white",
                    color: "#6c757d",
                    fontWeight: "500",
                    fontSize: "13px"
                  }} disabled>Previous</button>
                  <button className="btn btn-sm px-3 py-1" style={{
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    color: "white",
                    fontWeight: "500",
                    fontSize: "13px"
                  }}>1</button>
                  <button className="btn btn-sm px-3 py-1" style={{
                    borderRadius: "8px",
                    border: "2px solid #e9ecef",
                    background: "white",
                    color: "#6c757d",
                    fontWeight: "500",
                    fontSize: "13px"
                  }}>2</button>
                  <button className="btn btn-sm px-3 py-1" style={{
                    borderRadius: "8px",
                    border: "2px solid #e9ecef",
                    background: "white",
                    color: "#6c757d",
                    fontWeight: "500",
                    fontSize: "13px"
                  }}>Next</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              className="btn px-4 py-2"
              style={{
                background: "rgba(108,117,125,0.1)",
                color: "#6c757d",
                borderRadius: "12px",
                border: "none",
                fontWeight: "500",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "#0b3aa0" }}>
                  Order Details #{getDisplayOrderId(selectedOrder._id)}
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowViewModal(false)}
                />
              </div>
              <div className="modal-body" style={{ padding: "24px" }}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Shop Name</small>
                      <h6 className="mb-0">{selectedOrder.shopName || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Garment</small>
                      <h6 className="mb-0">{selectedOrder.garment || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Fabric</small>
                      <h6 className="mb-0">{selectedOrder.fabric || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Color</small>
                      <h6 className="mb-0">{selectedOrder.color || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Quantity</small>
                      <h6 className="mb-0">{selectedOrder.quantity || 0}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Amount</small>
                      <h6 className="mb-0" style={{ color: "#0b3aa0" }}>LKR {Number(selectedOrder.amount || 0).toLocaleString()}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Advance Paid</small>
                      <h6 className="mb-0" style={{ color: "#28a745" }}>LKR {Number(selectedOrder.advancePaid || 0).toLocaleString()}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Balance Payment</small>
                      <h6 className="mb-0" style={{ color: "#dc3545" }}>LKR {Number(selectedOrder.balancePayment || 0).toLocaleString()}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Payment Method</small>
                      <h6 className="mb-0">{selectedOrder.paymentMethod || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Payment Status</small>
                      <h6 className="mb-0">
                        <span className="badge" style={{
                          background: selectedOrder.paymentStatus === "Paid" ? "#28a745" : 
                                     selectedOrder.paymentStatus === "Partial" ? "#ffc107" : "#dc3545",
                          color: "white",
                          padding: "4px 12px"
                        }}>
                          {selectedOrder.paymentStatus || "Unpaid"}
                        </span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Status</small>
                      <h6 className="mb-0">
                        <span className="badge" style={{
                          background: getStatusBadgeStyle(selectedOrder.status).bg,
                          color: "white",
                          padding: "4px 12px"
                        }}>
                          {selectedOrder.status || "N/A"}
                        </span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Progress</small>
                      <h6 className="mb-0">
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress" style={{ width: "100px", height: "8px" }}>
                            <div className="progress-bar" style={{ 
                              width: `${selectedOrder.progress || 0}%`,
                              backgroundColor: getProgressColor(selectedOrder.progress)
                            }} />
                          </div>
                          {selectedOrder.progress || 0}%
                        </div>
                      </h6>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Notes</small>
                      <p className="mb-0">{selectedOrder.notes || "No notes"}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
                      <small className="text-muted">Created At</small>
                      <p className="mb-0">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button 
                  className="btn px-4" 
                  onClick={() => setShowViewModal(false)}
                  style={{
                    borderRadius: "10px",
                    background: "#f8f9fa",
                    color: "#495057"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editFormData && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <form onSubmit={handleUpdateOrder}>
                <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                  <h5 className="modal-title fw-bold" style={{ color: "#0b3aa0" }}>
                    Edit Order #{getDisplayOrderId(editFormData._id)}
                  </h5>
                  <button 
                    type="button"
                    className="btn-close" 
                    onClick={() => setShowEditModal(false)}
                  />
                </div>
                <div className="modal-body" style={{ padding: "24px" }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Shop Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.shopName || ""}
                        onChange={(e) => setEditFormData({...editFormData, shopName: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Garment</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.garment || ""}
                        onChange={(e) => setEditFormData({...editFormData, garment: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Fabric</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.fabric || ""}
                        onChange={(e) => setEditFormData({...editFormData, fabric: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Color</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.color || ""}
                        onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.quantity || 0}
                        onChange={(e) => setEditFormData({...editFormData, quantity: parseInt(e.target.value)})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Amount (LKR)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.amount || 0}
                        onChange={(e) => setEditFormData({...editFormData, amount: parseFloat(e.target.value)})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Advance Paid (LKR)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.advancePaid || 0}
                        onChange={(e) => setEditFormData({...editFormData, advancePaid: parseFloat(e.target.value)})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Balance Payment (LKR)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.balancePayment || 0}
                        onChange={(e) => setEditFormData({...editFormData, balancePayment: parseFloat(e.target.value)})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Payment Method</label>
                      <select
                        className="form-select"
                        value={editFormData.paymentMethod || ""}
                        onChange={(e) => setEditFormData({...editFormData, paymentMethod: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      >
                        <option value="">Select Method</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Payment Status</label>
                      <select
                        className="form-select"
                        value={editFormData.paymentStatus || ""}
                        onChange={(e) => setEditFormData({...editFormData, paymentStatus: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Status</label>
                      <select
                        className="form-select"
                        value={editFormData.status || ""}
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Progress (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={editFormData.progress || 0}
                        onChange={(e) => setEditFormData({...editFormData, progress: parseInt(e.target.value)})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editFormData.notes || ""}
                        onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                  <button 
                    type="button"
                    className="btn px-4" 
                    onClick={() => setShowEditModal(false)}
                    style={{
                      borderRadius: "10px",
                      background: "#f8f9fa",
                      color: "#495057"
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn px-4"
                    style={{
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      color: "white",
                      border: "none"
                    }}
                  >
                    Update Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;