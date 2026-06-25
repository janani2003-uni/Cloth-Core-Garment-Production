import React from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function PlaceBulkOrder() {
     const navigate = useNavigate();
  return (
    <div className="container mt-4">
        

<div
  className="bg-white border rounded p-3 mb-4"
>
  <div className="d-flex justify-content-between align-items-center">

    {/* Logo */}
    <img
      src={logo}
      alt="logo"
      style={{
        width: "120px",
        height: "auto"
      }}
    />

    {/* Right Side */}
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
        <div
  className="bg-white border rounded p-4 mb-4"
>
  <div className="d-flex justify-content-between text-center">

    <div>
      <div
        className="rounded-circle bg-primary text-white mx-auto"
        style={{
          width: "40px",
          height: "40px",
          lineHeight: "40px",
        }}
      >
        1
      </div>

      <small>Garment Details</small>
    </div>

    <div>
      <div
        className="rounded-circle border mx-auto"
        style={{
          width: "40px",
          height: "40px",
          lineHeight: "40px",
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
          lineHeight: "40px",
        }}
      >
        3
      </div>

      <small>Review & Submit</small>
    </div>

  </div>
</div>
        Place Bulk Order
      </h1>

      <p className="text-muted">
        Submit a new garment production order for your shop.
        <div className="card mt-4">
  <div className="card-body p-4">

    <h3 className="fw-bold mb-4">
      Step 1: Garment Details
    </h3>

    <label className="mb-3">
      Select Garment Type
    </label>

    <div className="row mb-4">

      <div className="col-md-3">
        <button className="btn btn-outline-secondary w-100 py-3">
          👕 <br />
          T-Shirt
        </button>
      </div>

      <div className="col-md-3">
        <button className="btn btn-outline-secondary w-100 py-3">
          👕 <br />
          Polo Shirt
        </button>
      </div>

      <div className="col-md-3">
        <button className="btn btn-outline-secondary w-100 py-3">
          ✂️ <br />
          School Uniform
        </button>
      </div>

      <div className="col-md-3">
        <button className="btn btn-outline-secondary w-100 py-3">
          ✂️ <br />
          Trousers
        </button>
      </div>

    </div>

    <div className="row">

      <div className="col-md-6">
        <label className="mb-2">
          Fabric Material
        </label>

        <select className="form-select">
          <option>100% Cotton</option>
          <option>Polyester</option>
          <option>Cotton Blend</option>
        </select>
      </div>

      <div className="col-md-6">

  <label className="mb-2">
    Primary Color
  </label>

  <input
    type="text"
    className="form-control mb-4"
    placeholder="e.g. Navy Blue"
  />



</div>

    </div>
{/* Upload Area */}
<div className="mt-4">

  <label className="mb-2">
    Upload Design/Logo (Optional)
  </label>

  <div
    className="border rounded text-center d-flex flex-column justify-content-center align-items-center"
    style={{
      height: "220px",
      width: "100%",
      cursor: "pointer"
    }}
  >
    <h1>⬆</h1>

    <p className="mb-1">
      Upload a file or drag and drop
    </p>

    <small className="text-muted">
      PNG, JPG, PDF up to 10MB
    </small>
  </div>

</div>

<hr className="my-4" />

<div className="d-flex justify-content-between">

  <button
    className="btn btn-outline-secondary px-4"
    onClick={() => navigate("/orders")}
  >
    ← Back
  </button>

  <button
    className="btn btn-primary px-5"
    onClick={() => navigate("/quantities")}
  >
    Next Step →
  </button>

</div>
  </div>
</div>
      </p>

    </div>
  );
}

export default PlaceBulkOrder;