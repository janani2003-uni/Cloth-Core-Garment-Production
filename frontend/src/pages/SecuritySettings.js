import React from "react";
import { useNavigate } from "react-router-dom";

function SecuritySettings() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">

      <h2 className="fw-bold">
        Security & Privacy
      </h2>

      <p className="text-muted">
        Keep your account safe.
      </p>

      <div className="row mt-4">

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">

              <h5>Change Password</h5>

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Current Password"
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="New Password"
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Confirm Password"
              />

              <button className="btn btn-primary w-100">
                Update Password
              </button>

            </div>
          </div>
        </div>

      </div>

      <button
        className="btn btn-secondary mt-3"
        onClick={() => navigate("/settings")}
      >
        Back
      </button>

    </div>
  );
}

export default SecuritySettings;