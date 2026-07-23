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
  UpcScan,
  Box,
  QuestionCircle
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
              status: res.data?.status || "Not Scheduled",
              trackingNumber: res.data?.trackingNumber || "",
              scheduledDate: res.data?.scheduledDate || "",
              deliveryStaffName: res.data?.deliveryStaffName || "",
              notes: res.data?.notes || "",
            };
          } catch (err) {
            // 404 (or any other lookup failure) simply means no delivery
            // record has been created for this order yet.
            return {
              orderDisplayId: order.orderId || order._id,
              orderItem: order.item || "N/A",
              hasRecord: false,
              status: "Not yet processed",
              trackingNumber: "",
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

  const getStatusBadgeStyle = (status) => {
    const styles = {
      Delivered: {
        bg: "linear-gradient(135deg, var(--clothcore-success), #158a52)",
        icon: CheckCircle,
      },
      Dispatched: {
        bg: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
        icon: Truck,
      },
      "In Transit": {
        bg: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
        icon: Truck,
      },
      "Delivery Failed": {
        bg: "linear-gradient(135deg, var(--clothcore-danger), #b83d4d)",
        icon: XCircle,
      },
      Scheduled: {
        bg: "linear-gradient(135deg, var(--clothcore-text-soft), #554a5c)",
        icon: Clock,
      },
      "Not Scheduled": {
        bg: "linear-gradient(135deg, var(--clothcore-text-soft), #554a5c)",
        icon: Clock,
      },
      "Not yet processed": {
        bg: "linear-gradient(135deg, #a99ba8, var(--clothcore-text-soft))",
        icon: QuestionCircle,
      },
    };
    return styles[status] || styles["Not yet processed"];
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
              <h5 style={{ color: "var(--clothcore-blush)" }}>Loading Deliveries...</h5>
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
    <ShopOwnerLayout>
          {/* Header */}
          <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center mb-4 gap-3">
            <div>
              <h1 className="fw-bold" style={{ fontSize: "28px", color: "var(--clothcore-text)" }}>
                My Deliveries
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: "15px" }}>
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
                      background: "rgba(255,255,255,0.04)",
                      borderBottom: "2px solid var(--clothcore-border)",
                    }}
                  >
                    <tr>
                      {["Order ID", "Item", "Delivery Status", "Tracking Number", "Scheduled Date"].map(
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
                        <td colSpan="5" className="text-center py-5">
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
                        <td colSpan="5" className="text-center py-5">
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
                              <span className="fw-bold" style={{ color: "var(--clothcore-blush)", fontSize: "13px" }}>
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
                                <UpcScan size={14} className="text-muted me-2" />
                                {row.trackingNumber || "Not assigned yet"}
                              </div>
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
