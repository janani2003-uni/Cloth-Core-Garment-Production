import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function OrderDelivery() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deliveryDate: "2024-06-25",
    address: "No. 123, Main Street, Colombo 05, Sri Lanka",
    deliveryMethod: "Factory Delivery",
    specialInstructions: "",
    garmentType: "Bespoke Suit",
    fabricType: "Premium Wool - Scabal",
    complexity: "High",
    quantity: 1
  });

  // Mock data for estimates
  const estimatedDate = "October 18, 2023";
  const workingDays = "26 Days";
  const completionTime = "41 Working Days";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCalculateEstimate = () => {
    alert("Calculating delivery estimate...");
  };

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        background: "#f5f7fb"
      }}
    >
      <Sidebar />

      <div
        className="flex-grow-1"
        style={{
          padding: "20px"
        }}
      >
        {/* REMOVED the empty div that was closing the container */}
        <div className="container py-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="fw-bold" style={{ fontSize: "2.2rem" }}>
              <span style={{ 
                background: "linear-gradient(45deg, #f2a100, #ff6f00)",
                padding: "5px 20px",
                borderRadius: "10px",
                color: "white",
                marginRight: "15px"
              }}>
                Step 5
              </span>
              <span style={{ color: "#0b3aa0" }}>
                Delivery Information
              </span>
            </h1>
            <p className="text-muted mt-2" style={{ fontSize: "1.1rem" }}>
              Provide delivery details for your order
            </p>
          </div>

          <div className="row">
            {/* Left Column - Delivery Details */}
            <div className="col-lg-7">
              {/* Delivery Date */}
              <div className="card border-0 mb-4" style={{ 
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      fontSize: "1rem",
                      padding: "6px 15px",
                      borderRadius: "10px",
                      color: "white"
                    }}>
                      📅
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                      Delivery Date
                    </h5>
                  </div>
                  <input
                    type="date"
                    className="form-control"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 15px",
                      border: "2px solid #e0e0e0",
                      fontSize: "16px"
                    }}
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card border-0 mb-4" style={{ 
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      fontSize: "1rem",
                      padding: "6px 15px",
                      borderRadius: "10px",
                      color: "white"
                    }}>
                      📍
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                      Delivery Address
                    </h5>
                  </div>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    style={{
                      borderRadius: "12px",
                      padding: "12px 15px",
                      border: "2px solid #e0e0e0",
                      fontSize: "16px",
                      resize: "vertical"
                    }}
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div className="card border-0 mb-4" style={{ 
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      fontSize: "1rem",
                      padding: "6px 15px",
                      borderRadius: "10px",
                      color: "white"
                    }}>
                      🚚
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                      Delivery Method
                    </h5>
                  </div>
                  <select
                    className="form-select"
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 15px",
                      border: "2px solid #e0e0e0",
                      fontSize: "16px"
                    }}
                  >
                    <option value="Factory Delivery">Factory Delivery</option>
                    <option value="Home Delivery">Home Delivery</option>
                    <option value="Pickup Point">Pickup Point</option>
                    <option value="Courier Service">Courier Service</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="card border-0 mb-4" style={{ 
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      fontSize: "1rem",
                      padding: "6px 15px",
                      borderRadius: "10px",
                      color: "white"
                    }}>
                      📝
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                      Special Instructions (Optional)
                    </h5>
                  </div>
                  <textarea
                    className="form-control"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Add any note..."
                    style={{
                      borderRadius: "12px",
                      padding: "12px 15px",
                      border: "2px solid #e0e0e0",
                      fontSize: "16px",
                      resize: "vertical"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Delivery Estimate */}
            <div className="col-lg-5">
              {/* Calculate Delivery Estimate */}
              <div className="card border-0 mb-4" style={{ 
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)"
              }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3" style={{ color: "#0b3aa0" }}>
                    🕐 Calculate Delivery Estimate
                  </h5>

                  {/* Garment Type */}
                  <div className="mb-3">
                    <label className="fw-bold mb-2" style={{ fontSize: "14px", color: "#555" }}>
                      Garment Type
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="garmentType"
                      value={formData.garmentType}
                      onChange={handleChange}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 15px",
                        border: "2px solid #e0e0e0",
                        fontSize: "16px"
                      }}
                    />
                  </div>

                  {/* Fabric Type */}
                  <div className="mb-3">
                    <label className="fw-bold mb-2" style={{ fontSize: "14px", color: "#555" }}>
                      Fabric Type
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="fabricType"
                      value={formData.fabricType}
                      onChange={handleChange}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 15px",
                        border: "2px solid #e0e0e0",
                        fontSize: "16px"
                      }}
                    />
                  </div>

                  {/* Complexity */}
                  <div className="mb-3">
                    <label className="fw-bold mb-2" style={{ fontSize: "14px", color: "#555" }}>
                      Complexity
                    </label>
                    <div className="d-flex gap-3">
                      {["High", "Medium", "Low"].map((level) => (
                        <div key={level} className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="complexity"
                            value={level}
                            checked={formData.complexity === level}
                            onChange={handleChange}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label" style={{ cursor: "pointer" }}>
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-3">
                    <label className="fw-bold mb-2" style={{ fontSize: "14px", color: "#555" }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      style={{
                        borderRadius: "12px",
                        padding: "12px 15px",
                        border: "2px solid #e0e0e0",
                        fontSize: "16px",
                        width: "100px"
                      }}
                    />
                  </div>

                  {/* Calculate Button */}
                  <button
                    className="btn w-100 py-2"
                    style={{
                      background: "linear-gradient(45deg, #f2a100, #ff6f00)",
                      color: "white",
                      borderRadius: "30px",
                      fontWeight: "bold",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onClick={handleCalculateEstimate}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Calculate Estimate
                  </button>
                </div>
              </div>

              {/* Estimated Date Card */}
              <div className="card border-0 mb-4" style={{ 
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <span className="text-muted">Estimated Date</span>
                    <span className="fw-bold" style={{ fontSize: "18px", color: "#0b3aa0" }}>
                      {estimatedDate}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <span className="text-muted">Working Days</span>
                    <span className="fw-bold" style={{ fontSize: "18px", color: "#f2a100" }}>
                      {workingDays}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Completion Time</span>
                    <span className="fw-bold" style={{ fontSize: "18px", color: "#28a745" }}>
                      {completionTime}
                    </span>
                  </div>
                  <small className="text-muted d-block mt-2 text-center">
                    Includes sourcing & fittings
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              className="btn px-5 py-2"
              style={{
                background: "#6c757d",
                color: "white",
                borderRadius: "30px",
                fontWeight: "bold",
                border: "none",
                transition: "all 0.3s ease"
              }}
              onClick={() => navigate("/ste4")}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              ← Back
            </button>
            <button
              className="btn px-5 py-2 fw-bold"
              style={{
                background: "linear-gradient(45deg, #0b3aa0, #1a6bff)",
                color: "white",
                borderRadius: "30px",
                border: "none",
                boxShadow: "0 4px 25px rgba(11, 58, 160, 0.4)",
                transition: "all 0.3s ease"
              }}
              onClick={() => navigate("/step5")}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Next: Review Order →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDelivery;