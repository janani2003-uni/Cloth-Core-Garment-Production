import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from "../../components/AdminLayout";
import axios from 'axios';
import {
  PersonPlus
} from 'react-bootstrap-icons';

function AdminAddStaff() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    staffId: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    joiningDate: '',
    status: 'Active',
    address: '',
    emergencyContact: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const departments = [
    'Cutting',
    'Sewing',
    'Quality Control',
    'Finishing',
    'Maintenance',
    'Packing',
    'Stores',
    'Delivery',
    'Administration',
    'HR'
  ];

  const positions = [
    'Cutter',
    'Sewing Operator',
    'QC Inspector',
    'Finishing Operator',
    'Technician',
    'Packing Operator',
    'Store Keeper',
    'Driver',
    'Supervisor',
    'Manager',
    'Assistant'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      staffId: 'Staff ID',
      fullName: 'Full Name',
      phone: 'Phone Number',
      department: 'Department',
      position: 'Position',
      joiningDate: 'Joining Date'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`${label} is required`);
        return;
      }
    }

    // Prepare payload
    const payload = {
      staffId: formData.staffId.trim(),
      name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department,
      position: formData.position,
      joiningDate: formData.joiningDate,
      status: formData.status,
      address: formData.address.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      notes: formData.notes.trim(),
      attendance: "Present"
    };

    try {
      setSubmitting(true);
      
      const response = await axios.post('http://localhost:5000/api/staff', payload);
      
      // Show success message from backend
      alert(response.data.message || 'Staff member added successfully!');
      
      // Navigate to staff page after successful save
      navigate('/staff');
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
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2 className="fw-bold mb-0" style={{ color: "var(--clothcore-text)", fontSize: "28px" }}>
                  Add Staff Member
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
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
                      />
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

                    {/* Position */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Position
                      </label>
                      <select
                        className="form-select"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      >
                        <option value="">Select position</option>
                        {positions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>

                    {/* Joining Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Joining Date
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

                    {/* Status */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "var(--clothcore-text)" }}>
                        Status
                      </label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid var(--clothcore-border)",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Suspended">Suspended</option>
                      </select>
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
                        background: "rgba(255,255,255,0.055)",
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
    </AdminLayout>
  );
}

export default AdminAddStaff;