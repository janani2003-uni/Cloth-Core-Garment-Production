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
  Enter quantities and delivery information.
</p>

{/* Size Breakdown Table */}
<div className="mb-4">
  <label className="fw-bold mb-2">
    Size Breakdown (Minimum 100 total units)
  </label>
  
  <div className="table-responsive">
    <table className="table table-bordered text-center">
      <thead>
        <tr>
          <th style={{ width: "100px" }}></th>
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <th key={size}>{size}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="fw-bold">Quantity</td>
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <td key={size}>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  style={{ width: "190px" }}
                  min="0"
                  defaultValue={size === "S" ? 40 : size === "M" ? 40 : size === "L" ? 50 : size === "XL" ? 20 : 0}
                />
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
</div>

{/* Total Quantity */}
<div className="d-flex justify-content-between align-items-center mb-4">
  <div>
    <span className="fw-bold">Total Quantity:</span>
    <span className="ms-2">150 units</span>
  </div>
  <div>
    <span className="text-muted">Minimum Required: 100 units</span>
  </div>
</div>

{/* Requirement Met Checkbox */}
<div className="mb-4">
  <div className="form-check">
    <input
      className="form-check-input"
      type="checkbox"
      id="requirementMet"
    />
    <label className="form-check-label" htmlFor="requirementMet">
      Requirement Met
    </label>
  </div>
</div>

<hr />

{/* Delivery Date Section */}
<div className="row mb-4">
  <div className="col-md-6">
    <label className="fw-bold mb-2">
      Requested Delivery Date
    </label>
    <input
      type="date"
      className="form-control"
      style={{ maxWidth: "300px" }}
      defaultValue="2026-03-26"
    />
  </div>
  <div className="col-md-6">
    <label className="fw-bold mb-2">
      Production Time
    </label>
    <p className="mb-0">4 weeks</p>
    <small className="text-muted">Estimated Finish Date: 02/04/2026</small>
  </div>
</div>

{/* Special Instructions */}
<div className="mb-4">
  <label className="fw-bold mb-2">
    Special Instructions / Notes (Optional)
  </label>
  <textarea
    rows="3"
    className="form-control"
    placeholder="e.g. Logo, left pocket, individual packaging, add labels..."
  ></textarea>
  <small className="text-muted">
    Any specific details about stitching, packaging, or delivery...
  </small>
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