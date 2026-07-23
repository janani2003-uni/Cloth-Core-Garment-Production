
import React from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";

function OrderStep4() {
  const navigate = useNavigate();

  const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");

  const hasRequiredFields =
    draft.garment &&
    draft.fabric &&
    draft.color &&
    typeof draft.unitPrice === "number" &&
    draft.sizes &&
    typeof draft.totalQuantity === "number" &&
    draft.totalQuantity > 0;

  if (!hasRequiredFields) {
    return (
      <ShopOwnerLayout contentClassName="container py-4" contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}>
            <div
              className="card admin-content-card border-0 text-center p-5"
              style={{ borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}
            >
              <h4 className="fw-bold mb-3" style={{ color: "#dfb6b2" }}>
                Please complete the previous steps first
              </h4>
              <p className="text-muted mb-4">
                We couldn't find a complete order draft. Start again from Step 1 to
                select your garment, fabric, color, and quantities.
              </p>
              <button
                className="btn px-5 py-2 fw-bold mx-auto"
                style={{
                  background: "linear-gradient(45deg, #522b5b, #854f6c)",
                  color: "white",
                  borderRadius: "30px",
                  border: "none",
                  maxWidth: "220px"
                }}
                onClick={() => navigate("/step1")}
              >
                Go to Step 1
              </button>
            </div>
      </ShopOwnerLayout>
    );
  }

  const totalQuantity = draft.totalQuantity;
  const subTotal = draft.unitPrice * draft.totalQuantity;
  const discount = 0;
  const tax = 0;
  const grandTotal = subTotal - discount + tax;

  return (
  <ShopOwnerLayout contentClassName="" contentStyle={{ padding: "20px" }}>

      <div className="container py-4">

        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold" style={{ fontSize: "2.2rem" }}>
            <span style={{
              background: "linear-gradient(45deg, #2b124c, #522b5b)",
              padding: "5px 20px",
              borderRadius: "10px",
              color: "white",
              marginRight: "15px"
            }}>
              Step 4
            </span>
            <span style={{ color: "#dfb6b2" }}>
              Review Your Order
            </span>
          </h1>
        </div>

        <div className="row">

          {/* Left Column - Order Summary & Design */}
          <div className="col-lg-7">

            {/* Order Summary Card */}
            <div className="card admin-content-card border-0 mb-4" style={{
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #522b5b, #854f6c)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    1
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                    Order Summary
                  </h4>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Garment Type</label>
                    <p className="fw-bold mb-0">{draft.garment}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Fabric / Material</label>
                    <p className="fw-bold mb-0">{draft.fabric}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Color</label>
                    <p className="fw-bold mb-0">{draft.color}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Unit Price</label>
                    <p className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                      Rs. {draft.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Total Quantity</label>
                    <p className="fw-bold mb-0">{totalQuantity} pcs</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Sub Total</label>
                    <p className="fw-bold text-success mb-0">
                      Rs. {subTotal.toFixed(2)}
                    </p>
                  </div>
                  {draft.designNotes && (
                    <div className="col-12">
                      <label className="text-muted small">Design Notes</label>
                      <p className="mb-0">{draft.designNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Design Preview Card */}
            <div className="card admin-content-card border-0 mb-4" style={{
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #522b5b, #854f6c)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    2
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
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
                  <div style={{ fontSize: "80px", marginBottom: "15px" }}>
                    👕
                  </div>
                  <p className="text-muted mb-0">{draft.garment} Design</p>
                  <small className="text-muted">Design preview will appear here</small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Size Breakdown & Price */}
          <div className="col-lg-5">

            {/* Size Breakdown Card */}
            <div className="card admin-content-card border-0 mb-4" style={{
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #522b5b, #854f6c)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    3
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                    Size Breakdown
                  </h4>
                </div>

                <div className="table-responsive">
                  <table className="table admin-table table-bordered text-center" style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <thead style={{ background: "linear-gradient(135deg, #2b124c, #522b5b)", color: "white" }}>
                      <tr>
                        <th style={{ padding: "10px 8px" }}>Size</th>
                        {Object.keys(draft.sizes).map((size) => (
                          <th key={size} style={{ padding: "10px 8px" }}>{size}</th>
                        ))}
                        <th style={{ padding: "10px 8px" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold">Quantity (pcs)</td>
                        {Object.values(draft.sizes).map((qty, index) => (
                          <td key={index} style={{ padding: "10px 8px" }}>{qty}</td>
                        ))}
                        <td className="fw-bold" style={{
                          background: "rgba(82,43,91,0.12)",
                          color: "#dfb6b2"
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
            <div className="card admin-content-card border-0" style={{
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.12)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #522b5b, #854f6c)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    4
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
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
                    <span className="fw-bold">Rs. {draft.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Sub Total</span>
                    <span className="fw-bold">Rs. {subTotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Discount</span>
                    <span className="fw-bold">Rs. {discount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span className="text-muted">Tax</span>
                    <span className="fw-bold">Rs. {tax.toFixed(2)}</span>
                  </div>
                </div>

                <hr style={{ borderColor: "#854f6c", borderWidth: "2px" }} />

                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>Grand Total</h5>
                  <h4 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                    Rs. {grandTotal.toFixed(2)}
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
              background: "linear-gradient(45deg, #522b5b, #854f6c)",
              color: "white",
              borderRadius: "30px",
              border: "none",
              boxShadow: "0 4px 25px rgba(82, 43, 91, 0.4)",
              transition: "all 0.3s ease"
            }}
            onClick={() => navigate("/order-delivery")}
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
  </ShopOwnerLayout>
  );
}

export default OrderStep4;
