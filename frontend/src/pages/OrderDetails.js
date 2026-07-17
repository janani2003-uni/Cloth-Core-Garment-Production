import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  ArrowLeft,
  Box,
  Person,
  CreditCard,
} from "react-bootstrap-icons";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/${id}`
        );

        console.log(res.data);

        setOrder(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontSize: "22px",
          fontWeight: "600",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fc" }}>
    <Sidebar />

    <div style={{ flex: 1, padding: "30px" }}>

      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "20px 30px",
          borderRadius: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#0b3aa0",
            fontWeight: "700",
          }}
        >
          Order Details
        </h2>

        <p
          style={{
            color: "#6c757d",
            marginTop: "8px",
            marginBottom: 0,
          }}
        >
          View complete information about this order
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <div className="row">

          {/* Shop Information */}
          <div className="col-md-6 mb-4">
            <div
              style={{
                background: "#f8f9fc",
                padding: "20px",
                borderRadius: "15px",
              }}
            >
              <h5 style={{ color: "#0b3aa0", marginBottom: "20px" }}>
                <Person className="me-2" />
                Shop Information
              </h5>

              <p><strong>Shop Name:</strong> {order.shopName}</p>
              <p><strong>Garment:</strong> {order.garment}</p>
              <p><strong>Fabric:</strong> {order.fabric}</p>
              <p><strong>Color:</strong> {order.color}</p>
            </div>
          </div>

          {/* Order Information */}
          <div className="col-md-6 mb-4">
            <div
              style={{
                background: "#f8f9fc",
                padding: "20px",
                borderRadius: "15px",
              }}
            >
              <h5 style={{ color: "#0b3aa0", marginBottom: "20px" }}>
                <Box className="me-2" />
                Order Information
              </h5>

              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Amount:</strong> Rs. {order.amount}</p>
              <p>
                <strong>Created Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  {order.status}
                </span>
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="col-md-12">
            <div
              style={{
                background: "#f8f9fc",
                padding: "20px",
                borderRadius: "15px",
              }}
            >
              <h5 style={{ color: "#0b3aa0", marginBottom: "20px" }}>
                <CreditCard className="me-2" />
                Payment Information
              </h5>

              <div className="row">
                <div className="col-md-6">
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                </div>

                <div className="col-md-6">
                  <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="btn btn-primary mt-4"
        >
          <ArrowLeft className="me-2" />
          Back to Orders
        </button>

      </div>

    </div>
  </div>
);
}

export default OrderDetails;