// src/pages/Admin/AdminAddShopOwner.js
// Dedicated page for creating a shop owner account — replaces the old
// window.prompt() chain that used to live on the "Add Shop Owner" button
// in AdminUserManagement.js. Posts to the same POST /api/auth/users
// endpoint that button always used, just with a real form instead of a
// sequence of prompts. Role is always hardcoded to "shopOwner" here — this
// page never creates any other kind of account.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { PersonPlus, CheckCircleFill, ShopWindow } from "react-bootstrap-icons";

const USERS_API_URL = "http://localhost:5000/api/auth/users";

function AdminAddShopOwner() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    shopName: "",
    password: "",
    status: "Active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedUser, setSavedUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const requiredFields = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      shopName: "Shop Name",
      password: "Password",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || !formData[field].trim()) {
        setError(`${label} is required.`);
        return;
      }
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      shopName: formData.shopName.trim(),
      password: formData.password.trim(),
      role: "shopOwner",
      status: formData.status,
    };

    try {
      setSubmitting(true);
      const response = await axios.post(USERS_API_URL, payload);
      setSavedUser(response.data.user);
    } catch (err) {
      console.error("Create Shop Owner Error:", err);
      setError(err.response?.data?.message || "Could not create the account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ color: "var(--clothcore-text-soft)", fontSize: "14px" }}>Dashboard</span>
        <span style={{ color: "var(--clothcore-text-soft)", margin: "0 8px" }}>&gt;</span>
        <span style={{ color: "var(--clothcore-text-soft)", fontSize: "14px" }}>Shop Owner Management</span>
        <span style={{ color: "var(--clothcore-text-soft)", margin: "0 8px" }}>&gt;</span>
        <span style={{ color: "var(--clothcore-purple)", fontWeight: "600", fontSize: "14px" }}>Add Shop Owner</span>
      </div>

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Add Shop Owner</h2>
          <p className="admin-page-subtitle">
            Create a new shop owner account. They'll log in and set up their own Shop Profile from there.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card admin-content-card">
        <div className="card-body p-4 p-xl-5">
          <form onSubmit={handleSubmit}>
            <h6 className="fw-bold mb-4" style={{ color: "var(--clothcore-text)", fontSize: "16px" }}>
              Account Details
            </h6>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                  First Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", border: "2px solid var(--clothcore-border)", padding: "10px 14px", fontSize: "14px" }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                  Last Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", border: "2px solid var(--clothcore-border)", padding: "10px 14px", fontSize: "14px" }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", border: "2px solid var(--clothcore-border)", padding: "10px 14px", fontSize: "14px" }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                  Shop Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="shopName"
                  placeholder="Enter shop name"
                  value={formData.shopName}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", border: "2px solid var(--clothcore-border)", padding: "10px 14px", fontSize: "14px" }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                  Temporary Password
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="password"
                  placeholder="Enter a temporary password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", border: "2px solid var(--clothcore-border)", padding: "10px 14px", fontSize: "14px" }}
                  required
                />
                <small className="d-block mt-1" style={{ color: "var(--clothcore-text-soft)" }}>
                  Share this with the shop owner — they can change it later from Settings.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                  Status
                </label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", border: "2px solid var(--clothcore-border)", padding: "10px 14px", fontSize: "14px" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-4" style={{ color: "var(--clothcore-danger)", fontSize: "13px", fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-3 mt-4 pt-3">
              <button
                type="button"
                className="btn px-5 py-2"
                onClick={handleCancel}
                style={{
                  borderRadius: "10px",
                  border: "2px solid var(--clothcore-border)",
                  background: "rgba(82,43,91,0.06)",
                  color: "var(--clothcore-text)",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn px-5 py-2"
                disabled={submitting}
                style={{
                  background: submitting
                    ? "linear-gradient(135deg, var(--clothcore-text-soft), var(--clothcore-text))"
                    : "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                  color: "white",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                <PersonPlus size={18} />
                {submitting ? "Adding Shop Owner..." : "Add Shop Owner"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          .form-control:focus, .form-select:focus {
            border-color: var(--clothcore-purple);
            box-shadow: 0 0 0 3px rgba(82, 43, 91, 0.1);
          }
        `}
      </style>

      {/* Success screen */}
      {savedUser && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "18px" }}>
              <div className="modal-body text-center" style={{ padding: "36px 32px" }}>
                <CheckCircleFill size={44} style={{ color: "var(--clothcore-success)" }} className="mb-3" />
                <h4 className="fw-bold mb-2" style={{ color: "var(--clothcore-text)" }}>
                  Shop owner account created.
                </h4>
                <p className="text-muted mb-4">
                  {savedUser.firstName} {savedUser.lastName} ({savedUser.email}) can now log in and set up their Shop Profile.
                </p>

                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate("/users")}
                    style={{
                      background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                      color: "white",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    <ShopWindow size={16} /> Return to Shop Owner Management
                  </button>
                  <button
                    type="button"
                    className="btn py-2"
                    onClick={() => {
                      setSavedUser(null);
                      setFormData({ firstName: "", lastName: "", email: "", shopName: "", password: "", status: "Active" });
                    }}
                    style={{
                      borderRadius: "10px",
                      border: "2px solid var(--clothcore-border)",
                      background: "rgba(82,43,91,0.06)",
                      color: "var(--clothcore-text)",
                      fontWeight: 500,
                      fontSize: "14px",
                    }}
                  >
                    Add Another Shop Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminAddShopOwner;
