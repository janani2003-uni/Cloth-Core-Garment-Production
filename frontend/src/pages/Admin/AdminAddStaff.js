import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Adminsidebar from "../../components/Adminsidebar";
import Admintopbar from "../../components/Admintopbar";
import axios from 'axios';
import { 
  PersonPlus,
  Camera,
  X,
  ArrowLeft
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
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
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
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f0f5" }}>
      <Adminsidebar />
      
      <div className="flex-grow-1">
        <Admintopbar />
        
        <div style={{ padding: "24px" }}>
          <div className="container-fluid px-0">
            
            {/* Breadcrumb */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Dashboard</span>
              <span style={{ color: '#6c757d', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Staff Management</span>
              <span style={{ color: '#6c757d', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: '#0b3aa0', fontWeight: '600', fontSize: '14px' }}>Add Staff Member</span>
            </div>

            {/* Page Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2 className="fw-bold mb-0" style={{ color: "#1a1a2e", fontSize: "28px" }}>
                  Add Staff Member
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                  Add a new staff member to the system
                </p>
              </div>
            </div>

            {/* Form Card */}
            <div className="card border-0" style={{ 
              borderRadius: "16px", 
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
            }}>
              <div className="card-body p-4 p-xl-5">
                <form onSubmit={handleSubmit}>
                  
                  {/* Staff Information Section */}
                  <h6 className="fw-bold mb-4" style={{ color: "#1a1a2e", fontSize: "16px" }}>
                    Staff Information
                  </h6>

                  <div className="row g-4">
                    {/* Staff ID */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>

                    {/* Full Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>

                    {/* Email Address */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>

                    {/* Department */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
                        Department
                      </label>
                      <select
                        className="form-select"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
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
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
                        Position
                      </label>
                      <select
                        className="form-select"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
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
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
                        Status
                      </label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
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
                  <h6 className="fw-bold mb-4" style={{ color: "#1a1a2e", fontSize: "16px" }}>
                    Additional Information
                  </h6>

                  <div className="row g-4">
                    {/* Address */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
                          padding: "10px 14px",
                          fontSize: "14px"
                        }}
                      />
                    </div>

                    {/* Notes */}
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                          border: "2px solid #e9ecef",
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
                        border: "2px solid #e9ecef",
                        background: "white",
                        color: "#1a1a2e",
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
                          ? "linear-gradient(135deg, #a5a5a5, #7a7a7a)" 
                          : "linear-gradient(135deg, #6366f1, #8b5cf6)",
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

          </div>
        </div>
      </div>

      {/* CSS */}
      <style>
        {`
          .form-control:focus, .form-select:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
          }
          
          .border-dashed {
            border-style: dashed;
          }
          
          .rounded-4 {
            border-radius: 16px;
          }
        `}
      </style>
    </div>
  );
}

export default AdminAddStaff;