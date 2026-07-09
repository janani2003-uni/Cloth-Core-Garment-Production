import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get activeTab from location state or default to "profile"
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    // Check if location state has activeTab
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ padding: "20px" }}>
        <div className="container-fluid px-0">
          {/* Header */}
          <div className="bg-white border rounded p-3 mb-4" style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
          }}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img
                  src={logo}
                  alt="logo"
                  style={{ width: "50px", height: "50px", objectFit: "contain" }}
                />
                <div className="ms-3">
                  <div className="fw-bold" style={{ fontSize: "24px", color: "#0b3aa0" }}>
                    ClothCore
                  </div>
                  <div style={{ fontSize: "13px", color: "#6c757d", lineHeight: "1.2" }}>
                    Garment Productions
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="me-4 position-relative">
                  <span style={{ fontSize: "24px" }}>🔔</span>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    1
                  </span>
                </div>

                <div
                  className="d-flex align-items-center gap-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/settings")}
                >
                  <div className="fw-bold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
                    Saman Fashions
                  </div>
                  <div style={{ fontSize: "12px", color: "#6c757d" }}>
                    Shop Owner
                  </div>
                </div>

                <div
                  className="rounded-circle border ms-2"
                  style={{
                    width: "45px",
                    height: "45px",
                    background: "linear-gradient(135deg, #ffc107, #ff6f00)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px"
                  }}
                >
                  SF
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0" style={{
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            overflow: "hidden"
          }}>
            <div className="card-body p-0">
              <div className="row g-0">
                {/* Left Menu */}
                <div
                  className="col-md-3 border-end p-4"
                  style={{ background: "#f8f9fa" }}
                >
                  <h3 className="fw-bold mb-4" style={{ color: "#0b3aa0" }}>
                    Settings
                  </h3>

                  <button
                    className={`btn w-100 text-start mb-3 ${activeTab === "profile" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("profile")}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontWeight: activeTab === "profile" ? "600" : "400"
                    }}
                  >
                    👤 Profile Settings
                  </button>

                  <button
                    className={`btn w-100 text-start mb-3 ${activeTab === "security" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("security")}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontWeight: activeTab === "security" ? "600" : "400"
                    }}
                  >
                    🔒 Security & Privacy
                  </button>

                  <button
                    className={`btn w-100 text-start mb-3 ${activeTab === "notifications" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("notifications")}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontWeight: activeTab === "notifications" ? "600" : "400"
                    }}
                  >
                    🔔 Notifications
                  </button>

                  <div className="mt-5">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => navigate("/dashboard")}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 16px"
                      }}
                    >
                      ← Back to Dashboard
                    </button>
                  </div>
                </div>

                {/* Right Side */}
                <div className="col-md-9 p-4">
                  {activeTab === "profile" && (
                    <>
                      <div className="d-flex justify-content-between mb-4">
                        <div>
                          <h3 className="fw-bold" style={{ color: "#0b3aa0" }}>
                            Profile Settings
                          </h3>
                          <p className="text-muted">
                            Manage your personal information.
                          </p>
                        </div>
                      </div>
                      <hr />

                      <div className="row mt-4">
                        {/* Profile Image */}
                        <div className="col-md-3 text-center">
                          <div
                            className="rounded-circle mx-auto mb-3"
                            style={{
                              width: "130px",
                              height: "130px",
                              background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "48px",
                              fontWeight: "bold"
                            }}
                          >
                            SF
                          </div>
                          <button className="btn btn-outline-secondary" style={{ borderRadius: "12px" }}>
                            Change Avatar
                          </button>
                          <p className="text-muted mt-3 small">
                            JPG, PNG or WEBP, max 2MB
                          </p>
                        </div>

                        {/* Form Section */}
                        <div className="col-md-9">
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Full Name</label>
                              <input
                                type="text"
                                className="form-control"
                                defaultValue="Saman Perera"
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid #e9ecef"
                                }}
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Username</label>
                              <input
                                type="text"
                                className="form-control"
                                defaultValue="Saman_Fashions"
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid #e9ecef"
                                }}
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Email Address</label>
                              <input
                                type="email"
                                className="form-control"
                                defaultValue="SamanFashions@example.com"
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid #e9ecef"
                                }}
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Phone Number</label>
                              <input
                                type="text"
                                className="form-control"
                                defaultValue="(+94) 774852147"
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid #e9ecef"
                                }}
                              />
                            </div>

                            <div className="col-md-12 mb-3">
                              <label className="form-label fw-bold">Bio</label>
                              <textarea
                                rows="4"
                                className="form-control"
                                defaultValue="Online store owner and seller."
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid #e9ecef",
                                  resize: "vertical"
                                }}
                              />
                            </div>
                          </div>

                          <div className="text-end">
                            <button className="btn px-4" style={{
                              background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                              color: "white",
                              borderRadius: "12px",
                              border: "none",
                              padding: "12px 32px",
                              fontWeight: "600"
                            }}>
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "security" && (
                    <>
                      <h3 className="fw-bold" style={{ color: "#0b3aa0" }}>
                        Security & Privacy
                      </h3>
                      <p className="text-muted">
                        Keep your account safe.
                      </p>
                      <hr />

                      <div className="row mt-4">
                        <div className="col-md-6">
                          <div className="card border-0" style={{
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                          }}>
                            <div className="card-body">
                              <h5 className="mb-4">Change Password</h5>
                              <div className="mb-3">
                                <label className="form-label fw-bold">Current Password</label>
                                <input
                                  type="password"
                                  className="form-control"
                                  style={{
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    border: "2px solid #e9ecef"
                                  }}
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">New Password</label>
                                <input
                                  type="password"
                                  className="form-control"
                                  style={{
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    border: "2px solid #e9ecef"
                                  }}
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">Confirm Password</label>
                                <input
                                  type="password"
                                  className="form-control"
                                  style={{
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    border: "2px solid #e9ecef"
                                  }}
                                />
                              </div>
                              <button className="btn w-100" style={{
                                background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                                color: "white",
                                borderRadius: "12px",
                                border: "none",
                                padding: "12px",
                                fontWeight: "600"
                              }}>
                                Update Password
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card border-0 mb-3" style={{
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                          }}>
                            <div className="card-body">
                              <h5>Two-Factor Authentication</h5>
                              <p className="text-muted">
                                Status: Disabled
                              </p>
                              <button className="btn btn-outline-primary" style={{ borderRadius: "12px" }}>
                                Enable 2FA
                              </button>
                            </div>
                          </div>

                          <div className="card border-0" style={{
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                          }}>
                            <div className="card-body">
                              <h5>Privacy</h5>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  style={{ cursor: "pointer" }}
                                />
                                <label className="form-check-label">
                                  Make my email private
                                </label>
                              </div>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  style={{ cursor: "pointer" }}
                                />
                                <label className="form-check-label">
                                  Hide profile from search engines
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "notifications" && (
                    <>
                      <h3 className="fw-bold" style={{ color: "#0b3aa0" }}>
                        Notifications
                      </h3>
                      <p className="text-muted">
                        Choose how you want to receive notifications.
                      </p>
                      <hr />

                      <div className="row mt-4">
                        <div className="col-md-6">
                          <div className="card border-0" style={{
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                          }}>
                            <div className="card-body">
                              <h5 className="mb-4">Email Notifications</h5>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Order updates</span>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>New messages</span>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Promotions & Offers</span>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Security Alerts</span>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>Account Activity</span>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card border-0 mb-3" style={{
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                          }}>
                            <div className="card-body">
                              <h5>Browser Notifications</h5>
                              <p className="text-muted">
                                Status: Disabled
                              </p>
                              <button className="btn btn-outline-secondary" style={{ borderRadius: "12px" }}>
                                Enable
                              </button>
                            </div>
                          </div>

                          <div className="card border-0 mb-3" style={{
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                          }}>
                            <div className="card-body">
                              <h5>SMS Notifications</h5>
                              <p className="text-muted">
                                Status: Disabled
                              </p>
                              <button className="btn btn-outline-secondary" style={{ borderRadius: "12px" }}>
                                Enable
                              </button>
                            </div>
                          </div>

                          <div className="text-end mt-4">
                            <button className="btn px-4" style={{
                              background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                              color: "white",
                              borderRadius: "12px",
                              border: "none",
                              padding: "12px 32px",
                              fontWeight: "600"
                            }}>
                              Save Preferences
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;