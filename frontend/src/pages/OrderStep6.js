
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  CreditCard,
  Calendar,
  Shield,
  Download,
} from "react-bootstrap-icons";
import ShopTopbar from "../components/ShopTopbar";
import { ORDER_COLORS as C } from "../utils/orderTheme";

const ORDERS_API_URL = "http://localhost:5000/api/orders";

function OrderStep6() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Loads via orderId (either passed in navigation state right after
  // submitting, or from the URL — see the ?orderId= query param set below),
  // and always re-fetches the real, currently-saved order from the backend
  // rather than trusting only the state handed off at submission time — so
  // this page still works correctly after a page refresh, not just on the
  // first render.
  const orderIdFromState = location.state?.order?._id;
  const orderIdFromQuery = searchParams.get("orderId");
  const orderId = orderIdFromState || orderIdFromQuery;

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${ORDERS_API_URL}/${orderId}`);
      setOrder(res.data);
      // Keep the URL carrying ?orderId= so a refresh (or a bookmark/share)
      // keeps working — replaces the raw navigation-state-only URL from
      // right after submission.
      if (!orderIdFromQuery) {
        navigate(`/step6?orderId=${res.data._id}`, { replace: true, state: { order: res.data } });
      }
    } catch {
      // Fall back to whatever was in navigation state, if anything.
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadReceipt = async () => {
    if (!order) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const res = await axios.get(`${ORDERS_API_URL}/${order._id}/receipt.pdf`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `ClothCore-Receipt-${order.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setDownloadError("Could not download the receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-0" style={{ background: C.cream100, minHeight: "100vh" }}>
        <ShopTopbar />
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-fluid p-0" style={{
        background: C.cream100,
        minHeight: "100vh"
      }}>
        <ShopTopbar />
        <div className="container py-5">
          <div className="d-flex justify-content-center">
          <div
            className="card border-0 text-center p-5"
            style={{ borderRadius: "25px", boxShadow: "0 20px 60px rgba(25,0,25,0.1)", maxWidth: 520, background: "#fff" }}
          >
            <h4 className="fw-bold mb-3" style={{ color: C.plum900 }}>
              No recent order found
            </h4>
            <p className="mb-4" style={{ color: C.mauve500 }}>
              We couldn't find a just-placed order to show. If you just submitted
              one, check "My Orders".
            </p>
            <button
              className="btn px-4 py-2 fw-bold mx-auto cc-pill-cta"
              style={{
                background: "linear-gradient(135deg, #522b5b, #854f6c)",
                color: "white",
                borderRadius: "15px",
                border: "none",
              }}
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "—";

  return (
    <div className="container-fluid p-0" style={{
      background: C.cream100,
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden"
    }}>
      <ShopTopbar />

      <div className="container py-4 position-relative">
        {/* Header with animated gradient */}
        <div className="mb-4 text-center">
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #2b124c, #522b5b)",
            padding: "8px 30px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(82,43,91,0.3)"
          }}>
            <h1 className="fw-bold mb-0" style={{ color: "white", fontSize: "1.5rem" }}>
              ✅ Order Confirmed
            </h1>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0" style={{
              borderRadius: "25px",
              boxShadow: "0 20px 60px rgba(25,0,25,0.1)",
              overflow: "hidden",
              background: "#fff"
            }}>

              {/* Card Header with Gradient */}
              <div style={{
                background: "linear-gradient(135deg, #522b5b, #854f6c)",
                padding: "20px 30px",
                color: "white"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">Order Summary</h5>
                    <small className="opacity-75">Your order has been confirmed</small>
                  </div>
                  <div className="text-end">
                    <Shield size={30} className="opacity-75" />
                  </div>
                </div>
              </div>

              <div className="card-body p-4">

                {/* Order Info Grid */}
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Order ID</label>
                      <p className="fw-bold mb-0" style={{ color: "#522b5b", fontSize: "18px", letterSpacing: "1px" }}>
                        {order.orderId}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">
                        <Calendar size={14} className="me-1" /> Order Date
                      </label>
                      <p className="fw-bold mb-0">{orderDate}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Item</label>
                      <p className="fw-bold mb-0">{order.item}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Quantity</label>
                      <p className="fw-bold mb-0">{order.quantity} pcs</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Order Status</label>
                      <div>
                        <span className="badge" style={{
                          background: "rgba(217,131,36,0.15)",
                          color: "#a3600e",
                          padding: "6px 20px",
                          fontSize: "14px",
                          borderRadius: "20px"
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="text-muted small text-uppercase fw-bold">Payment Status</label>
                      <div>
                        <span className="badge" style={{
                          background: order.paymentStatus === "Full Paid" ? "rgba(31,122,68,0.14)" : "rgba(82,43,91,0.12)",
                          color: order.paymentStatus === "Full Paid" ? "#1f7a44" : "#522b5b",
                          padding: "6px 20px",
                          fontSize: "14px",
                          borderRadius: "20px"
                        }}>
                          {order.paymentStatus === "Pending" ? "Pending Verification" : order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "rgba(26,156,95,0.12)",
                      borderRadius: "15px",
                      height: "100%",
                      border: "1px solid rgba(26,156,95,0.2)"
                    }}>
                      <label className="small text-muted fw-bold">Total Order Amount</label>
                      <p className="fw-bold mb-0" style={{ color: "#1a9c5f", fontSize: "20px" }}>
                        Rs. {Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{
                      background: "#f8f9fa",
                      borderRadius: "15px",
                      height: "100%"
                    }}>
                      <label className="small text-muted fw-bold">Pending Balance</label>
                      <p className="fw-bold mb-0" style={{ color: "#522b5b", fontSize: "18px" }}>
                        Rs. {Number(order.remainingBalance ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#854f6c", borderWidth: "2px", margin: "24px 0" }} />

                {/* Action Buttons */}
                <div className="row g-3">
                  <div className="col-md-4">
                    <button
                      className="btn w-100 py-3 fw-bold cc-pill-cta"
                      style={{
                        background: "linear-gradient(135deg, #522b5b, #854f6c)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(82,43,91,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                      onClick={() => navigate("/orders")}
                    >
                      <FileText size={20} /> View My Orders
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button
                      className="btn w-100 py-3 fw-bold cc-pill-cta"
                      style={{
                        background: "linear-gradient(135deg, #1a9c5f, #22b872)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(26,156,95,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                      onClick={() => navigate("/dashboard")}
                    >
                      <CreditCard size={20} /> Back to Dashboard
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button
                      className="btn w-100 py-3 fw-bold cc-pill-cta"
                      disabled={downloading}
                      style={{
                        background: "linear-gradient(135deg, #d98324, #e9a13d)",
                        color: "white",
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(217,131,36,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                      onClick={handleDownloadReceipt}
                    >
                      <Download size={20} /> {downloading ? "Preparing..." : "Download PDF Receipt"}
                    </button>
                  </div>
                </div>
                {downloadError && (
                  <div className="mt-2 text-center" style={{ color: "#b3261e", fontSize: 13, fontWeight: 600 }}>
                    {downloadError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .card {
            animation: fadeIn 0.6s ease;
          }

          .btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}
      </style>
    </div>
  );
}

export default OrderStep6;
