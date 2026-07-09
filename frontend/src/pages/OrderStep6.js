
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  FileText, 
  Download, 
  CreditCard, 
  Plus, 
  Clock, 
  Calendar,
  Award,
  GraphUp,
  Shield,
  Star
} from "react-bootstrap-icons";

function OrderStep6() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock data - in real app this would come from the backend
  const orderData = {
    orderId: "ORD-2026-000123",
    orderDate: "02 May 2026, 10:30 AM",
    status: "Pending Review",
    advancePaid: 60000.00,
    balancePayment: 60000.00,
    expectedResponse: "Within 24 Hours",
    estimatedDelivery: "15-20 Working Days",
    orderItems: 3,
    totalItems: 5
  };

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <div className="container-fluid p-0" style={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Decorative Background Elements */}
      <div style={{
        position: "absolute",
        top: "-200px",
        right: "-200px",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(11,58,160,0.05) 0%, transparent 70%)",
        borderRadius: "50%"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-200px",
        left: "-200px",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(242,161,0,0.05) 0%, transparent 70%)",
        borderRadius: "50%"
      }} />

      <div className="container py-4 position-relative">

        {/* Header with animated gradient */}
        <div className="mb-4 text-center">
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #f2a100, #ff6f00)",
            padding: "8px 30px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(242,161,0,0.3)"
          }}>
            <h1 className="fw-bold mb-0" style={{ color: "white", fontSize: "1.5rem" }}>
              ✅ Order Confirmed
            </h1>
          </div>
        </div>








       














        {/* Order Details Card */}
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0" style={{ 
              borderRadius: "25px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              overflow: "hidden"
            }}>
              
              {/* Card Header with Gradient */}
              <div style={{
                background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                padding: "20px 30px",
                color: "white"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">Order Summary</h5>
                    <small className="opacity-75">Your order has been confirmed</small>
                  </div>
                  <div className="text-end">
                    <Shield size={30} className="opacity-75" />
                  </div>
                </div>
              </div>

              <div className="card-body p-4">
                
                {/* Order Info Grid - Premium Layout */}
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Order ID</label>
                      <p className="fw-bold mb-0" style={{ color: "#0b3aa0", fontSize: "18px", letterSpacing: "1px" }}>
                        {orderData.orderId}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">
                        <Calendar size={14} className="me-1" /> Order Date
                      </label>
                      <p className="fw-bold mb-0">{orderData.orderDate}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Status</label>
                      <div>
                        <span className="badge" style={{
                          background: "linear-gradient(135deg, #ff9800, #f57c00)",
                          color: "white",
                          padding: "6px 20px",
                          fontSize: "14px",
                          borderRadius: "20px"
                        }}>
                          {orderData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">
                        <Clock size={14} className="me-1" /> Expected Response
                      </label>
                      <p className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>{orderData.expectedResponse}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary - Premium Cards */}
                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
                      borderRadius: "15px",
                      border: "1px solid rgba(76, 175, 80, 0.2)"
                    }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <label className="small text-muted fw-bold">Advance Paid</label>
                          <p className="fw-bold mb-0" style={{ color: "#2e7d32", fontSize: "20px" }}>
                            Rs. {orderData.advancePaid.toFixed(2)}
                          </p>
                        </div>
                        <Award size={30} className="text-success opacity-50" />
                      </div>
                      <small className="text-success">✓ 50% paid</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                      borderRadius: "15px",
                      border: "1px solid rgba(11, 58, 160, 0.15)"
                    }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <label className="small text-muted fw-bold">Balance Payment</label>
                          <p className="fw-bold mb-0" style={{ color: "#0b3aa0", fontSize: "20px" }}>
                            Rs. {orderData.balancePayment.toFixed(2)}
                          </p>
                        </div>
                        <GraphUp size={30} className="text-primary opacity-50" />
                      </div>
                      <small className="text-primary">⏳ 50% remaining</small>
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#f2a100", borderWidth: "2px", margin: "24px 0" }} />

                {/* Action Buttons - Enhanced */}
                <div className="row g-3">
                  <div className="col-md-4">
                    <button
                      className="btn w-100 py-3 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(11,58,160,0.3)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                      onClick={() => navigate("/orders")}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0) scale(1)"}
                    >
                      <FileText size={20} /> View My Orders
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button
                      className="btn w-100 py-3 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #f2a100, #ff6f00)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(242,161,0,0.3)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                      onClick={() => {
                        const notification = document.createElement('div');
                        notification.style.cssText = `
                          position: fixed;
                          top: 20px;
                          right: 20px;
                          background: #4CAF50;
                          color: white;
                          padding: 15px 25px;
                          border-radius: 10px;
                          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                          z-index: 9999;
                          animation: slideInRight 0.5s ease;
                        `;
                        notification.textContent = '✅ Receipt downloaded successfully!';
                        document.body.appendChild(notification);
                        setTimeout(() => {
                          notification.style.animation = 'slideOutRight 0.5s ease';
                          setTimeout(() => document.body.removeChild(notification), 500);
                        }, 3000);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0) scale(1)"}
                    >
                      <Download size={20} /> Download Receipt
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button
                      className="btn w-100 py-3 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(76,175,80,0.3)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                      onClick={() => navigate("/dashboard")}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0) scale(1)"}
                    >
                      <CreditCard size={20} /> Back to Dashboard
                    </button>
                  </div>
                </div>

                <hr style={{ borderColor: "#e0e0e0", borderWidth: "1px", margin: "24px 0" }} />

                {/* New Order Section - Enhanced */}
                <div className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white"
                    }}>
                      <Star size={20} />
                    </div>
                    <p className="fw-bold mb-0" style={{ color: "#555" }}>Need another order?</p>
                  </div>
                  <button
                    className="btn px-5 py-3 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      color: "white",
                      borderRadius: "50px",
                      border: "none",
                      boxShadow: "0 4px 25px rgba(11,58,160,0.4)",
                      transition: "all 0.3s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                    onClick={() => navigate("/place-order")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 8px 35px rgba(11,58,160,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 4px 25px rgba(11,58,160,0.4)";
                    }}
                  >
                    <Plus size={24} /> New Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CSS Animations - Enhanced */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          .card {
            animation: fadeIn 0.6s ease;
          }

          .card-body .row .col-md-6 {
            animation: fadeIn 0.5s ease;
          }

          .btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .card-body .row .col-md-6 > div {
            transition: all 0.3s ease;
          }

          .card-body .row .col-md-6 > div:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          }

          .text-center > div:first-child {
            animation: bounceIn 0.8s ease;
          }

          @media (max-width: 768px) {
            .col-md-4 {
              margin-bottom: 10px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default OrderStep6;