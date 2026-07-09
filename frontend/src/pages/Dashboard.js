// src/pages/Dashboard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Search,
  Bell,
  Person,
  ChevronDown,
  Box,
  Clock,
  CheckCircle,
  Eye,
  ArrowRight,
  CreditCard,
  Calendar3,
  Gear,
  BoxArrowRight,
  List,
  BoxSeam,
  X,
  HouseDoorFill,
  QuestionCircle,
  Lock,
  Envelope,
  Telephone,
  Person as PersonIcon,
  Bell as BellIcon,
  Globe2,
  ShieldLock
} from "react-bootstrap-icons";
import logo from "../assets/logo.png";

function Dashboard() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showSecurity, setShowSecurity] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data
  const stats = [
    { label: "Total Orders", value: "2", icon: Box, color: "#0b3aa0", bg: "rgba(11,58,160,0.1)" },
    { label: "Pending Approval", value: "0", icon: Clock, color: "#f57c00", bg: "rgba(245,124,0,0.1)" },
    { label: "In Production", value: "1", icon: BoxSeam, color: "#1976d2", bg: "rgba(25,118,210,0.1)" },
    { label: "Delivered", value: "1", icon: CheckCircle, color: "#2e7d32", bg: "rgba(46,125,50,0.1)" }
  ];

  const recentOrders = [
    { id: "ORD-2026-001", item: "School Uniform", qty: 500, status: "Production", statusType: "warning", amount: "LKR 750,000" },
    { id: "ORD-2026-004", item: "Sport T-Shirt", qty: 300, status: "Delivered", statusType: "success", amount: "LKR 450,000" }
  ];

  return (
    <div className="container-fluid p-0" style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <div className="row g-0" style={{ minHeight: "100vh" }}>

        {/* Sidebar Component */}
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        {/* Main Content */}
        <div className={`${sidebarCollapsed ? 'col' : 'col-md-9 col-lg-10'}`} style={{ background: "#f0f2f5" }}>

          {/* Top Bar */}
          <div className="bg-white p-3 p-md-4 border-bottom" style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)"
          }}>
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
                  placeholder="Search here..."
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

                <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }} onClick={() => setShowMenu(!showMenu)}>
                  <div style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}>
                    SF
                  </div>
                  <div className="d-none d-md-block">
                    <div className="fw-bold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
                      Saman Fashions
                    </div>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      Shop Owner
                    </div>
                  </div>
                  <ChevronDown size={16} style={{ color: "#6c757d" }} />
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="position-absolute bg-white shadow rounded p-2" style={{
                top: "75px",
                right: "20px",
                width: "220px",
                zIndex: 999,
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.05)"
              }}>
                <button
                  className="btn w-100 text-start py-2 px-3"
                  style={{ borderRadius: "8px", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(11,58,160,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  onClick={() => {
                    setShowAccount(true);
                    setShowMenu(false);
                  }}
                >
                  <Person size={16} className="me-2" /> My Account
                </button>
                <button
                  className="btn w-100 text-start py-2 px-3"
                  style={{ borderRadius: "8px", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(11,58,160,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  onClick={() => navigate("/settings")}
                >
                  <Gear size={16} className="me-2" /> Settings
                </button>
                <hr className="my-1" />
                <button
                  className="btn w-100 text-start py-2 px-3 text-danger"
                  style={{ borderRadius: "8px", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,53,69,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  onClick={() => navigate("/")}
                >
                  <BoxArrowRight size={16} className="me-2" /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="p-3 p-md-4">
            {/* Stats Cards - Same as before */}
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
                          <div className="fw-bold" style={{ fontSize: "28px", color: "#1a1a2e", marginTop: "4px" }}>
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

            {/* Table + Tracking - Same as before */}
            <div className="row g-4">
              {/* Recent Orders Table */}
              <div className="col-lg-7">
                <div className="card border-0" style={{
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  overflow: "hidden"
                }}>
                  <div className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>My Recent Orders</h5>
                    <button
                      className="btn btn-sm"
                      style={{
                        color: "#0b3aa0",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                      onClick={() => navigate("/orders")}
                    >
                      View All <ArrowRight size={14} />
                    </button>
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
                              Item
                            </th>
                            <th className="px-4 py-3 fw-bold text-center" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Qty
                            </th>
                            <th className="px-4 py-3 fw-bold" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Status
                            </th>
                            <th className="px-4 py-3 fw-bold text-end" style={{ color: "#495057", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order, index) => (
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
                                  {order.id}
                                </span>
                              </td>
                              <td className="px-4 py-3">{order.item}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="fw-bold">{order.qty}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="badge px-3 py-2" style={{
                                  background: order.statusType === "warning" 
                                    ? "linear-gradient(135deg, #ffc107, #f57c00)" 
                                    : "linear-gradient(135deg, #28a745, #1e7e34)",
                                  color: "white",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600"
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-end">
                                <span className="fw-bold" style={{ color: "#1a1a2e" }}>
                                  {order.amount}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Order Tracking */}
              <div className="col-lg-5">
                <div className="card border-0" style={{
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  overflow: "hidden"
                }}>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3" style={{ color: "#1a1a2e" }}>
                      <BoxSeam size={20} className="me-2" style={{ color: "#0b3aa0" }} />
                      Active Order Tracking
                    </h5>

                    <div className="p-3" style={{
                      background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                      borderRadius: "16px"
                    }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="badge" style={{
                            background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "11px"
                          }}>
                            In Progress
                          </span>
                          <h6 className="fw-bold mt-2 mb-0">ORD-2026-001</h6>
                          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                            School Uniform
                          </p>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold" style={{ color: "#0b3aa0", fontSize: "18px" }}>
                            65%
                          </div>
                        </div>
                      </div>

                      <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: "65%",
                            background: "linear-gradient(90deg, #0b3aa0, #1a6bff)",
                            borderRadius: "4px",
                            transition: "width 0.5s ease"
                          }}
                        />
                      </div>

                      <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">Started</small>
                        <small className="text-muted">Estimated: 15 Apr 2026</small>
                      </div>
                    </div>

                    <hr className="my-4" />

                    {/* Payment Summary */}
                    <h6 className="fw-bold mb-3" style={{ color: "#1a1a2e" }}>
                      <CreditCard size={18} className="me-2" style={{ color: "#0b3aa0" }} />
                      Payment Summary
                    </h6>

                    <div className="d-flex justify-content-between align-items-center p-3" style={{
                      background: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
                      borderRadius: "12px",
                      marginBottom: "12px"
                    }}>
                      <span className="text-muted">Total Outstanding</span>
                      <span className="fw-bold text-danger" style={{ fontSize: "16px" }}>
                        LKR 450,000
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3" style={{
                      background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                      borderRadius: "12px",
                      marginBottom: "16px"
                    }}>
                      <span className="text-muted">Next Payment Due</span>
                      <span className="fw-bold" style={{ color: "#0b3aa0" }}>
                        <Calendar3 size={14} className="me-1" /> 15 Apr 2026
                      </span>
                    </div>

                    <button
                      className="btn w-100 py-2 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                        color: "white",
                        borderRadius: "12px",
                        border: "none",
                        transition: "all 0.3s ease"
                      }}
                      onClick={() => navigate("/payment-history")}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(11,58,160,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Eye size={16} className="me-2" /> View Payment History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your modals... (My Account, Security, Help, Profile Settings) */}
      {/* They remain the same as in your original code */}
    </div>
  );
}

export default Dashboard;