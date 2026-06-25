import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Quantities() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
        <div
  className="bg-white border rounded p-3 mb-4"
>
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
        <span style={{ fontSize: "24px" }}>
          🔔
        </span>

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

<h1 className="fw-bold">
  Place Bulk Order
</h1>

<p className="text-muted">
  Submit a new garment production order for your shop.
</p>

      <div className="card">
        <div className="card-body p-4" >
     <div className="bg-white border rounded p-4 mb-4">

  <div className="d-flex justify-content-between text-center">

    <div>
      <div
        className="rounded-circle bg-success text-white mx-auto"
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
        2
      </div>
      <small>Quantities</small>
    </div>

    <div>
      <div
        className="rounded-circle border mx-auto"
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
<h3 className="fw-bold mb-4">
  Step 2: Quantities & Delivery
</h3>

<p className="mb-3">
  Size Breakdown (Minimum 50 total units)
</p>

<div className="row text-center mb-4">

  {["S", "M", "L", "XL", "XXL"].map((size) => (
    <div className="col" key={size}>
      <div
        className="border rounded p-3"
        style={{ minHeight: "90px" }}
      >
        <h4>{size}</h4>

        <input
          type="number"
          className="form-control"
          min="0"
        />
      </div>
    </div>
  ))}

</div>

<div className="d-flex justify-content-end mb-4">

  <div
    className="border rounded px-4 py-2"
    style={{ fontSize: "24px" }}
  >
    Total Quantity:
    <strong> 100</strong>
  </div>

</div>

<div className="mb-4">

  <label className="mb-2">
    Requested Delivery Date
  </label>

  <input
    type="date"
    className="form-control"
    style={{ maxWidth: "300px" }}
  />

  <small className="text-muted">
    Standard production time is 3-4 weeks.
  </small>

</div>

<div className="mb-4">

  <label className="mb-2">
    Special Instructions / Notes
  </label>

  <textarea
    rows="4"
    className="form-control"
    placeholder="Any specific details about stitching, packaging, or delivery..."
  ></textarea>

</div>

<hr />

<div className="d-flex justify-content-between">

  <button
    className="btn btn-outline-secondary px-4"
    onClick={() => navigate("/place-order")}
  >
    ← Back
  </button>

  <button
    className="btn btn-primary px-5"
    onClick={() => navigate("/review-submit")}
  >
    Next Step →
  </button>

</div>
    

        </div>
      </div>

    </div>
  );
}

export default Quantities;