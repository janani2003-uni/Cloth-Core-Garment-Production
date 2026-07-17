
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Search, 
  Filter, 
  Plus, 
  Bell, 
  ChevronDown,
  Eye,
  Download,
  ThreeDotsVertical,
  ExclamationCircle,
  CheckCircle,
  Clock,
  GraphUp,
  Box,
  Person,
  Wallet2,
  Calendar,
  XCircle
} from "react-bootstrap-icons";
import logo from "../assets/logo.png";

function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
const [showModal, setShowModal] = useState(false);

  

  const stats = [
  {
    label: "Total Orders",
    value: orders.length,
    icon: Box,
    color: "#0b3aa0",
    bg: "rgba(11,58,160,0.1)",
  },
  {
    label: "Pending Orders",
    value: orders.filter(order => order.status === "Pending").length,
    icon: Clock,
    color: "#f57c00",
    bg: "rgba(245,124,0,0.1)",
  },
  {
    label: "Completed",
    value: orders.filter(order => order.status === "Completed").length,
    icon: CheckCircle,
    color: "#2e7d32",
    bg: "rgba(46,125,50,0.1)",
  },
  {
    label: "Revenue",
    value: `LKR ${orders
  .filter(
    order =>
      order.paymentStatus === "Paid" &&
      order.status === "Completed"
  )
  .reduce((sum, order) => sum + Number(order.amount || 0), 0)
  .toLocaleString()}`,
    icon: Wallet2,
    color: "#0b3aa0",
    bg: "rgba(11,58,160,0.1)",
  },
];
  const fetchOrders = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/orders");

    const user = JSON.parse(localStorage.getItem("user"));

    const myOrders = response.data.data.filter(
      (order) => order.shopName === user.factoryName
    );

    console.table(
  myOrders.map(order => ({
    id: order._id,
    status: order.status,
    shop: order.shopName
  }))
);
    setOrders(myOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};
const downloadInvoice = (order) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("ClothCore Invoice", 70, 20);

  doc.setFontSize(12);

  autoTable(doc, {
    startY: 35,
    head: [["Field", "Value"]],
    body: [
      ["Shop Name", order.shopName],
      ["Garment", order.garment],
      ["Fabric", order.fabric],
      ["Color", order.color],
      ["Quantity", order.quantity],
      ["Amount", `Rs. ${order.amount}`],
      ["Payment Method", order.paymentMethod],
      ["Payment Status", order.paymentStatus],
      ["Order Status", order.status],
    ],
  });

  doc.save(`Invoice_${order.shopName}.pdf`);
};
   useEffect(() => {
  fetchOrders();
}, []);
  const getStatusBadgeStyle = (type) => {
    const styles = {
      danger: { bg: "linear-gradient(135deg, #dc3545, #c62828)", icon: ExclamationCircle },
      success: { bg: "linear-gradient(135deg, #28a745, #1e7e34)", icon: CheckCircle },
      warning: { bg: "linear-gradient(135deg, #ffc107, #f57c00)", icon: Clock },
      info: { bg: "linear-gradient(135deg, #17a2b8, #0d6efd)", icon: GraphUp }
    };
    return styles[type] || styles.info;

  };
    const filteredOrders = orders.filter((order) => {
  const matchesSearch =
    order.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.garment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order._id.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesFilter =
    statusFilter === "All" || order.status === statusFilter;

  return matchesSearch && matchesFilter;
});
  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ padding: "20px" }}>
        <div className="container-fluid px-0">
          {/* Top Navigation Bar - Simplified */}
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
                {/* Notifications */}
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

                {/* User Profile */}
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
                      {JSON.parse(localStorage.getItem("user"))?.factoryName}
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
            
            {/* Card Header with Search & Filter */}
            <div className="card-header bg-white border-0 px-4 py-4">
              <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center gap-3">
                {/* Search */}
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
                    placeholder="Search orders..."
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

                {/* Filter & Actions */}
                <div className="d-flex gap-2">
                  <select
  className="form-select"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  style={{
    width: "170px",
    borderRadius: "12px",
    border: "2px solid #e9ecef",
    fontSize: "14px",
    fontWeight: "500",
    height: "44px",
  }}
>
  <option value="All">All Orders</option>
  <option value="Pending">Pending</option>
  <option value="Cancelled">Cancelled</option>
  <option value="Completed">Completed</option>
</select>
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
                        Item
                      </th>
                      <th className="px-4 py-3 fw-bold text-center" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Quantity
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Date
                      </th>
                      <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Status
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
                    {filteredOrders.map((order, index) => {
                      const statusType =
  order.status === "Cancelled"
    ? "danger"
    : order.status === "Completed"
    ? "success"
    : order.status === "Pending"
    ? "warning"
    : "info";

const statusStyle = getStatusBadgeStyle(statusType);
                      const StatusIcon = statusStyle.icon;
                      
                      return (
                        <tr key={index} style={{
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
                              {order._id.slice(-6).toUpperCase()}
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
                                <Box size={18} color="#0b3aa0" />
                              </div>
                              <span className="fw-medium">{order.shopName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{order.garment}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="fw-bold">{order.quantity}</span>
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
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <span className="fw-bold" style={{ color: "#1a1a2e" }}>
                              Rs. {order.amount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                           <button
  className="btn btn-sm"
  style={{
    background: "rgba(11,58,160,0.08)",
    borderRadius: "8px",
    padding: "6px 12px",
    border: "none",
    color: "#0b3aa0",
    transition: "all 0.2s ease"
  }}
  onClick={() => navigate(`/order-details/${order._id}`)}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(11,58,160,0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "rgba(11,58,160,0.08)";
  }}
>
  <Eye size={16} />
</button>
                            <button
  className="btn btn-sm ms-1"
  style={{
    background: "rgba(220,53,69,0.08)",
    borderRadius: "8px",
    padding: "6px 12px",
    border: "none",
    color: "#dc3545",
    transition: "all 0.2s ease",
  }}
  onClick={async () => {
  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this order?"
  );

  if (!confirmCancel) return;

  try {
    await axios.patch(
      `http://localhost:5000/api/orders/${order._id}/cancel`
    );

    alert("Order cancelled successfully!");

    fetchOrders();
  } catch (error) {
    console.error(error);
    alert("Failed to cancel order.");
  }
}}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(220,53,69,0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "rgba(220,53,69,0.08)";
  }}
>
  <XCircle size={16} />
</button>

<button
  className="btn btn-sm ms-1"
  style={{
    background: "rgba(108,117,125,0.08)",
    borderRadius: "8px",
    padding: "6px 12px",
    border: "none",
    color: "#6c757d",
    transition: "all 0.2s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(108,117,125,0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "rgba(108,117,125,0.08)";
  }}
>
  <ThreeDotsVertical size={16} />
</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Footer */}
            <div className="card-footer bg-white border-0 px-4 py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <div>
                  <span className="text-muted" style={{ fontSize: "14px" }}>
                    Showing <strong>{filteredOrders.length}</strong> of <strong>{filteredOrders.length}</strong> entries
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm px-3 py-1"
                    style={{
                      borderRadius: "8px",
                      border: "2px solid #e9ecef",
                      background: "white",
                      color: "#6c757d",
                      fontWeight: "500",
                      fontSize: "13px"
                    }}
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm px-3 py-1"
                    style={{
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      color: "white",
                      fontWeight: "500",
                      fontSize: "13px"
                    }}
                  >
                    1
                  </button>
                  <button
                    className="btn btn-sm px-3 py-1"
                    style={{
                      borderRadius: "8px",
                      border: "2px solid #e9ecef",
                      background: "white",
                      color: "#6c757d",
                      fontWeight: "500",
                      fontSize: "13px"
                    }}
                  >
                    2
                  </button>
                  <button
                    className="btn btn-sm px-3 py-1"
                    style={{
                      borderRadius: "8px",
                      border: "2px solid #e9ecef",
                      background: "white",
                      color: "#6c757d",
                      fontWeight: "500",
                      fontSize: "13px"
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(108,117,125,0.2)";
                e.currentTarget.style.transform = "translateX(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(108,117,125,0.1)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  
  );
}

export default Orders;