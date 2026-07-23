
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  CreditCard,
  Plus,
  Calendar,
  Shield,
} from "react-bootstrap-icons";
import ShopTopbar from "../components/ShopTopbar";

function OrderStep6() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="container-fluid p-0" style={{
        background: "var(--clothcore-bg, #fdf8f7)",
        minHeight: "100vh"
      }}>
        <ShopTopbar />
        <div className="container py-5">
          <div className="d-flex justify-content-center">
          <div
            className="card admin-content-card border-0 text-center p-5"
            style={{ borderRadius: "25px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", maxWidth: 520 }}
          >
            <h4 className="fw-bold mb-3" style={{ color: "#dfb6b2" }}>
              No recent order found
            </h4>
            <p className="text-muted mb-4">
              We couldn't find a just-placed order to show. If you just submitted
              one, check "My Orders". Otherwise, start a new order.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn px-4 py-2 fw-bold"
                style={{
                  background: "linear-gradient(135deg, #522b5b, #854f6c)",
                  color: "white",
                  borderRadius: "15px",
                  border: "none",
                }}
                onClick={() => navigate("/orders")}
              >
                View My Orders
              </button>
              <button
                className="btn px-4 py-2 fw-bold"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  color: "#dfb6b2",
                  borderRadius: "15px",
                  border: "1.5px solid #854f6c",
                }}
                onClick={() => navigate("/step1")}
              >
                Start a New Order
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "—";

  return (
    <div className="container-fluid p-0" style={{
      background: "var(--clothcore-bg, #fdf8f7)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden"
    }}>
      <ShopTopbar />

      <div className="container py-4 position-relative">
        {/* Header with animated gradient */}
        <div className="mb-4 text-center">
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #2b124c, #522b5b)",
            padding: "8px 30px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(82,43,91,0.3)"
          }}>
            <h1 className="fw-bold mb-0" style={{ color: "white", fontSize: "1.5rem" }}>
              ✅ Order Confirmed
            </h1>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card admin-content-card border-0" style={{
              borderRadius: "25px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              overflow: "hidden"
            }}>

              {/* Card Header with Gradient */}
              <div style={{
                background: "linear-gradient(135deg, #522b5b, #854f6c)",
                padding: "20px 30px",
                color: "white"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">Order Summary</h5>
                    <small className="opacity-75">Your order has been submitted</small>
                  </div>
                  <div className="text-end">
                    <Shield size={30} className="opacity-75" />
                  </div>
                </div>
              </div>

              <div className="card-body p-4">

                {/* Order Info Grid */}
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Order ID</label>
                      <p className="fw-bold mb-0" style={{ color: "#dfb6b2", fontSize: "18px", letterSpacing: "1px" }}>
                        {order.orderId}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">
                        <Calendar size={14} className="me-1" /> Order Date
                      </label>
                      <p className="fw-bold mb-0">{orderDate}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Item</label>
                      <p className="fw-bold mb-0">{order.item}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Quantity</label>
                      <p className="fw-bold mb-0">{order.quantity} pcs</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Status</label>
                      <div>
                        <span className="badge" style={{
                          background: "rgba(217,131,36,0.15)",
                          color: "#d98324",
                          padding: "6px 20px",
                          fontSize: "14px",
                          borderRadius: "20px"
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "rgba(26,156,95,0.12)",
                      borderRadius: "15px",
                      height: "100%",
                      border: "1px solid rgba(26,156,95,0.2)"
                    }}>
                      <label className="small text-muted fw-bold">Total Amount</label>
                      <p className="fw-bold mb-0" style={{ color: "#1a9c5f", fontSize: "20px" }}>
                        Rs. {Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#854f6c", borderWidth: "2px", margin: "24px 0" }} />

                {/* Action Buttons */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <button
                      className="btn w-100 py-3 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #522b5b, #854f6c)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(82,43,91,0.3)",
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
                  <div className="col-md-6">
                    <button
                      className="btn w-100 py-3 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #1a9c5f, #22b872)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(26,156,95,0.3)",
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

                {/* New Order Section */}
                <div className="text-center">
                  <button
                    className="btn px-5 py-3 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #522b5b, #854f6c)",
                      color: "white",
                      borderRadius: "50px",
                      border: "none",
                      boxShadow: "0 4px 25px rgba(82,43,91,0.4)",
                      transition: "all 0.3s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                    onClick={() => navigate("/step1")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
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

      {/* CSS Animations */}
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

          .card {
            animation: fadeIn 0.6s ease;
          }

          .btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}
      </style>
    </div>
  );
}

export default OrderStep6;
