import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function ReviewSubmit() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      {/* Top Header Box */}
      <div className="bg-white border rounded p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <img
            src={logo}
            alt="logo"
            style={{
              width: "120px",
              height: "auto"
            }}
          />
             <div className="ms-3">
              <div className="fw-bold" style={{ fontSize: "30px", color: "#0b3aa0" }}>
                ClothCore
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d", lineHeight: "1.2" }}>
                Garment Productions
              </div>
            </div>
          <div className="d-flex align-items-center">
            <div className="me-4 position-relative">
              <span style={{ fontSize: "24px" }}>🔔</span>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                1
              </span>
            </div>
            <div className="text-end me-3">
              <div className="fw-bold">Saman Fashions</div>
              <small className="text-muted">shop owner</small>
            </div>
            <div
              className="rounded-circle border"
              style={{
                width: "55px",
                height: "55px"
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="fw-bold">Garment Details</h1>
      <p className="text-muted mb-4">Submit a new garment production order for your shop.</p>

      {/* Step Indicator */}
      <div className="bg-white border rounded p-4 mb-4">
        <div className="d-flex justify-content-between text-center">
          <div>
            <div
              className="rounded-circle bg-primary text-white mx-auto"
              style={{
                width: "40px",
                height: "40px",
                lineHeight: "40px"
              }}
            >
              ✓
            </div>
            <small>Garment Details</small>
          </div>
          <div>
            <div
              className="rounded-circle bg-primary text-white mx-auto"
              style={{
                width: "40px",
                height: "40px",
                lineHeight: "40px"
              }}
            >
              ✓
            </div>
            <small>Quantities</small>
          </div>
          <div>
            <div
              className="rounded-circle bg-primary text-white mx-auto"
              style={{
                width: "40px",
                height: "40px",
                lineHeight: "40px"
              }}
            >
              3
            </div>
            <small>Review & Submit</small>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-4">
          <h3 className="fw-bold mb-1">Step 3: Review & Submit</h3>
          <p className="text-muted mb-4">Please review your order before submission.</p>

          {/* Row for Order Summary and Cost Summary */}
          <div className="row">
            {/* Left Side - Order Summary */}
            <div className="col-md-7">
              <div className="card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">📋 Order Summary</h5>

                  <div className="row mb-2">
                    <div className="col-5 text-muted">Garment Type</div>
                    <div className="col-7 fw-semibold">T-Shirt</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Fabric</div>
                    <div className="col-7 fw-semibold">100% Cotton</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Color</div>
                    <div className="col-7 fw-semibold">Navy Blue</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Total Quantity</div>
                    <div className="col-7 fw-semibold">150 units</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Size Breakdown</div>
                    <div className="col-7">
                      <div>S: 20</div>
                      <div>M: 30</div>
                      <div>L: 40</div>
                      <div>XL: 10</div>
                      <div>XXL: 0</div>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Delivery Date</div>
                    <div className="col-7 fw-semibold">26 Mar 2026</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Estimated Finish</div>
                    <div className="col-7 fw-semibold">02 Apr 2026</div>
                  </div>
                  <div className="row">
                    <div className="col-5 text-muted">Special Instructions</div>
                    <div className="col-7">Logo on left pocket, individual packaging</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Cost Summary */}
            <div className="col-md-5">
              <div className="card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">💰 Cost Summary (Estimated)</h5>

                  <div className="row mb-2">
                    <div className="col-6 text-muted">Unit Price</div>
                    <div className="col-6 text-end fw-semibold">LKR 7,000</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-6 text-muted">Quantity</div>
                    <div className="col-6 text-end fw-semibold">150</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-6 text-muted">Sub Total</div>
                    <div className="col-6 text-end fw-semibold">LKR 1,050,000</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-6 text-muted">VAT (7%)</div>
                    <div className="col-6 text-end fw-semibold">LKR 73,500</div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-6">
                      <strong>Total Amount</strong>
                    </div>
                    <div className="col-6 text-end">
                      <strong className="text-success" style={{ fontSize: "20px" }}>
                        LKR 750,000
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Next Steps - Full width below */}
<div className="row mt-4">
  <div className="col-12">
    <div className="card">
      <div className="card-body">
        <h5 className="fw-bold mb-3">📌 Next Steps After Submission</h5>
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div className="d-flex align-items-center">
            <span className="badge bg-primary rounded-circle me-2" style={{ width: "28px", height: "30px", lineHeight: "28px" }}>
              1
            </span>
            <span>Sample Preparation</span>
          </div>
          <span className="text-muted mx-2" style={{ fontSize: "50px" }}>→</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary rounded-circle me-2" style={{ width: "28px", height: "30px", lineHeight: "28px" }}>
              2
            </span>
            <span>Sample Approval</span>
          </div>
          <span className="text-muted mx-2" style={{ fontSize: "50px" }}>→</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary rounded-circle me-2" style={{ width: "28px", height: "30px", lineHeight: "28px" }}>
              3
            </span>
            <span>Advance Payment</span>
          </div>
          <span className="text-muted mx-2" style={{ fontSize: "50px" }}>→</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary rounded-circle me-2" style={{ width: "28px", height: "30px", lineHeight: "28px" }}>
              4
            </span>
            <span>Production</span>
          </div>
          <span className="text-muted mx-2" style={{ fontSize: "50px" }}>→</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary rounded-circle me-2" style={{ width: "28px", height: "30px", lineHeight: "28px" }}>
              5
            </span>
            <span>Delivery</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
          <hr className="mt-4" />

          <div className="d-flex justify-content-between">
                        <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/quantities")}
            >
              ← Back
            </button>
            <button
  className="btn btn-primary px-5"
  onClick={() => navigate("/order-success")}
>
  Submit
</button>

          </div>

        </div>
      </div>

    </div>
  );
}

export default ReviewSubmit;
