import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";


function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      {/* Top Header Box */}
      <div className="bg-white border rounded p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          {/* Logo with Text */}
          <div className="d-flex align-items-center">
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

      {/* Success Card */}
      <div className="card">
        <div className="card-body p-5 text-center">
          {/* Success Icon */}
          <div
            className="rounded-circle bg-success text-white mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{
              width: "80px",
              height: "80px",
              fontSize: "40px"
            }}
          >
            ✓
          </div>

          <h2 className="fw-bold mb-2">Order Successfully Submitted!</h2>
          <p className="text-muted mb-4">Your order has been placed and is now pending review.</p>

          <hr className="my-4" style={{ maxWidth: "400px", margin: "0 auto" }} />

          {/* Order Details */}
          <div className="row mt-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <div className="col-6 text-start">
              <p className="text-muted mb-1">Order Number</p>
              <p className="text-muted mb-1">Status</p>
              <p className="text-muted mb-1">Expected Response</p>
              <p className="text-muted mb-0">Estimated Finish Date</p>
            </div>
            <div className="col-6 text-end">
              <p className="fw-bold mb-1">ORD-2026-006</p>
              <p className="fw-bold text-warning mb-1">Pending Review</p>
              <p className="fw-bold mb-1">Within 24 Hours</p>
              <p className="fw-bold mb-0">02 Apr 2026</p>
            </div>
          </div>

          <hr className="my-4" style={{ maxWidth: "400px", margin: "0 auto" }} />

          {/* Action Buttons */}
          <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
            <button 
              className="btn btn-outline-primary px-4"
              onClick={() => navigate("/orders")}
            >
              📋 View My Orders
            </button>
            <button className="btn btn-outline-secondary px-4">
              📄 Download Receipt
            </button>
            <button className="btn btn-success px-4">
              💳 Make Payment
            </button>
          </div>

          <hr className="my-4" style={{ maxWidth: "400px", margin: "0 auto" }} />

          {/* New Order */}
          <div className="mt-4">
            <p className="text-muted mb-2">Need another order?</p>
            <button
              className="btn btn-primary px-5"
              onClick={() => navigate("/place-order")}
            >
              ➕ New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;