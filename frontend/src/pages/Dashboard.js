import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function Dashboard() {
     const navigate = useNavigate();
     const [showMenu, setShowMenu] = useState(false);
     const [showAccount, setShowAccount] = useState(false);
     const [showHelp, setShowHelp] = useState(false);
     const [showProfileSettings, setShowProfileSettings] = useState(false);
     const [activeTab, setActiveTab] = useState("profile");
     const [showSecurity, setShowSecurity] = useState(false);
     
  return (
     <>

    <div className="container-fluid p-0">
      <div className="row g-0">

        {/* Sidebar */}
        <div
          className="col-md-3 col-lg-2 text-white"
          style={{
            minHeight: "100vh",
            backgroundColor: "#2f5d92",
          }}
        >
          <div className="text-center py-4 bg-white">
            <img
              src={logo}
              alt="logo"
              style={{ width: "140px" }}
            />
          </div>

          <button className="btn text-white w-100 py-4 border-top border-secondary">
            Dashboard
          </button>

          <button className="btn text-white w-100 py-4 border-top border-secondary" onClick={() => navigate("/orders")} >
            Orders
          </button>

          <button className="btn text-white w-100 py-4 border-top border-secondary">
            Payment
          </button>
          <button
  className="btn text-white w-100 py-4 border-top border-secondary"
  onClick={() => navigate("/settings")}
>
  Settings
</button>
          <button className="btn text-white w-100 py-4 border-top border-secondary">
              Log Out
            </button>
  


          <div className="position-absolute bottom-0 start-0 w-100">
            <button className="btn text-white w-100 py-4 border-top border-secondary">
              Log Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 bg-light">

          {/* Top Bar */}
          <div className="bg-white p-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center">

              <input
                type="text"
                className="form-control"
                placeholder="Search here..."
                style={{ maxWidth: "400px" }}
              />

              <div className="d-flex align-items-center gap-3">
                <h5 className="mb-0">🔔</h5>
                <div
  className="position-relative"
  style={{ cursor: "pointer" }}
  onClick={() => setShowMenu(!showMenu)}
>

 <div
  className="d-flex align-items-center"
  style={{ cursor: "pointer" }}
  onClick={() => setShowMenu(!showMenu)}
>

  <div className="text-end me-3">
    <div className="fw-bold">
      Saman Fashions
    </div>

    <small className="text-muted">
      Shop Owner
    </small>
  </div>

  <div
    className="rounded-circle border bg-primary"
    style={{
      width: "55px",
      height: "55px"
    }}
  ></div>

</div>

</div>
              </div>

            </div>
            {showMenu && (
  <div
    className="position-absolute bg-white shadow rounded p-3"
    style={{
      top: "70px",
      right: "20px",
      width: "250px",
      zIndex: 999
    }}
  >
 <button
  className="btn btn-light w-100 text-start mb-2"
  onClick={() => {
    setShowAccount(true);
    setShowMenu(false);
  }}
>
  👤 My Account
</button>



    <button
  className="btn btn-danger w-100"
  onClick={() => navigate("/")}
>
  Logout
</button>
  </div>
)}
          </div>

          {/* Cards */}
          <div className="container py-4">

            <div className="row g-4">

              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5>Total Orders</h5>
                    <h3>2</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5>Pending Approval</h5>
                    <h3>0</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5>In Production</h5>
                    <h3>1</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5>Delivered</h5>
                    <h3>1</h3>
                  </div>
                </div>
              </div>

            </div>

            {/* Table + Tracking */}
            <div className="row mt-4">

              <div className="col-lg-7">
                <div className="card shadow-sm">
                  <div className="card-header d-flex justify-content-between">
                    <strong>My Recent Orders</strong>
                    <span>View All</span>
                  </div>

                  <div className="card-body p-0">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td>ORD-2026-001</td>
                          <td>School Uniform</td>
                          <td>500</td>
                          <td>
                            <span className="badge bg-info">
                              Production
                            </span>
                          </td>
                          <td>LKR 750,000</td>
                        </tr>

                        <tr>
                          <td>ORD-2026-004</td>
                          <td>Sport T-Shirt</td>
                          <td>300</td>
                          <td>
                            <span className="badge bg-success">
                              Delivered
                            </span>
                          </td>
                          <td>LKR 450,000</td>
                        </tr>
                      </tbody>

                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card shadow-sm">
                  <div className="card-body">

                    <h4>Active Order Tracking</h4>

                    <div className="border p-3 mt-3">
                      <strong>ORD-2026-001</strong>
                      <p className="mb-1">
                        School Uniform
                      </p>

                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{ width: "65%" }}
                        >
                          65%
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6>Payment Summary</h6>

                      <p>
                        Total Outstanding :
                        <span className="text-danger">
                          {" "}
                          LKR 450,000
                        </span>
                      </p>

                      <p>
                        Next Payment Due :
                        <strong> 15 Apr 2026</strong>
                      </p>

                      <button className="btn btn-light w-100">
                        View Payment History
                      </button>
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>

    {/* My Account Modal */}
    {showAccount && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.5)",
          zIndex: 9999
        }}
      >
        <div
          className="bg-white rounded shadow"
          style={{
            width: "1100px",
            maxWidth: "95%",
            margin: "40px auto",
            minHeight: "650px"
          }}
        >
          <div className="d-flex justify-content-between p-3 border-bottom">
            <h2>My Account</h2>
            <button
              className="btn-close"
              onClick={() => setShowAccount(false)}
            ></button>
          </div>

          <div className="row g-0">
            <div className="col-md-3 border-end p-4 text-center">
              <div
                className="rounded-circle bg-primary mx-auto mb-3"
                style={{
                  width: "120px",
                  height: "120px"
                }}
              ></div>
              <h3 className="fw-bold">Saman Fashions</h3>
              <p className="text-muted">Shop Owner</p>
              <p className="text-success">● Online</p>
              <hr />
              <p>📧 SamanFashions@example.com</p>
              <p>📞 (+94) 774852147</p>
              <p>📅 Member since 2026</p>
            </div>

            <div className="col-md-9 p-4">
              <h3 className="fw-bold">My Account</h3>
              <p className="text-muted">Manage your account and preferences</p>
              <hr />

              {/* Profile Settings Card - Click to open Profile Settings */}
              <div 
                className="card mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowAccount(false);
                  setShowProfileSettings(true);
                  setActiveTab("profile");
                }}
              >
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">👤 Profile Settings</h5>
                    <small className="text-muted">View and edit your personal information</small>
                  </div>
                  <span>›</span>
                </div>
              </div>

              <div 
  className="card mb-3"
  style={{ cursor: "pointer" }}
  onClick={() => {
    setShowAccount(false);
    setShowSecurity(true);
  }}
>
  <div className="card-body d-flex justify-content-between align-items-center">
    <div>
      <h5 className="mb-1">🔒 Change Password</h5>
      <small className="text-muted">Update your account password</small>
    </div>
    <span>›</span>
  </div>
</div>

              {/* Help & Support Card */}
              <div
                className="card mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowAccount(false);
                  setShowHelp(true);
                }}
              >
                <div className="card-body">
                  <h5 className="mb-1">❓ Help & Support</h5>
                  <small className="text-muted">Get help and contact support</small>
                </div>
              </div>

              <div
                className="card border-danger"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/")}
              >
                <div className="card-body text-danger">
                  <h5 className="mb-1">🚪 Logout</h5>
                  <small>Sign out from your account</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Security Modal */}
    {showSecurity && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.5)",
          zIndex: 9999
        }}
      >
        <div
          className="bg-white rounded shadow"
          style={{
            width: "1200px",
            maxWidth: "95%",
            margin: "40px auto",
            minHeight: "700px"
          }}
        >
          {/* Header - My Account style */}
          <div className="d-flex justify-content-between p-3 border-bottom">
            <h2 className="fw-bold mb-0">Security & Privacy</h2>
            <button
              className="btn-close"
              onClick={() => setShowSecurity(false)}
            ></button>
          </div>

          <div className="row g-0">
            
            {/* Left Menu */}
            <div className="col-md-3 border-end p-4">
              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => {
                  setShowSecurity(false);
                  setShowProfileSettings(true);
                  setActiveTab("profile");
                }}
              >
                👤 Profile Settings
              </button>

              <button 
                className="btn btn-primary w-100 text-start mb-3"
                onClick={() => setActiveTab("security")}
              >
                🔒 Security & Privacy
              </button>

              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => {
                  setShowSecurity(false);
                  setShowProfileSettings(true);
                  setActiveTab("notifications");
                }}
              >
                🔔 Notifications
              </button>

              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => {
                  setShowSecurity(false);
                  setShowHelp(true);
                }}
              >
                ❓ Help & Support
              </button>
            </div>

            {/* Right Side */}
            <div className="col-md-9 p-4">
              <h3 className="fw-bold mb-1">Security & Privacy</h3>
              <p className="text-muted">Keep your account safe.</p>
              <hr />

              <div className="row mt-4">
                {/* Change Password Section */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="mb-4">Change Password</h5>

                      <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button className="btn btn-primary w-100">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings Section */}
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h5>Two-Factor Authentication</h5>
                      <p className="text-muted">Status: Disabled</p>
                      <button className="btn btn-outline-primary w-100">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <h5>Privacy Settings</h5>

                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailPrivacySec"
                        />
                        <label className="form-check-label" htmlFor="emailPrivacySec">
                          Make my email private
                        </label>
                      </div>

                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="searchPrivacySec"
                        />
                        <label className="form-check-label" htmlFor="searchPrivacySec">
                          Hide profile from search engines
                        </label>
                      </div>

                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="activityPrivacySec"
                          defaultChecked
                        />
                        <label className="form-check-label" htmlFor="activityPrivacySec">
                          Show online status
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-end mt-4">
                <button className="btn btn-secondary me-2" onClick={() => setShowSecurity(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

       {/* Help & Support Modal */}
    {showHelp && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.5)",
          zIndex: 9999
        }}
      >
        <div
          className="bg-white rounded shadow"
          style={{
            width: "1200px",
            maxWidth: "95%",
            margin: "40px auto",
            minHeight: "700px"
          }}
        >

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <div>
              <h2 className="fw-bold mb-1">Help & Support</h2>
            </div>
            <button
              className="btn-close"
              onClick={() => setShowHelp(false)}
            ></button>
          </div>

          <div className="row g-0">

            {/* Left Menu */}
            <div className="col-md-3 border-end p-4">
              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => {
                  setShowHelp(false);
                  setShowProfileSettings(true);
                  setActiveTab("profile");
                }}
              >
                👤 Profile Settings
              </button>

              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => {
                  setShowHelp(false);
                  setShowSecurity(true);
                }}
              >
                🔒 Security & Privacy
              </button>

              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => {
                  setShowHelp(false);
                  setShowProfileSettings(true);
                  setActiveTab("notifications");
                }}
              >
                🔔 Notifications
              </button>

              <button className="btn btn-primary w-100 text-start mb-3">
                ❓ Help & Support
              </button>
            </div>

            {/* Right Side */}
            <div className="col-md-9 p-4">

              <div className="d-flex justify-content-between mb-4">
                <div>
                  <h3 className="fw-bold">Help & Support</h3>
                  <p className="text-muted">Get help and contact support.</p>
                </div>
              </div>
              <hr />

              <div className="row mt-4">
                <div className="col-md-12">
                  <h5 className="fw-bold mb-3">How can we help you?</h5>
                  <p className="text-muted">Find answers or contact our support team.</p>

                  <div className="card mt-3">
                    <div className="card-body">
                      <h5 className="mb-3">🎧 Contact Support</h5>
                      <p className="text-muted">Our support team is here to help you.</p>
                      <hr />

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Email</strong>
                              <br />
                              <span className="text-muted">support@clothcore.lk</span>
                            </div>
                            <button className="btn btn-outline-primary">
                              Send Email
                            </button>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Phone</strong>
                              <br />
                              <span className="text-muted">+94 11 234 5678</span>
                            </div>
                            <button className="btn btn-outline-primary">
                              Call Now
                            </button>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Support Hours</strong>
                              <br />
                              <span className="text-muted">Mon - Fri : 9.00 AM - 5.00 PM</span>
                            </div>
                            <button className="btn btn-success">
                              Open Now
                            </button>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Still need help?</strong>
                              <br />
                              <span className="text-muted">Chat with our support team for quick assistance.</span>
                            </div>
                            <button className="btn btn-primary">
                              Start Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    )}

       {/* Profile Settings Modal */}
    {showProfileSettings && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.5)",
          zIndex: 9999
        }}
      >
        <div
          className="bg-white rounded shadow"
          style={{
            width: "1200px",
            maxWidth: "95%",
            margin: "40px auto",
            minHeight: "700px"
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <div>
              <h2 className="fw-bold mb-1">Profile Settings</h2>
            </div>
            <button
              className="btn-close"
              onClick={() => setShowProfileSettings(false)}
            ></button>
          </div>

          <div className="row g-0">
            {/* Left Menu - Same as Help & Support */}
            <div className="col-md-3 border-end p-4">
              <button 
                className="btn btn-primary w-100 text-start mb-3"
                onClick={() => setActiveTab("profile")}
              >
                👤 Profile Settings
              </button>

              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => setActiveTab("security")}
              >
                🔒 Security & Privacy
              </button>

              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => setActiveTab("notifications")}
              >
                🔔 Notifications
              </button>

              <button 
                className="btn btn-light w-100 text-start mb-3"
                onClick={() => {
                  setShowProfileSettings(false);
                  setShowHelp(true);
                }}
              >
                ❓ Help & Support
              </button>
            </div>

            {/* Right Side */}
            <div className="col-md-9 p-4">
              {activeTab === "profile" && (
                <>
                  <div className="d-flex justify-content-between mb-4">
                    <div>
                      <h3 className="fw-bold">Profile Settings</h3>
                      <p className="text-muted">Manage your personal information.</p>
                    </div>
                  </div>
                  <hr />

                  <div className="row mt-4">
                    {/* Profile Image */}
                    <div className="col-md-3 text-center">
                      <div
                        className="rounded-circle bg-dark mx-auto mb-3"
                        style={{
                          width: "130px",
                          height: "130px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "50px",
                          color: "white"
                        }}
                      >
                        👤
                      </div>
                      <button className="btn btn-outline-secondary">
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
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="Saman perera"
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="Saman_Fashions"
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email Address</label>
                          <input
                            type="email"
                            className="form-control"
                            defaultValue="SamanFashions@example.com"
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="(+94) 774852147"
                          />
                        </div>

                        <div className="col-md-12 mb-3">
                          <label className="form-label">Bio</label>
                          <textarea
                            rows="4"
                            className="form-control"
                            defaultValue="Online store owner and seller."
                          />
                        </div>
                      </div>

                      <div className="text-end">
                        <button className="btn btn-primary px-4">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

             {activeTab === "security" && (
<>
  <h3 className="fw-bold">
    Security & Privacy
  </h3>

  <p className="text-muted">
    Keep your account safe.
  </p>

  <hr />

  <div className="row mt-4">

    <div className="col-md-6">

      <div className="card">
        <div className="card-body">

          <h5 className="mb-4">
            Change Password
          </h5>

          <div className="mb-3">
            <label>Current Password</label>
            <input
              type="password"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
            />
          </div>

          <button className="btn btn-primary w-100">
            Update Password
          </button>

        </div>
      </div>

    </div>

    <div className="col-md-6">

      <div className="card mb-3">
        <div className="card-body">

          <h5>Two-Factor Authentication</h5>

          <p className="text-muted">
            Status: Disabled
          </p>

          <button className="btn btn-outline-primary">
            Enable 2FA
          </button>

        </div>
      </div>

      <div className="card">
        <div className="card-body">

          <h5>Privacy</h5>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
            />
            <label className="form-check-label">
              Make my email private
            </label>
          </div>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
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
  <div className="d-flex justify-content-between mb-4">
    <div>
      <h3 className="fw-bold">Notifications</h3>
      <p className="text-muted">Choose how you want to receive notifications.</p>
    </div>
  </div>
  <hr />

  <div className="row mt-4">

    {/* Left Side */}
    <div className="col-md-6">

      <div className="card">
        <div className="card-body">

          <h5 className="mb-4">
            Email Notifications
          </h5>

          <div className="d-flex justify-content-between mb-3">
            <span>Order updates</span>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                defaultChecked
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
              />
            </div>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <span>Promotions & Offers</span>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
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
              />
            </div>
          </div>

        </div>
      </div>

    </div>

    {/* Right Side */}
    <div className="col-md-6">

      <div className="card mb-3">
        <div className="card-body">

          <h5>Browser Notifications</h5>

          <p className="text-muted">
            Status: Disabled
          </p>

          <button className="btn btn-outline-secondary w-100">
            Enable
          </button>

        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">

          <h5>SMS Notifications</h5>

          <p className="text-muted">
            Status: Disabled
          </p>

          <button className="btn btn-outline-secondary w-100">
            Enable
          </button>

        </div>
      </div>

      <div className="text-end mt-4">

        <button className="btn btn-primary px-4">
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
    )}

  </>
  );
}

export default Dashboard;