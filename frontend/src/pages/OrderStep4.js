
import React, { useState, useContext } from "react";
import { OrderContext } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";



function OrderStep4() {
  const navigate = useNavigate();
  const { orderData, setOrderData } = useContext(OrderContext);

  // Mock data - in real app this would come from previous steps
  const reviewData = {
  garmentType: orderData.garment,
  fabric: orderData.fabric,
  color: orderData.color,
  designPreview: orderData.designPreview,
designFile: orderData.designFile,
  unitPrice: orderData.amount || 0,
  totalQuantity: orderData.totalQuantity || 0,
  estimatedPrice: (orderData.amount || 0) * (orderData.totalQuantity || 0),
  sizes: orderData.quantities || {},
  discount: 0,
  tax: 0
};

  const totalQuantity = reviewData.totalQuantity;
  const subTotal = reviewData.estimatedPrice;
  const discountAmount = (subTotal * reviewData.discount) / 100;
  const taxAmount = (subTotal * reviewData.tax) / 100;
  const grandTotal = subTotal - discountAmount + taxAmount;








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

      <div className="container py-4"></div>




        

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
              Step 4
            </span>
            <span style={{ color: "#0b3aa0" }}>
              Review Your Order
            </span>
          </h1>
        </div>

        <div className="row">

          {/* Left Column - Order Summary & Design */}
          <div className="col-lg-7">

            {/* Order Summary Card */}
            <div className="card border-0 mb-4" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    1
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                    Order Summary
                  </h4>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Garment Type</label>
                    <p className="fw-bold mb-0">{reviewData.garmentType}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Fabric / Material</label>
                    <p className="fw-bold mb-0">{reviewData.fabric}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Color</label>
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#1a237e",
                        marginRight: "10px"
                      }} />
                      <p className="fw-bold mb-0">{reviewData.color}</p>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Unit Price</label>
                    <p className="fw-bold text-primary mb-0">
                      Rs. {reviewData.unitPrice?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Total Quantity</label>
                    <p className="fw-bold mb-0">{reviewData.totalQuantity} pcs</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Estimated Price</label>
                    <p className="fw-bold text-success mb-0">
                      Rs. {reviewData.estimatedPrice?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="col-12">
                    <label className="text-muted small">You Save</label>
                    <p className="fw-bold text-danger mb-0">
                      Rs. {reviewData.discount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Preview Card */}
            <div className="card border-0 mb-4" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    2
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                    Design Preview
                  </h4>
                </div>

                <div className="text-center p-5" style={{
                  background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                  borderRadius: "16px",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  {reviewData.designPreview ? (
  <>
    <img
      src={reviewData.designPreview}
      alt="Design Preview"
      style={{
        maxWidth: "100%",
        maxHeight: "300px",
        objectFit: "contain",
        borderRadius: "12px",
        marginBottom: "15px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
      }}
    />

    <h6 className="text-success fw-bold">
      ✅ Design Uploaded
    </h6>

    <small className="text-muted">
      {reviewData.designFile}
    </small>
  </>
) : (
  <>
    <div style={{ fontSize: "80px", marginBottom: "15px" }}>
      👕
    </div>

    <p className="text-muted mb-0">
      T-Shirt Design
    </p>

    <small className="text-muted">
      Design preview will appear here
    </small>
  </>
)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Size Breakdown & Price */}
          <div className="col-lg-5">

            {/* Size Breakdown Card */}
            <div className="card border-0 mb-4" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    3
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                    Size Breakdown
                  </h4>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered text-center" style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <thead style={{ background: "linear-gradient(135deg, #f2a100, #ff6f00)", color: "white" }}>
                      <tr>
                        <th style={{ padding: "10px 8px" }}>Size</th>
                        {Object.keys(reviewData.sizes).map((size) => (
                          <th key={size} style={{ padding: "10px 8px" }}>{size}</th>
                        ))}
                        <th style={{ padding: "10px 8px" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold">Quantity (pcs)</td>
                        {Object.values(reviewData.sizes).map((qty, index) => (
                          <td key={index} style={{ padding: "10px 8px" }}>{qty}</td>
                        ))}
                        <td className="fw-bold" style={{ 
                          background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                          color: "#0b3aa0"
                        }}>
                          {totalQuantity}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Price Calculation Card */}
            <div className="card border-0" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.12)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    4
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                    Price Calculation
                  </h4>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Total Quantity</span>
                    <span className="fw-bold">{totalQuantity} pcs</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Unit Price</span>
                    <span className="fw-bold">Rs. {reviewData.unitPrice?.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Sub Total</span>
                    <span className="fw-bold">Rs. {subTotal?.toFixed(2)}</span>
                  </div>
                
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>Grand Total</h5>
                  <h4 className="fw-bold text-primary mb-0">
                    Rs. {grandTotal?.toFixed(2)}
                  </h4>
                </div>
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
            onClick={() => navigate("/step3")}
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
            onClick={() => {
  setOrderData({
    ...orderData,
    grandTotal: grandTotal,
  });

  navigate("/order-delivery");
}}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Next: Estimate Delivery →
          </button>
        </div>

      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .card {
            animation: fadeIn 0.5s ease;
          }

          .table-bordered {
            border: 2px solid #dee2e6;
          }

          .table-bordered td,
          .table-bordered th {
            border: 2px solid #dee2e6;
          }

          .btn:hover {
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
}

export default OrderStep4;