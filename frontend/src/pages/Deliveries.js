import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import axios from "axios";
import {
  Person,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Box,
} from "react-bootstrap-icons";
import { getUser } from "../utils/auth";

const ORDERS_API_URL = "http://localhost:5000/api/orders";
const DELIVERIES_API_URL = "http://localhost:5000/api/deliveries/order";

function Deliveries() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user || (!user._id && !user.id)) {
        setRows([]);
        setLoading(false);
        return;
      }

      const userId = user._id || user.id;

      const ordersResponse = await axios.get(ORDERS_API_URL);
      const allOrders = Array.isArray(ordersResponse.data)
        ? ordersResponse.data
        : [];
      const myOrders = allOrders.filter((order) => order.userId === userId);

      const combined = await Promise.all(
        myOrders.map(async (order) => {
          try {
            const res = await axios.get(`${DELIVERIES_API_URL}/${order._id}`);
            return {
              orderDisplayId: order.orderId || order._id,
              orderItem: order.item || "N/A",
              hasRecord: true,
              status: res.data?.status || "Not Yet Delivered",
              scheduledDate: res.data?.scheduledDate || "",
              deliveryStaffName: res.data?.deliveryStaffName || "",
              notes: res.data?.notes || "",
            };
          } catch (err) {
            // 404 (or any other lookup failure) simply means no delivery
            // record has been created for this order yet — shown the same
            // as "Not Yet Delivered" since that's exactly what it is.
            return {
              orderDisplayId: order.orderId || order._id,
              orderItem: order.item || "N/A",
              hasRecord: false,
              status: "Not Yet Delivered",
              scheduledDate: "",
              deliveryStaffName: "",
              notes: "",
            };
          }
        })
      );

      setRows(combined);
    } catch (err) {
      console.error("Load Deliveries Error:", err);
      setError(err.response?.data?.message || "Could not load deliveries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exactly three shop-owner-facing statuses — Shop Owner can only ever
  // view this, never change it (every write route in
  // backend/routes/deliveryRoutes.js is Admin/Supervisor-only).
  const getStatusBadgeStyle = (status) => {
    const styles = {
      Delivered: {
        bg: "linear-gradient(135deg, var(--clothcore-success), #158a52)",
        icon: CheckCircle,
      },
      "Delivery In Progress": {
        bg: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
        icon: Truck,
      },
      "Not Yet Delivered": {
        bg: "linear-gradient(135deg, var(--clothcore-text-soft), #554a5c)",
        icon: Clock,
      },
    };
    return styles[status] || styles["Not Yet Delivered"];
  };

  if (loading) {
    return (
      <ShopOwnerLayout contentClassName="d-flex align-items-center justify-content-center" contentStyle={{ minHeight: "60vh" }}>
            <div className="text-center">
              <div
                className="spinner-border text-primary mb-3"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 style={{ color: "var(--clothcore-purple)" }}>Loading Deliveries...</h5>
            </div>
      </ShopOwnerLayout>
    );
  }

  if (error) {
    return (
      <ShopOwnerLayout contentClassName="d-flex align-items-center justify-content-center" contentStyle={{ minHeight: "60vh" }}>
            <div className="text-center">
              <XCircle size={48} style={{ color: "var(--clothcore-danger)" }} />
              <h5 className="mt-3" style={{ color: "var(--clothcore-danger)" }}>{error}</h5>
              <button className="btn btn-primary mt-3" onClick={fetchDeliveries}>
                Retry
              </button>
            </div>
      </ShopOwnerLayout>
    );
  }

  return (
    <ShopOwnerLayout
      contentClassName="p-3 p-md-4"
      contentStyle={{ maxWidth: "1280px", margin: "0 auto" }}
    >
          {/* Header */}
          <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title" style={{ fontSize: "28px" }}>
                My Deliveries
              </h1>
              <p className="admin-page-subtitle" style={{ fontSize: "15px" }}>
                Delivery status for all your orders
              </p>
            </div>
          </div>

          {/* Table Card */}
          <div
            className="card admin-content-card"
            style={{ borderRadius: "20px", boxShadow: "var(--clothcore-shadow-hover)", overflow: "hidden" }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px" }}>
                  <thead
                    style={{
                      background: "rgba(82,43,91,0.045)",
                      borderBottom: "2px solid var(--clothcore-border)",
                    }}
                  >
                    <tr>
                      {["Order ID", "Item", "Delivery Status", "Scheduled Date"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 fw-bold"
                            style={{
                              color: "var(--clothcore-text-soft)",
                              fontSize: "12px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {!user ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <div style={{ color: "var(--clothcore-text-soft)" }}>
                            <Person size={48} style={{ color: "var(--clothcore-text-soft)" }} />
                            <h5 className="mt-2">Please log in</h5>
                            <p style={{ fontSize: "14px" }}>
                              Log in to see your delivery status.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <div style={{ color: "var(--clothcore-text-soft)" }}>
                            <Box size={48} style={{ color: "var(--clothcore-text-soft)" }} />
                            <h5 className="mt-2">No orders yet</h5>
                            <p style={{ fontSize: "14px" }}>
                              Place an order to start tracking deliveries.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        const statusStyle = getStatusBadgeStyle(row.status);
                        const StatusIcon = statusStyle.icon;
                        return (
                          <tr key={row.orderDisplayId} style={{ borderBottom: "1px solid var(--clothcore-border)" }}>
                            <td className="px-4 py-3">
                              <span className="fw-bold" style={{ color: "var(--clothcore-purple)", fontSize: "13px" }}>
                                #{row.orderDisplayId}
                              </span>
                            </td>
                            <td className="px-4 py-3">{row.orderItem}</td>
                            <td className="px-4 py-3">
                              <span
                                className="badge px-3 py-2"
                                style={{
                                  background: statusStyle.bg,
                                  color: "white",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <StatusIcon size={12} />
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <Calendar size={14} className="text-muted me-2" />
                                {row.scheduledDate
                                  ? new Date(row.scheduledDate).toLocaleDateString()
                                  : "Not scheduled yet"}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              className="btn px-4 py-2"
              style={{
                background: "rgba(107,91,115,0.12)",
                color: "var(--clothcore-text-soft)",
                borderRadius: "12px",
                border: "none",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>
    </ShopOwnerLayout>
  );
}

export default Deliveries;
