import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">

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

    <div className="d-flex align-items-center">

      <div className="me-4 position-relative">
        <span style={{ fontSize: "24px" }}>🔔</span>

        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        >
          1
        </span>
      </div>

      <div className="text-end me-3">
        <div className="fw-bold">
          Saman Fashions
        </div>

        <small className="text-muted">
          shop owner
        </small>
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
<h1 className="fw-bold">
  Place Bulk Order
</h1>

<p className="text-muted mb-4">
  Submit a new garment production order for your shop.
</p>

      <div className="card mt-4">
        <div className="card-body text-center p-5">

          <div
            className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "90px",
              height: "90px",
              background: "#d4f5dd",
              fontSize: "45px",
              color: "green"
            }}
          >
            ✓
          </div>

          <h2 className="fw-bold">
            Order Submitted!
          </h2>

          <p className="text-muted">
            Your order has been successfully placed and is pending review. We will contact you shortly regarding the sample preparation.
          </p>

          <div className="d-flex justify-content-center gap-3 mt-4">

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/place-order")}
            >
              Place Another Order
            </button>

            <button className="btn btn-primary">
              Payment
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}

export default OrderSuccess;