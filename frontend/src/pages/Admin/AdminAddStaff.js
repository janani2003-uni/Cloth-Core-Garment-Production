import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from "../../components/AdminLayout";
import axios from 'axios';
import {
  PersonPlus,
  CheckCircleFill,
  ShieldLock,
  ExclamationTriangleFill,
  Eye,
  EyeSlash,
} from 'react-bootstrap-icons';
import {
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS_MESSAGE,
  PASSWORD_REQUIREMENTS_LIST,
} from '../../utils/passwordPolicy';

function AdminAddStaff() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    staffId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedStaff, setSavedStaff] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [accountError, setAccountError] = useState('');

  const departments = ['HR', 'Delivery', 'Production'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields — Email and Password are now required too,
    // since they're used to create this staff member's Supervisor login
    // account immediately (not as a separate later step).
    const requiredFields = {
      staffId: 'Staff ID',
      fullName: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      phone: 'Phone Number',
      department: 'Department',
      joiningDate: 'Starting Date'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`${label} is required`);
        return;
      }
    }

    const email = formData.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!PASSWORD_REGEX.test(formData.password)) {
      alert(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Prepare payload
    const payload = {
      staffId: formData.staffId.trim(),
      name: formData.fullName.trim(),
      email,
      phone: formData.phone.trim(),
      department: formData.department,
      joiningDate: formData.joiningDate,
      address: formData.address.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      notes: formData.notes.trim()
    };

    try {
      setSubmitting(true);
      setAccountError('');

      const response = await axios.post('http://localhost:5000/api/staff', payload);
      const staff = response.data.staff;
      setSavedStaff(staff);

      // Immediately create the Supervisor login using this same email +
      // password — the Admin no longer has to go through a separate
      // "Create Login Account" page afterward.
      try {
        await axios.post(`http://localhost:5000/api/staff/${staff._id}/create-account`, {
          email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
        setAccountCreated(true);
      } catch (accErr) {
        console.error('Create Staff Account Error:', accErr);
        setAccountError(
          accErr.response?.data?.message ||
          'The staff profile was saved, but creating the Supervisor login failed. You can try again below.'
        );
      }
    } catch (err) {
      console.error('Add Staff Error:', err);

      // Show backend error message
      const errorMessage = err.response?.data?.message || 'Failed to add staff member. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/staff');
  };

  return (
    <AdminLayout>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: 'var(--clothcore-text-soft)', fontSize: '14px' }}>Dashboard</span>
              <span style={{ color: 'var(--clothcore-text-soft)', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: 'var(--clothcore-text-soft)', fontSize: '14px' }}>Staff Management</span>
              <span style={{ color: 'var(--clothcore-text-soft)', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: 'var(--clothcore-purple)', fontWeight: '600', fontSize: '14px' }}>Add Staff Member</span>
            </div>

            {/* Page Header */}
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Add Staff Member</h2>
                <p className="admin-page-subtitle">
                  Add a new staff member to the system
                </p>
              </div>
            </div>

            {/* Form Card */}
            <div className="card admin-content-card">
              <div className="card-body p-4 p-xl-5">
                <form onSubmit={handleSubmit}>
                  
                  {/* Staff Information Section */}
                  <h6 className="fw-bold mb-4" style={{ color: "var(--clothcore-text)", fontSize: "16px" }}>
                    Staff Information
                  </h6>

                  <div className="row g-4">
                    {/* Staff ID */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Staff ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="staffId"
                        placeholder="e.g., STF-1001"
                        value={formData.staffId}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>

                    {/* Full Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        placeholder="Enter full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>

                    {/* Email Address */}
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
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                      <small className="text-muted d-block mt-1">
                        Used as this staff member's Supervisor login email.
                      </small>
                    </div>

                    {/* Password — used together with the email above to create
                        this staff member's Supervisor login right away. */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Password
                      </label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          name="password"
                          placeholder="Create a login password"
                          value={formData.password}
                          onChange={handleChange}
                          style={{
                            borderRadius: "10px",
                            border: "2px solid var(--clothcore-border)",
                            padding: "10px 40px 10px 14px",
                            fontSize: "14px"
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--clothcore-text-soft)" }}
                        >
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <small className="text-muted d-block mt-1">
                        {PASSWORD_REQUIREMENTS_LIST.join(' · ')}
                      </small>
                    </div>

                    {/* Confirm Password */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Confirm Password
                      </label>
                      <div className="position-relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          name="confirmPassword"
                          placeholder="Re-enter the password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          style={{
                            borderRadius: "10px",
                            border: "2px solid var(--clothcore-border)",
                            padding: "10px 40px 10px 14px",
                            fontSize: "14px"
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--clothcore-text-soft)" }}
                        >
                          {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>

                    {/* Department */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Department
                      </label>
                      <select
                        className="form-select"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Starting Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Starting Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>
                  </div>

                  
                  {/* Additional Information Section */}
                  <h6 className="fw-bold mb-4" style={{ color: "var(--clothcore-text)", fontSize: "16px" }}>
                    Additional Information
                  </h6>

                  <div className="row g-4">
                    {/* Address */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Address
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="emergencyContact"
                        placeholder="Enter emergency contact number"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                      />
                    </div>

                    {/* Notes */}
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Notes
                      </label>
                      <textarea
                        className="form-control"
                        name="notes"
                        placeholder="Enter any additional notes (optional)"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px",
                          resize: "vertical"
                        }}
                      />
                    </div>
                  </div>

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
                        fontWeight: "500"
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
                        cursor: submitting ? "not-allowed" : "pointer"
                      }}
                    >
                      <PersonPlus size={18} />
                      {submitting ? 'Adding Staff...' : 'Add Staff Member'}
                    </button>
                  </div>

                </form>
              </div>
            </div>

      {/* CSS */}
      <style>
        {`
          .form-control:focus, .form-select:focus {
            border-color: var(--clothcore-purple);
            box-shadow: 0 0 0 3px rgba(82, 43, 91, 0.1);
          }
          
          .border-dashed {
            border-style: dashed;
          }
          
          .rounded-4 {
            border-radius: 16px;
          }
        `}
      </style>

      {/* Success screen — Staff profile saved. The Supervisor login was
          created automatically using the email + password entered above;
          this just confirms it (or, if that step failed, offers the
          existing fallback page to finish it). */}
      {savedStaff && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "18px" }}>
              <div className="modal-body text-center" style={{ padding: "36px 32px" }}>
                {accountCreated ? (
                  <>
                    <CheckCircleFill size={44} style={{ color: "var(--clothcore-success)" }} className="mb-3" />
                    <h4 className="fw-bold mb-2" style={{ color: "var(--clothcore-text)" }}>
                      Staff member added and login created.
                    </h4>
                    <p className="text-muted mb-4">
                      {savedStaff.name} ({savedStaff.staffId}) has been saved. They can now sign in
                      at the normal Login page using <strong>{formData.email.trim().toLowerCase()}</strong> and
                      the password you just set.
                    </p>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleFill size={40} style={{ color: "var(--clothcore-warning, #d97706)" }} className="mb-3" />
                    <h4 className="fw-bold mb-2" style={{ color: "var(--clothcore-text)" }}>
                      Staff profile saved — login not created yet.
                    </h4>
                    <p className="text-muted mb-4">
                      {savedStaff.name} ({savedStaff.staffId}) has been saved, but the Supervisor
                      login could not be created: {accountError}
                    </p>
                  </>
                )}

                <div className="d-flex flex-column gap-2">
                  {!accountCreated && (
                    <button
                      type="button"
                      className="btn py-2 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => navigate(`/admin/staff/${savedStaff._id}/create-account`)}
                      style={{
                        background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                        color: "white",
                        borderRadius: "10px",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      <ShieldLock size={16} /> Create Login Account
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn py-2"
                    onClick={() => navigate('/staff')}
                    style={{
                      borderRadius: "10px",
                      border: "2px solid var(--clothcore-border)",
                      background: "rgba(82,43,91,0.06)",
                      color: "var(--clothcore-text)",
                      fontWeight: 500,
                      fontSize: "14px",
                    }}
                  >
                    Return to Staff Management
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

export default AdminAddStaff;