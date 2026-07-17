import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Adminsidebar from "../../components/Adminsidebar";
import Admintopbar from "../../components/Admintopbar";
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  ThreeDotsVertical,
  ArrowUp,
  ArrowDown,
  Box,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  Send,
  CreditCard,
  Printer,
  Trash,
  Filter
} from 'react-bootstrap-icons';

function AdminOrders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPayment, setSelectedPayment] = useState('All Payment');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const ordersPerPage = 6;
  const [orders, setOrders] = useState([]);
const [stats, setStats] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Stats Data
const statsData = [

    { 
      label: 'Total Orders', 
      value: '145', 
      change: '+18.4%', 
      trend: 'up',
      icon: <Box size={22} color="#6366f1" />,
      bg: '#eef2ff'
    },
    { 
      label: 'Pending Approval', 
      value: '18', 
      change: '+5.4%', 
      trend: 'up',
      icon: <Clock size={22} color="#f59e0b" />,
      bg: '#fffbeb'
    },
    { 
      label: 'In Production', 
      value: '42', 
      change: '+12.2%', 
      trend: 'up',
      icon: <CheckCircle size={22} color="#10b981" />,
      bg: '#ecfdf5'
    },
    { 
      label: 'Completed', 
      value: '70', 
      change: '+22.5%', 
      trend: 'up',
      icon: <CheckCircle size={22} color="#8b5cf6" />,
      bg: '#f5f3ff'
    },
    { 
      label: 'Cancelled', 
      value: '15', 
      change: '-8.3%', 
      trend: 'down',
      icon: <XCircle size={22} color="#ef4444" />,
      bg: '#fef2f2'
    }
  ];

  // Orders Data
  useEffect(() => {
  loadOrders();
  loadStats();
}, []);

const loadOrders = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/orders");
    setOrders(res.data.data);
  } catch (err) {
    console.log(err);
  }
};

const loadStats = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/orders/dashboard/stats"
    );
    setStats(res.data);
  } catch (err) {
    console.log(err);
  }
};
  // Filter orders based on search
const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || order.status === selectedStatus;
    const matchesPayment = selectedPayment === 'All Payment' || order.payment === selectedPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const getStatusStyle = (status) => {
    const styles = {
      'Pending Approval': { bg: '#fef3c7', color: '#d97706' },
      'Approved': { bg: '#e0e7ff', color: '#6366f1' },
      'Waiting Payment': { bg: '#fef3c7', color: '#d97706' },
      'In Production': { bg: '#d1fae5', color: '#059669' },
      'Completed': { bg: '#f5f3ff', color: '#8b5cf6' },
      'Cancelled': { bg: '#fee2e2', color: '#dc2626' }
    };
    return styles[status] || styles['Pending Approval'];
  };

  const getPaymentStyle = (payment) => {
    const styles = {
      'Paid': { bg: '#d1fae5', color: '#059669' },
      'Pending': { bg: '#fef3c7', color: '#d97706' }
    };
    return styles[payment] || styles['Pending'];
  };

  const statuses = ['All Status', 'Pending Approval', 'Approved', 'Waiting Payment', 'In Production', 'Completed', 'Cancelled'];
  const payments = ['All Payment', 'Paid', 'Pending'];
  const periods = ['This Month', 'This Week', 'Today'];

  // Action Handlers - FIXED for navigation
  const handleActionClick = (action, orderId) => {
    setOpenDropdown(null);
    
    if (action === 'View Details') {
      // Navigate to order details page
      navigate('/admin/order-details', { state: { orderId } });
      return;
    }
    
    // Other actions show alert
    const actionMessages = {
      'Approve Order': `Order ${orderId} has been approved!`,
      'Send to Production': `Order ${orderId} has been sent to production!`,
      'Payment Details': `Viewing payment details for Order: ${orderId}`,
      'Print Invoice': `Printing invoice for Order: ${orderId}`,
      'Cancel Order': `Order ${orderId} has been cancelled!`
    };
    alert(actionMessages[action] || `${action} clicked for Order: ${orderId}`);
  };

  const toggleDropdown = (orderId) => {
    if (openDropdown === orderId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(orderId);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Adminsidebar />
      
      <div className="flex-grow-1">
        <Admintopbar />
        
        <div style={{ padding: "24px" }}>
          <div className="container-fluid px-0">
            
            {/* Breadcrumb */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Dashboard</span>
              <span style={{ color: '#6c757d', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: '#0b3aa0', fontWeight: '600', fontSize: '14px' }}>Orders Management</span>
            </div>

            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>
                Orders Management
              </h2>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '0' }}>
                Manage customer orders and track their status
              </p>
            </div>

            {/* Stats Cards - 5 in a row */}
            <div className="row g-3 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className="col-xl-2 col-lg-3 col-md-6 col-sm-12">
                  <div className="card border-0 h-100" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
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
                      <div style={{ fontSize: "12px", color: "#6c757d", fontWeight: "500", marginBottom: "2px" }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e" }}>
                        {stat.value}
                      </div>
                      <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        {stat.trend === 'up' ? (
                          <ArrowUp size={12} color="#10b981" />
                        ) : (
                          <ArrowDown size={12} color="#ef4444" />
                        )}
                        <span style={{ 
                          fontSize: "12px", 
                          fontWeight: "500", 
                          color: stat.trend === 'up' ? '#10b981' : '#ef4444'
                        }}>
                          {stat.change}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6c757d" }}>
                          vs last month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Orders Table Card */}
            <div className="card border-0" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="card-body">
                {/* Search and Filters */}
                <div style={{ marginBottom: "16px" }}>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <div className="position-relative">
                        <Search 
                          size={16} 
                          style={{ 
                            position: "absolute", 
                            left: "12px", 
                            top: "50%", 
                            transform: "translateY(-50%)",
                            color: "#94a3b8"
                          }} 
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by Order ID / Customer / Phone..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          style={{
                            paddingLeft: "36px",
                            borderRadius: "8px",
                            border: "1px solid #e9ecef",
                            fontSize: "13px",
                            height: "38px"
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                          fontSize: "12px",
                          height: "38px"
                        }}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={selectedPayment}
                        onChange={(e) => {
                          setSelectedPayment(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                          fontSize: "12px",
                          height: "38px"
                        }}
                      >
                        {payments.map(payment => (
                          <option key={payment} value={payment}>{payment}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                          fontSize: "12px",
                          height: "38px"
                        }}
                      >
                        {periods.map(period => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button 
                        className="btn w-100"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                          fontSize: "12px",
                          height: "38px",
                          background: "white",
                          color: "#1a1a2e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('All Status');
                          setSelectedPayment('All Payment');
                          setSelectedPeriod('This Month');
                          setCurrentPage(1);
                        }}
                      >
                        <Filter size={14} />
                        Filter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>#</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>ORDER ID</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>CUSTOMER</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>SHOP</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>TOTAL QTY</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>ORDER DATE</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>PAYMENT</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>STATUS</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d", textAlign: "center" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order, index) => {
                        const statusStyle = getStatusStyle(order.status);
                        const paymentStyle = getPaymentStyle(order.payment);
                        const isOpen = openDropdown === order.id;
                        return (
                          <tr key={order.id}>
                            <td style={{ padding: "8px 10px", color: "#94a3b8" }}>
                              {indexOfFirstOrder + index + 1}
                            </td>
                            <td style={{ padding: "8px 10px", fontWeight: "600", color: "#6366f1" }}>
                              {order.orderId}
                            </td>
                            <td style={{ padding: "8px 10px" }}>{order.customer}</td>
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>{order.shop}</td>
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>{order.totalQty}</td>
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>{order.orderDate}</td>
                            <td style={{ padding: "8px 10px" }}>
                              <span style={{
                                padding: "2px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "500",
                                background: paymentStyle.bg,
                                color: paymentStyle.color
                              }}>
                                {order.payment}
                              </span>
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
                            <td style={{ padding: "8px 10px", textAlign: "center" }}>
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <button 
                                  className="btn btn-sm" 
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    color: "#64748b",
                                    cursor: "pointer"
                                  }}
                                  onClick={() => toggleDropdown(order.id)}
                                >
                                  <ThreeDotsVertical size={18} />
                                </button>
                                {isOpen && (
                                  <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '4px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '6px',
                                    minWidth: '200px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    zIndex: 1000,
                                    border: '1px solid #e9ecef'
                                  }}>
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2" 
                                      style={{ 
                                        borderRadius: "8px", 
                                        fontSize: "13px", 
                                        padding: "8px 12px", 
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: "all 0.2s ease",
                                        color: '#1a1a2e'
                                      }}
                                      onClick={() => handleActionClick('View Details', order.orderId)}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <Eye size={14} color="#6366f1" /> View Details
                                    </button>
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2" 
                                      style={{ 
                                        borderRadius: "8px", 
                                        fontSize: "13px", 
                                        padding: "8px 12px", 
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: "all 0.2s ease",
                                        color: '#1a1a2e'
                                      }}
                                      onClick={() => handleActionClick('Approve Order', order.orderId)}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <Check size={14} color="#10b981" /> Approve Order
                                    </button>
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2" 
                                      style={{ 
                                        borderRadius: "8px", 
                                        fontSize: "13px", 
                                        padding: "8px 12px", 
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: "all 0.2s ease",
                                        color: '#1a1a2e'
                                      }}
                                      onClick={() => handleActionClick('Send to Production', order.orderId)}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <Send size={14} color="#f59e0b" /> Send to Production
                                    </button>
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2" 
                                      style={{ 
                                        borderRadius: "8px", 
                                        fontSize: "13px", 
                                        padding: "8px 12px", 
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: "all 0.2s ease",
                                        color: '#1a1a2e'
                                      }}
                                      onClick={() => handleActionClick('Payment Details', order.orderId)}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <CreditCard size={14} color="#8b5cf6" /> Payment Details
                                    </button>
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2" 
                                      style={{ 
                                        borderRadius: "8px", 
                                        fontSize: "13px", 
                                        padding: "8px 12px", 
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: "all 0.2s ease",
                                        color: '#1a1a2e'
                                      }}
                                      onClick={() => handleActionClick('Print Invoice', order.orderId)}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <Printer size={14} color="#6366f1" /> Print Invoice
                                    </button>
                                    <hr style={{ margin: "4px 0" }} />
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2 text-danger" 
                                      style={{ 
                                        borderRadius: "8px", 
                                        fontSize: "13px", 
                                        padding: "8px 12px", 
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: "all 0.2s ease",
                                        color: '#dc2626'
                                      }}
                                      onClick={() => handleActionClick('Cancel Order', order.orderId)}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <Trash size={14} color="#ef4444" /> Cancel Order
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredOrders.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                      Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: "4px 10px",
                          border: "1px solid #e9ecef",
                          borderRadius: "6px",
                          background: "white",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          color: currentPage === 1 ? "#ccc" : "#1a1a2e",
                          fontSize: "13px"
                        }}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {[1, 2, 3, 4, 5].map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: "4px 12px",
                            border: currentPage === page ? "none" : "1px solid #e9ecef",
                            borderRadius: "6px",
                            background: currentPage === page ? "#6366f1" : "white",
                            color: currentPage === page ? "white" : "#1a1a2e",
                            fontWeight: currentPage === page ? "600" : "400",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                        >
                          {page}
                        </button>
                      ))}
                      <span style={{ padding: "4px 4px", color: "#94a3b8", fontSize: "13px" }}>...</span>
                      <button
                        onClick={() => setCurrentPage(25)}
                        style={{
                          padding: "4px 12px",
                          border: currentPage === 25 ? "none" : "1px solid #e9ecef",
                          borderRadius: "6px",
                          background: currentPage === 25 ? "#6366f1" : "white",
                          color: currentPage === 25 ? "white" : "#1a1a2e",
                          fontWeight: currentPage === 25 ? "600" : "400",
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
                      >
                        25
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "4px 10px",
                          border: "1px solid #e9ecef",
                          borderRadius: "6px",
                          background: "white",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          color: currentPage === totalPages ? "#ccc" : "#1a1a2e",
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

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;