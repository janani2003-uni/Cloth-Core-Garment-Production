import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();
const [activeTab, setActiveTab] = useState("profile");
  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="bg-white border rounded p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center">

          <img
            src={logo}
            alt="logo"
            style={{ width: "120px" }}
          />
             <div className="ms-3">
              <div className="fw-bold" style={{ fontSize: "30px", color: "#0b3aa0" }}>
                ClothCore
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d", lineHeight: "1.2" }}>
                Garment Productions
              </div>
            </div>

          <div className="d-flex align-items-center">

            <div className="me-4 position-relative">
              <span style={{ fontSize: "24px" }}>🔔</span>

              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                1
              </span>
            </div>

            <div className="text-end me-3">
              <div className="fw-bold">
                Saman Fashions
              </div>

              <small className="text-muted">
                shop owner
              </small>
            </div>

            <div
              className="rounded-circle border"
              style={{
                width: "55px",
                height: "55px"
              }}
            ></div>

          </div>

        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">

          <div className="row g-0">

            {/* Left Menu */}
            <div
              className="col-md-3 border-end p-4"
            >
              <h3 className="fw-bold mb-4">
                Settings
              </h3>

              <button
  className="btn btn-light w-100 text-start mb-3"
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

              <div className="mt-5">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate("/dashboard")}
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
                    
                    
                  <h3 className="fw-bold">
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
      className="rounded-circle bg-dark mx-auto mb-3"
      style={{
        width: "130px",
        height: "130px"
      }}
    ></div>

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
        <label className="form-label">
          Full Name
        </label>

        <input
          type="text"
          className="form-control"
          defaultValue="Saman perera"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">
          Username
        </label>

        <input
          type="text"
          className="form-control"
          defaultValue="Saman_Fashions"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">
          Email Address
        </label>

        <input
          type="email"
          className="form-control"
          defaultValue="SamanFashions@example.com"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">
          Phone Number
        </label>

        <input
          type="text"
          className="form-control"
          defaultValue="(+94) 774852147"
        />
      </div>

      <div className="col-md-12 mb-3">
        <label className="form-label">
          Bio
        </label>

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
  <h3 className="fw-bold">
    Notifications
  </h3>

  <p className="text-muted">
    Choose how you want to receive notifications.
  </p>

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

          <button className="btn btn-outline-secondary">
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

          <button className="btn btn-outline-secondary">
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

    </div>
  );
}

export default Settings;