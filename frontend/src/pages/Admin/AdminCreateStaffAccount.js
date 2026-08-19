// src/pages/Admin/AdminCreateStaffAccount.js
// Step 2 of the Add Staff workflow — after the HR profile is saved, Admin
// creates the actual Supervisor login here. This is the ONLY page in the
// app that can create a supervisor-role account; it's Admin-only (see
// App.js route guard) and always linked to the Staff record it was opened
// from (staff.userId / user.staffId on the backend).
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import {
  PersonBadge,
  Envelope,
  Lock,
  Eye,
  EyeSlash,
  CheckCircleFill,
  ArrowLeft,
} from "react-bootstrap-icons";
import {
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS_MESSAGE,
  PASSWORD_REQUIREMENTS_LIST,
} from "../../utils/passwordPolicy";

const API_URL = "http://localhost:5000/api/staff";

function AdminCreateStaffAccount() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const response = await axios.get(`${API_URL}/${staffId}`);
      setStaff(response.data);
      setEmail(response.data.email || "");
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load this staff member.");
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please create a password.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/${staffId}/create-account`, {
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });
      setCreated(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    borderRadius: "18px",
    border: "1px solid var(--clothcore-border)",
    boxShadow: "var(--clothcore-shadow)",
    background: "#fff",
  };

  const inputStyle = {
    borderRadius: "10px",
    border: "2px solid var(--clothcore-border)",
    padding: "10px 14px",
    fontSize: "14px",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} />
        </div>
      </AdminLayout>
    );
  }

  if (loadError || !staff) {
    return (
      <AdminLayout>
        <div className="alert alert-danger">{loadError || "Staff member not found."}</div>
        <button type="button" className="admin-btn-secondary" onClick={() => navigate("/staff")}>
          <ArrowLeft size={14} className="me-1" /> Back to Staff Management
        </button>
      </AdminLayout>
    );
  }

  // Already has a login — this page shouldn't normally be reachable in that
  // case (Staff Management only shows "Create Login" when there's none),
  // but guard it directly too rather than trusting only the caller.
  if (staff.userId && !created) {
    return (
      <AdminLayout>
        <div className="card admin-content-card" style={cardStyle}>
          <div className="card-body p-4 p-xl-5 text-center">
            <CheckCircleFill size={40} style={{ color: "var(--clothcore-success)" }} className="mb-3" />
            <h4 className="fw-bold mb-2" style={{ color: "var(--clothcore-text)" }}>
              Supervisor Account Already Active
            </h4>
            <p className="text-muted mb-4">
              {staff.name} already has a login account ({staff.userId.email}).
            </p>
            <button type="button" className="admin-btn-primary" onClick={() => navigate("/staff")}>
              Back to Staff Management
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ color: "var(--clothcore-text-soft)", fontSize: "14px" }}>Dashboard</span>
        <span style={{ color: "var(--clothcore-text-soft)", margin: "0 8px" }}>&gt;</span>
        <span style={{ color: "var(--clothcore-text-soft)", fontSize: "14px" }}>Staff Management</span>
        <span style={{ color: "var(--clothcore-text-soft)", margin: "0 8px" }}>&gt;</span>
        <span style={{ color: "var(--clothcore-purple)", fontWeight: "600", fontSize: "14px" }}>
          Create Supervisor Account
        </span>
      </div>

      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Create Supervisor Account</h2>
          <p className="admin-page-subtitle">
            Set up login credentials for this staff member.
          </p>
        </div>
      </div>

      {created ? (
        <div className="card admin-content-card" style={cardStyle}>
          <div className="card-body p-4 p-xl-5 text-center">
            <CheckCircleFill size={40} style={{ color: "var(--clothcore-success)" }} className="mb-3" />
            <h4 className="fw-bold mb-2" style={{ color: "var(--clothcore-text)" }}>
              Supervisor Account Active
            </h4>
            <p className="text-muted mb-4">
              {staff.name} can now sign in at the normal Login page using{" "}
              <strong>{email.trim().toLowerCase()}</strong> and the password you just set.
            </p>
            <button type="button" className="admin-btn-primary" onClick={() => navigate("/staff")}>
              Back to Staff Management
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Staff summary */}
          <div className="col-lg-4">
            <div className="card admin-content-card" style={cardStyle}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <PersonBadge size={20} style={{ color: "var(--clothcore-mauve)" }} />
                  <h6 className="fw-bold mb-0" style={{ color: "var(--clothcore-text)" }}>
                    Staff Summary
                  </h6>
                </div>

                {[
                  ["Staff ID", staff.staffId],
                  ["Full Name", staff.name],
                  ["Department", staff.department],
                  ["Position", staff.position],
                ].map(([label, value]) => (
                  <div key={label} className="mb-3">
                    <small className="text-muted d-block">{label}</small>
                    <div className="fw-semibold" style={{ color: "var(--clothcore-text)" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account creation form */}
          <div className="col-lg-8">
            <div className="card admin-content-card" style={cardStyle}>
              <div className="card-body p-4 p-xl-5">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">{error}</div>
                  )}

                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                      Email Address
                    </label>
                    <div className="position-relative">
                      <Envelope size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
                      <input
                        type="email"
                        className="form-control"
                        placeholder="staff.member@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 40 }}
                        required
                      />
                    </div>
                    <small className="text-muted d-block mt-1">
                      This will be used to sign in on the normal Login page.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                      Password
                    </label>
                    <div className="position-relative">
                      <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 40, paddingRight: 40 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--clothcore-text-soft)" }}
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <small className="d-block mt-2" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", lineHeight: 1.6 }}>
                      <strong>Password Requirements</strong>
                      <br />
                      {PASSWORD_REQUIREMENTS_LIST.map((rule) => (
                        <span key={rule}>✓ {rule}<br /></span>
                      ))}
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                      Confirm Password
                    </label>
                    <div className="position-relative">
                      <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
                      <input
                        type={showConfirm ? "text" : "password"}
                        className="form-control"
                        placeholder="Re-enter the password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 40, paddingRight: 40 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--clothcore-text-soft)" }}
                      >
                        {showConfirm ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="d-flex gap-3 pt-2">
                    <button
                      type="button"
                      className="btn px-4 py-2"
                      onClick={() => navigate("/staff")}
                      style={{
                        borderRadius: "10px",
                        border: "2px solid var(--clothcore-border)",
                        background: "rgba(82,43,91,0.06)",
                        color: "var(--clothcore-text)",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn px-4 py-2"
                      disabled={submitting}
                      style={{
                        background: submitting
                          ? "linear-gradient(135deg, var(--clothcore-text-soft), var(--clothcore-text))"
                          : "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                        color: "white",
                        borderRadius: "10px",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: 600,
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCreateStaffAccount;
