import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Adminsidebar from "../components/Adminsidebar";
import Admintopbar from "../components/Admintopbar";
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  BoxSeam,
  Gear,
  CheckCircle,
  PauseCircle,
  GraphUp,
  PlusCircle
} from 'react-bootstrap-icons';

function AdminProduction() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Stats Data
  const stats = [
    { 
      label: 'Total Orders', 
      value: '24', 
      change: '+20.0%', 
      trend: 'up',
      icon: <BoxSeam size={22} color="#6366f1" />,
      bg: '#eef2ff'
    },
    { 
      label: 'In Production', 
      value: '10', 
      change: '+11.1%', 
      trend: 'up',
      icon: <Gear size={22} color="#f59e0b" />,
      bg: '#fffbeb'
    },
    { 
      label: 'Completed', 
      value: '12', 
      change: '+33.3%', 
      trend: 'up',
      icon: <CheckCircle size={22} color="#10b981" />,
      bg: '#ecfdf5'
    },
    { 
      label: 'On Hold', 
      value: '2', 
      change: '-33.3%', 
      trend: 'down',
      icon: <PauseCircle size={22} color="#ef4444" />,
      bg: '#fef2f2'
    },
    { 
      label: 'Avg. Progress', 
      value: '62%', 
      change: '+8.5%', 
      trend: 'up',
      icon: <GraphUp size={22} color="#8b5cf6" />,
      bg: '#f5f3ff'
    }
  ];

  // Production Status Data
  const productionStatus = [
    { label: 'In Production', value: '24', color: '#6366f1' },
    { label: 'Completed', value: '12 (50.0%)', color: '#10b981' },
    { label: 'On Hold', value: '2 (8.3%)', color: '#ef4444' },
    { label: 'Cancelled', value: '0 (0%)', color: '#6b7280' }
  ];

  // Production Progress Data
  const progressItems = [
    { label: '0 (0%)', progress: 0 },
    { label: '25 (100%)', progress: 25 },
    { label: '50 (100%)', progress: 50 },
    { label: '75 (100%)', progress: 75 },
    { label: '100 (100%)', progress: 100 }
  ];

  // Recent Activities Data
  const activities = [
    { 
      text: 'Production order #PO-24-001 completed', 
      time: '2 hours ago',
      icon: <CheckCircle size={16} color="#10b981" />
    },
    { 
      text: 'New production order #PO-24-025 created', 
      time: '5 hours ago',
      icon: <PlusCircle size={16} color="#6366f1" />
    },
    { 
      text: 'Production order #PO-24-020 is on hold', 
      time: '1 day ago',
      icon: <PauseCircle size={16} color="#ef4444" />
    },
    { 
      text: 'Production order #PO-24-018 in progress', 
      time: '2 days ago',
      icon: <Gear size={16} color="#f59e0b" />
    }
  ];

  // Orders Data
  const orders = [
    {
      id: 1,
      orderId: 'PO-24-025',
      product: "Polo T-Shirt",
      sku: 'POLO-T-001',
      quantity: '1,000 Pcs',
      progress: 75,
      status: 'In Production',
      startDate: '20 May 2026',
      dueDate: '05 Jun 2026'
    },
    {
      id: 2,
      orderId: 'PO-24-024',
      product: 'uniform',
      sku: 'UNI-S-002',
      quantity: '500 Pcs',
      progress: 40,
      status: 'In Production',
      startDate: '18 May 2026',
      dueDate: '02 Jun 2026'
    },
    {
      id: 3,
      orderId: 'PO-24-023',
      product: 'Shirt',
      sku: 'SHIRT-F-003',
      quantity: '800 Pcs',
      progress: 100,
      status: 'Completed',
      startDate: '10 May 2026',
      dueDate: '20 May 2026'
    },
    {
      id: 4,
      orderId: 'PO-24-022',
      product: 'Hoodie',
      sku: 'HOODIE-H-004',
      quantity: '600 Pcs',
      progress: 20,
      status: 'In Production',
      startDate: '15 May 2026',
      dueDate: '30 May 2026'
    }
  ];

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    return order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.sku.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const getStatusStyle = (status) => {
    const styles = {
      'In Production': { bg: '#fef3c7', color: '#d97706' },
      'Completed': { bg: '#d1fae5', color: '#059669' },
      'On Hold': { bg: '#fee2e2', color: '#dc2626' },
      'Cancelled': { bg: '#f3f4f6', color: '#6b7280' }
    };
    return styles[status] || styles['In Production'];
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#f59e0b';
    if (progress >= 25) return '#f97316';
    return '#ef4444';
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
              <span style={{ color: '#0b3aa0', fontWeight: '600', fontSize: '14px' }}>Production Management</span>
            </div>

            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>
                Production Management
              </h2>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '0' }}>
                Monitor and manage garment production from start to finish
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

            {/* 3 Cards in one row */}
            <div className="row g-3 mb-4">
              {/* Production Status Card */}
              <div className="col-lg-4">
                <div className="card border-0 h-100" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>
                      Production Status
                    </h6>
                    
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>Total</span>
                    </div>
                    
                    {productionStatus.map((item, index) => (
                      <div key={index} style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: index < productionStatus.length - 1 ? "1px solid #f0f0f0" : "none"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ 
                            width: "8px", 
                            height: "8px", 
                            borderRadius: "50%", 
                            background: item.color 
                          }} />
                          <span style={{ fontSize: "13px", color: "#1a1a2e" }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Production Progress Card */}
              <div className="col-lg-4">
                <div className="card border-0 h-100" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>
                      Production Progress
                    </h6>
                    
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>This Month</span>
                    </div>
                    
                    {progressItems.map((item, index) => (
                      <div key={index} style={{ marginBottom: index < progressItems.length - 1 ? "10px" : "0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ fontSize: "13px", color: "#1a1a2e" }}>{item.label}</span>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: getProgressColor(item.progress) }}>
                            {item.progress}%
                          </span>
                        </div>
                        <div style={{ 
                          width: "100%", 
                          height: "4px", 
                          borderRadius: "2px", 
                          background: "#e9ecef",
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
                <div className="card border-0 h-100" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>
                      Recent Activities
                    </h6>
                    
                    {activities.map((item, index) => (
                      <div key={index} style={{ 
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: index < activities.length - 1 ? "1px solid #f0f0f0" : "none"
                      }}>
                        <div style={{ 
                          width: "28px", 
                          height: "28px", 
                          borderRadius: "50%", 
                          background: "#f8f9fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                          flexShrink: 0
                        }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", color: "#1a1a2e" }}>
                            {item.text}
                          </div>
                          <div style={{ fontSize: "11px", color: "#6c757d", marginTop: "1px" }}>
                            {item.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table Card */}
            <div className="card border-0" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
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
                        color: "#94a3b8"
                      }} 
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search production orders..."
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
                        height: "38px",
                        maxWidth: "400px"
                      }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>#</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>ORDER ID</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>PRODUCT</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>STYLE / SKU</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>QUANTITY</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>PROGRESS</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>STATUS</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>START DATE</th>
                        <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>DUE DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order, index) => {
                        const statusStyle = getStatusStyle(order.status);
                        const progressColor = getProgressColor(order.progress);
                        return (
                          <tr key={order.id}>
                            <td style={{ padding: "8px 10px", color: "#94a3b8" }}>
                              {indexOfFirstOrder + index + 1}
                            </td>
                            <td style={{ padding: "8px 10px", fontWeight: "600", color: "#6366f1" }}>
                              {order.orderId}
                            </td>
                            <td style={{ padding: "8px 10px" }}>{order.product}</td>
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>{order.sku}</td>
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>{order.quantity}</td>
                            <td style={{ padding: "8px 10px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: "60px", height: "5px", borderRadius: "3px", background: "#e9ecef", overflow: "hidden" }}>
                                  <div style={{ width: `${order.progress}%`, height: "100%", background: progressColor }} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: progressColor }}>
                                  {order.progress}%
                                </span>
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
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>{order.startDate}</td>
                            <td style={{ padding: "8px 10px", color: "#64748b" }}>{order.dueDate}</td>
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
                      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                        const pageNum = index + 1;
                        if (pageNum > 5) return null;
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              padding: "4px 12px",
                              border: currentPage === pageNum ? "none" : "1px solid #e9ecef",
                              borderRadius: "6px",
                              background: currentPage === pageNum ? "#6366f1" : "white",
                              color: currentPage === pageNum ? "white" : "#1a1a2e",
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
                          <span style={{ padding: "4px 8px", color: "#94a3b8", fontSize: "13px" }}>...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            style={{
                              padding: "4px 12px",
                              border: currentPage === totalPages ? "none" : "1px solid #e9ecef",
                              borderRadius: "6px",
                              background: currentPage === totalPages ? "#6366f1" : "white",
                              color: currentPage === totalPages ? "white" : "#1a1a2e",
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

export default AdminProduction;