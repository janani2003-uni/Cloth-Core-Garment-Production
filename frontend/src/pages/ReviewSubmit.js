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

          <h3 className="fw-bold mb-4">
            Step 3: Review & Submit
          </h3>

          <div className="border rounded p-4">

            <div className="row">

              <div className="col-md-6">
                <p>Garment Type</p>
                <strong>Trouser</strong>

                <br /><br />

                <p>Total Quantity</p>
                <strong>100 units</strong>

                <br /><br />

                <p>Size Breakdown</p>
                <span className="badge bg-light text-dark border">
                  L:100
                </span>
              </div>

              <div className="col-md-6">
                <p>Fabric & Color</p>
                <strong>cotton - Not specified</strong>

                <br /><br />

                <p>Requested Delivery</p>
                <strong>2026-03-26</strong>
              </div>

            </div>

            <hr />

            <div
              className="p-3 rounded"
              style={{ backgroundColor: "#f5f0cf" }}
            >
              <h6>Next Steps</h6>

              <p className="mb-0">
                Once submitted, our team will review your order and
                prepare a physical sample. Production will only begin
                after you approve the sample and make the advance payment.
              </p>
            </div>

          </div>

          <hr />

          <div className="d-flex justify-content-between mt-3">

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