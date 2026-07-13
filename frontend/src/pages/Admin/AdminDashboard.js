// src/pages/Admin/AdminDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Adminsidebar from "../../components/Adminsidebar";
import Admintopbar from "../../components/Admintopbar";
import { 
  People, 
  Clipboard, 
  Wallet2, 
  Box, 
  ExclamationTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  ThreeDotsVertical,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'react-bootstrap-icons';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  // Stats Data
  const stats = [
    { 
      label: 'Total Users', 
      value: '1,248', 
      change: '+12.5%', 
      trend: 'up',
      icon: People, 
      color: '#6366f1', 
      bg: 'rgba(99,102,241,0.1)' 
    },
    { 
      label: 'Total Orders', 
      value: '2,456', 
      change: '+18.3%', 
      trend: 'up',
      icon: Clipboard, 
      color: '#f59e0b', 
      bg: 'rgba(245,158,11,0.1)' 
    },
    { 
      label: 'Total Revenue', 
      value: 'LKR 4,850,000', 
      change: '+15.7%', 
      trend: 'up',
      icon: Wallet2, 
      color: '#10b981', 
      bg: 'rgba(16,185,129,0.1)' 
    },
    { 
      label: 'Products', 
      value: '856', 
      change: '+8.2%', 
      trend: 'up',
      icon: Box, 
      color: '#8b5cf6', 
      bg: 'rgba(139,92,246,0.1)' 
    },
    { 
      label: 'Low Stock Items', 
      value: '23', 
      change: '-5.3%', 
      trend: 'down',
      icon: ExclamationTriangle, 
      color: '#ef4444', 
      bg: 'rgba(239,68,68,0.1)' 
    }
  ];

  // Chart Data
  const chartData = {
    labels: ['Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'Apr 30'],
    datasets: [
      {
        label: 'Revenue',
        data: [450000, 580000, 620000, 750000, 890000, 720000, 950000],
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return 'LKR ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          },
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000) + 'M';
            if (value >= 1000) return (value / 1000) + 'K';
            return value;
          }
        }
      }
    }
  };

  // Recent Orders
  const recentOrders = [
    { id: 'ORD-2026-001', customer: 'Saman Perera', amount: 'LKR 750,000', status: 'Processing', statusColor: '#f59e0b', date: '15 Apr 2026' },
    { id: 'ORD-2026-002', customer: 'Nimal Fernando', amount: 'LKR 450,000', status: 'Completed', statusColor: '#10b981', date: '14 Apr 2026' },
    { id: 'ORD-2026-003', customer: 'Kamal Dewasiri', amount: 'LKR 320,000', status: 'Pending', statusColor: '#6366f1', date: '14 Apr 2026' },
    { id: 'ORD-2026-004', customer: 'Supun Weerasinghe', amount: 'LKR 620,000', status: 'Completed', statusColor: '#10b981', date: '13 Apr 2026' },
    { id: 'ORD-2026-005', customer: 'Dilshan Jayawardana', amount: 'LKR 280,000', status: 'Cancelled', statusColor: '#ef4444', date: '12 Apr 2026' }
  ];

  // Top Selling Products
  const topProducts = [
    { name: 'School Uniform', sold: 850, revenue: 'LKR 1,275,000' },
    { name: 'Sport T-Shirt', sold: 620, revenue: 'LKR 806,000' },
    { name: 'Polo Shirt', sold: 480, revenue: 'LKR 648,000' },
    { name: 'Hoodie', sold: 320, revenue: 'LKR 672,000' },
    { name: 'Trouser', sold: 280, revenue: 'LKR 448,000' }
  ];

  // User Role Distribution
  const roles = [
    { name: 'Shop Owners', count: 328, percentage: 26.3, color: '#6366f1' },
    { name: 'Staff', count: 568, percentage: 45.5, color: '#f59e0b' },
    { name: 'Admins', count: 352, percentage: 28.2, color: '#10b981' }
  ];

  // Activity Feed
  const activities = [
    { icon: '👤', text: 'New user registered: Saman Perera', time: '2 minutes ago', color: '#6366f1' },
    { icon: '📦', text: 'Order ORD-2026-001 has been placed', time: '10 minutes ago', color: '#f59e0b' },
    { icon: '📊', text: 'Product "Hoodie" stock updated', time: '25 minutes ago', color: '#8b5cf6' },
    { icon: '⚙️', text: 'Admin user updated system settings', time: '1 hour ago', color: '#10b981' },
    { icon: '⚠️', text: 'Low stock alert: 23 items', time: '2 hours ago', color: '#ef4444' }
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f0f5" }}>
      <Adminsidebar />
      
      <div className="flex-grow-1">
        {/* ✅ Added Admintopbar */}
        <Admintopbar />
        
        <div style={{ padding: "24px" }}>
          <div className="container-fluid px-0">
            
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e", fontSize: "28px" }}>
                  Dashboard
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                  Welcome back, Admin! Here's what's happening with your store.
                </p>
              </div>
              <div className="d-flex gap-2">
                <select 
                  className="form-select" 
                  style={{ 
                    borderRadius: "10px", 
                    border: "2px solid #e9ecef",
                    fontSize: "13px",
                    padding: "8px 32px 8px 16px",
                    width: "150px"
                  }}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option>Today</option>
                  <option>This Week</option>
                  {/* ✅ Removed 'selected' attribute */}
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
                <button 
                  className="btn px-4" 
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  Export Report
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className="col-xl-2 col-lg-3 col-md-6 col-sm-12">
                  <div 
                    className="card border-0 h-100" 
                    style={{ 
                      borderRadius: "14px", 
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500" }}>
                            {stat.label}
                          </div>
                          <div className="fw-bold" style={{ fontSize: "24px", color: "#1a1a2e", marginTop: "4px" }}>
                            {stat.value}
                          </div>
                        </div>
                        <div style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: stat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <stat.icon size={20} style={{ color: stat.color }} />
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-1">
                        {stat.trend === 'up' ? (
                          <ArrowUp size={14} color="#10b981" />
                        ) : (
                          <ArrowDown size={14} color="#ef4444" />
                        )}
                        <span style={{ 
                          fontSize: "12px", 
                          color: stat.trend === 'up' ? "#10b981" : "#ef4444",
                          fontWeight: "600",
                          marginLeft: "4px"
                        }}>
                          {stat.change}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "6px" }}>
                          vs last month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-3">
              {/* Chart Section */}
              <div className="col-lg-8">
                <div className="card border-0" style={{ 
                  borderRadius: "16px", 
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  height: "100%"
                }}>
                  <div className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>Sales Overview</h5>
                      <span style={{ fontSize: "12px", color: "#6c757d" }}>Revenue trend for {selectedPeriod}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: "8px", fontSize: "12px" }}>Week</button>
                      <button className="btn btn-sm" style={{ 
                        background: "#6366f1", 
                        color: "white", 
                        borderRadius: "8px", 
                        fontSize: "12px",
                        border: "none"
                      }}>Month</button>
                      <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: "8px", fontSize: "12px" }}>Year</button>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div style={{ height: "280px" }}>
                    {/* <Line data={chartData} options={chartOptions} /> */}
                    <div
  style={{
    height: "280px",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px"
  }}
>
  Chart Coming Soon
</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* This Month Stats */}
              <div className="col-lg-4">
                <div className="card border-0" style={{ 
                  borderRadius: "16px", 
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  height: "100%"
                }}>
                  <div className="card-header bg-white border-0 px-4 py-3">
                    <h5 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>This Month</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="text-center">
                      <div style={{ fontSize: "13px", color: "#6c757d" }}>Today's Revenue</div>
                      <div className="fw-bold" style={{ fontSize: "32px", color: "#1a1a2e" }}>
                        LKR 750,000
                      </div>
                      <div className="mt-2">
                        <span className="badge" style={{ 
                          background: "rgba(16,185,129,0.1)", 
                          color: "#10b981",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px"
                        }}>
                          ↑ 15.7% from yesterday
                        </span>
                      </div>
                      <hr className="my-3" />
                      <div className="text-start">
                        <div className="d-flex justify-content-between mb-2">
                          <span style={{ fontSize: "13px", color: "#6c757d" }}>Total Orders</span>
                          <span className="fw-bold" style={{ fontSize: "14px" }}>2,456</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span style={{ fontSize: "13px", color: "#6c757d" }}>Avg. Order Value</span>
                          <span className="fw-bold" style={{ fontSize: "14px" }}>LKR 1,975</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span style={{ fontSize: "13px", color: "#6c757d" }}>Conversion Rate</span>
                          <span className="fw-bold" style={{ fontSize: "14px", color: "#10b981" }}>4.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders & User Distribution */}
            <div className="row g-3 mt-3">
              <div className="col-lg-8">
                <div className="card border-0" style={{ 
                  borderRadius: "16px", 
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  <div className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>Recent Orders</h5>
                    <button 
                      className="btn btn-sm" 
                      style={{ 
                        color: "#6366f1", 
                        fontWeight: "600",
                        fontSize: "13px",
                        background: "transparent",
                        border: "none"
                      }}
                      onClick={() => navigate('/orders')}
                    >
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead style={{ background: "#f8f9fa" }}>
                          <tr>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold">Order ID</th>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold">Customer</th>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold">Amount</th>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold">Status</th>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <span className="fw-bold" style={{ color: "#6366f1", fontSize: "13px" }}>
                                  {order.id}
                                </span>
                              </td>
                              <td className="px-4 py-3">{order.customer}</td>
                              <td className="px-4 py-3 fw-bold">{order.amount}</td>
                              <td className="px-4 py-3">
                                <span className="badge" style={{
                                  background: `${order.statusColor}20`,
                                  color: order.statusColor,
                                  padding: "5px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "500"
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-muted" style={{ fontSize: "13px" }}>{order.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0" style={{ 
                  borderRadius: "16px", 
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  <div className="card-header bg-white border-0 px-4 py-3">
                    <h5 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>User Role Distribution</h5>
                  </div>
                  <div className="card-body p-4">
                    {roles.map((role, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span style={{ fontSize: "14px", color: "#1a1a2e" }}>{role.name}</span>
                          <span className="fw-bold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
                            {role.count} <span style={{ fontSize: "12px", color: "#6c757d", fontWeight: "400" }}>({role.percentage}%)</span>
                          </span>
                        </div>
                        <div className="progress" style={{ height: "8px", borderRadius: "10px", background: "#f0f0f5" }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${role.percentage}%`, 
                              background: role.color,
                              borderRadius: "10px",
                              transition: "width 1s ease"
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products & Activity */}
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <div className="card border-0" style={{ 
                  borderRadius: "16px", 
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  <div className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>Top Selling Products</h5>
                    <button 
                      className="btn btn-sm" 
                      style={{ 
                        color: "#6366f1", 
                        fontWeight: "600",
                        fontSize: "13px",
                        background: "transparent",
                        border: "none"
                      }}
                      onClick={() => navigate('/products')}
                    >
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead style={{ background: "#f8f9fa" }}>
                          <tr>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold">Product</th>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold text-center">Sold</th>
                            <th className="px-4 py-3 small text-uppercase text-muted fw-bold text-end">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((product, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <span className="fw-medium">{product.name}</span>
                              </td>
                              <td className="px-4 py-3 text-center fw-bold">{product.sold}</td>
                              <td className="px-4 py-3 text-end fw-bold" style={{ color: "#10b981" }}>
                                {product.revenue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0" style={{ 
                  borderRadius: "16px", 
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  <div className="card-header bg-white border-0 px-4 py-3">
                    <h5 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>System Activity</h5>
                  </div>
                  <div className="card-body p-4" style={{ maxHeight: "290px", overflowY: "auto" }}>
                    {activities.map((activity, index) => (
                      <div key={index} className="d-flex align-items-start mb-3 pb-3" style={{ 
                        borderBottom: index < activities.length - 1 ? "1px solid #f0f0f5" : "none" 
                      }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: `${activity.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          marginRight: "12px",
                          flexShrink: 0
                        }}>
                          {activity.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", color: "#1a1a2e" }}>
                            {activity.text}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6c757d" }}>
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Fixed: Export matches the file name (AdminDashboard)
export default AdminDashboard;