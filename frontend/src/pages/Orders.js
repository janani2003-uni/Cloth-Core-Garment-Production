import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Orders() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">

  

{/* Top Header Box */}
<div
  className="bg-white border rounded px-4 py-3 mb-4"
>
<div className="d-flex align-items-center">
    {/* Logo */}
    <div>
      <img
        src={logo}
        alt="logo"
        style={{
          width: "140px",
          height: "auto"
        }}
      />
    </div>

    {/* Right Side */}
<div className="d-flex align-items-center ms-auto">
      <div className="me-3 position-relative">
        <span style={{ fontSize: "24px" }}>🔔</span>

        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: "10px" }}
        >
          1
        </span>
      </div>

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
      className="rounded-circle bg-light border"
      style={{
        width: "55px",
        height: "55px",
      }}
    ></div>

  </div>

</div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Order Management</h1>
          <p className="text-muted">
            View and manage all garment orders.
          </p>
        </div>

        <button
  className="btn btn-primary"
  onClick={() => navigate("/place-order")}
>
  + Place Order
</button>
      </div>

      {/* Table Card */}
      <div
        className="card shadow-sm"
        style={{ borderRadius: "15px" }}
      >
        <div className="card-body">

          {/* Search */}
          <div className="d-flex justify-content-between mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              style={{ maxWidth: "400px" }}
            />

            <button className="btn btn-outline-secondary">
              Filter
            </button>
          </div>

          {/* Table */}
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Shop Name</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>ORD-2026-001</td>
                <td>Saman Fashions</td>
                <td>School Uniforms</td>
                <td>500</td>
                <td>2026-03-20</td>
                <td>
                  <span className="badge bg-danger">
                    Critical
                  </span>
                </td>
                <td>LKR 750,000</td>
              </tr>

              <tr>
                <td>ORD-2026-004</td>
                <td>Saman Fashions</td>
                <td>Sports T-Shirts</td>
                <td>300</td>
                <td>2026-03-10</td>
                <td>
                  <span className="badge bg-success">
                    In Stock
                  </span>
                </td>
                <td>LKR 450,000</td>
              </tr>
            </tbody>
          </table>

          <div className="d-flex justify-content-between mt-4">
            <p>Showing 2 of 2 entries</p>

            <button
  className="btn btn-outline-secondary"
  onClick={() => navigate("/place-order")}
>
  Next
</button>
          </div>

        </div>
      </div>

      <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate("/dashboard")}
      >
        Back
      </button>

    </div>
  );
}

export default Orders;