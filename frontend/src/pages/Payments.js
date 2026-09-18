import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import axios from "axios";
import {
  Person,
  Wallet2,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  CashStack,
  Receipt,
  Download,
} from "react-bootstrap-icons";
import { getUser } from "../utils/auth";
import { getEffectivePayment, getOrderActionTarget, goToOrder } from "../utils/orderStatus";

const ORDERS_API_URL = "http://localhost:5000/api/orders";
const PAYMENTS_API_URL = "http://localhost:5000/api/payments/order";

// A shop owner sees their own payment as "Paid" the moment they submit it —
// Submitted vs Verified is Admin's internal review-queue distinction, not
// something a shop owner needs to track. Only a genuinely Rejected payment
// stays visibly distinct, since that needs their attention.
function displayStatus(status) {
  if (status === "Rejected") return "Rejected";
  return "Paid";
}

function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasOrders, setHasOrders] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [downloadingReceiptFor, setDownloadingReceiptFor] = useState("");

  const user = getUser();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user || (!user._id && !user.id)) {
        setPayments([]);
        setHasOrders(false);
        setLoading(false);
        return;
      }

      const userId = user._id || user.id;

      const ordersResponse = await axios.get(ORDERS_API_URL);
      const allOrders = Array.isArray(ordersResponse.data)
        ? ordersResponse.data
        : [];
      const ownOrders = allOrders.filter((order) => order.userId === userId);
      setHasOrders(ownOrders.length > 0);
      setMyOrders(ownOrders);

      const paymentsPerOrder = await Promise.all(
        ownOrders.map(async (order) => {
          try {
            const res = await axios.get(`${PAYMENTS_API_URL}/${order._id}`);
            const orderPayments = Array.isArray(res.data) ? res.data : [];
            return orderPayments.map((payment) => ({
              ...payment,
              orderDisplayId: order.orderId || order._id,
              orderItem: order.item || "N/A",
            }));
          } catch (err) {
            // No payments recorded for this order yet - not a hard error.
            return [];
          }
        })
      );

      const flattened = paymentsPerOrder
        .flat()
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

      setPayments(flattened);
    } catch (err) {
      console.error("Load Payments Error:", err);
      setError(err.response?.data?.message || "Could not load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effective status (submitted-but-unverified counted as paid) — an order
  // is only genuinely "outstanding" once there's real remaining balance
  // left after everything already submitted for it.
  const outstandingOrders = myOrders.filter((order) => getEffectivePayment(order).status !== "Full Paid");

  const downloadReceipt = async (orderDisplayId) => {
    try {
      setDownloadingReceiptFor(orderDisplayId);
      const res = await axios.get(`${ORDERS_API_URL}/${orderDisplayId}/receipt.pdf`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ClothCore-Receipt-${orderDisplayId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download Receipt Error:", err);
      alert("Could not download the receipt. Please try again.");
    } finally {
      setDownloadingReceiptFor("");
    }
  };

  // Counts Submitted + Verified together — a shop owner's own "Total Paid"
  // reflects everything they've submitted, not just what Admin has
  // gotten around to verifying yet.
  const totalPaid = payments
    .filter((p) => p.status !== "Rejected")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalOutstanding = myOrders.reduce(
    (sum, order) => sum + getEffectivePayment(order).effectiveRemaining,
    0
  );

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
              <h5 style={{ color: "var(--clothcore-purple)" }}>Loading Payments...</h5>
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
              <button className="btn btn-primary mt-3" onClick={fetchPayments}>
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
                My Payments
              </h1>
              <p className="admin-page-subtitle" style={{ fontSize: "15px" }}>
                Payment history for all your orders
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card admin-stat-card h-100"
                style={{ borderRadius: "16px", boxShadow: "var(--clothcore-shadow)" }}
              >
                <div className="card-body p-4 d-flex justify-content-between align-items-start">
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                      Total Paid
                    </div>
                    <div className="fw-bold" style={{ fontSize: "26px", color: "var(--clothcore-text)", marginTop: "4px" }}>
                      LKR {totalPaid.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "var(--clothcore-success-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle size={24} style={{ color: "var(--clothcore-success)" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card admin-stat-card h-100"
                style={{ borderRadius: "16px", boxShadow: "var(--clothcore-shadow)" }}
              >
                <div className="card-body p-4 d-flex justify-content-between align-items-start">
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                      Outstanding Balance
                    </div>
                    <div className="fw-bold" style={{ fontSize: "26px", color: "var(--clothcore-text)", marginTop: "4px" }}>
                      LKR {totalOutstanding.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "var(--clothcore-warning-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Clock size={24} style={{ color: "var(--clothcore-warning)" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card admin-stat-card h-100"
                style={{ borderRadius: "16px", boxShadow: "var(--clothcore-shadow)" }}
              >
                <div className="card-body p-4 d-flex justify-content-between align-items-start">
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                      Total Payments Recorded
                    </div>
                    <div className="fw-bold" style={{ fontSize: "26px", color: "var(--clothcore-text)", marginTop: "4px" }}>
                      {payments.length}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "rgba(82,43,91,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Wallet2 size={24} style={{ color: "var(--clothcore-purple)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outstanding Balances — one glanceable progress bar per order
              instead of three separate raw-number columns, so "how much of
              this do I still owe" reads instantly. */}
          {outstandingOrders.length > 0 && (
            <div
              className="card admin-content-card mb-4"
              style={{ borderRadius: "20px", boxShadow: "var(--clothcore-shadow)", overflow: "hidden" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-1" style={{ color: "var(--clothcore-purple)" }}>Outstanding Balances</h5>
                <p className="mb-3" style={{ fontSize: "12.5px", color: "var(--clothcore-text-soft)" }}>
                  Orders that still have a balance to pay.
                </p>
                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px" }}>
                    <thead>
                      <tr>
                        <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Order</th>
                        <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Payment Progress</th>
                        <th className="fw-bold text-end" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Remaining</th>
                        <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {outstandingOrders.map((order) => {
                        const { effectivePaid, effectiveRemaining, status } = getEffectivePayment(order);
                        const total = Number(order.totalAmount || 0);
                        const pct = total > 0 ? Math.min(100, Math.round((effectivePaid / total) * 100)) : 0;
                        return (
                          <tr key={order._id}>
                            <td>
                              <div className="fw-bold" style={{ color: "var(--clothcore-purple)" }}>{order.orderId}</div>
                              <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>{order.item}</div>
                            </td>
                            <td style={{ minWidth: "210px" }}>
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: "12px" }}>
                                <span style={{ color: "var(--clothcore-success)", fontWeight: 700 }}>LKR {effectivePaid.toLocaleString()}</span>
                                <span style={{ color: "var(--clothcore-text-soft)" }}>of LKR {total.toLocaleString()}</span>
                              </div>
                              <div style={{ height: "7px", borderRadius: "4px", background: "rgba(82,43,91,0.08)", overflow: "hidden" }}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background: "linear-gradient(90deg, var(--clothcore-purple), var(--clothcore-mauve))",
                                    borderRadius: "4px",
                                    transition: "width 0.4s ease",
                                  }}
                                />
                              </div>
                            </td>
                            <td className="fw-bold text-end" style={{ color: "var(--clothcore-danger)" }}>
                              LKR {effectiveRemaining.toLocaleString()}
                            </td>
                            <td>
                              <span className={`admin-badge ${status === "Advance Paid" ? "admin-badge-accent" : "admin-badge-warning"}`}>
                                {status}
                              </span>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm fw-bold px-3"
                                style={{ background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", borderRadius: "8px", border: "none", whiteSpace: "nowrap" }}
                                onClick={() => goToOrder(navigate, order)}
                              >
                                {getOrderActionTarget(order).label}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payment History — same visual language as Outstanding Balances
              above (merged Order/Item cell, consistent admin-badge pills,
              right-aligned amounts) instead of a differently-styled table,
              so the two read as one coherent page. */}
          <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-purple)" }}>Payment History</h5>
          <div
            className="card admin-content-card"
            style={{ borderRadius: "20px", boxShadow: "var(--clothcore-shadow-hover)", overflow: "hidden" }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px" }}>
                  <thead>
                    <tr>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Order</th>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Stage</th>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Method</th>
                      <th className="fw-bold text-end" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Amount</th>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Status</th>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!user ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div style={{ color: "var(--clothcore-text-soft)" }}>
                            <Person size={48} style={{ color: "var(--clothcore-text-soft)" }} />
                            <h5 className="mt-2">Please log in</h5>
                            <p style={{ fontSize: "14px" }}>
                              Log in to see your payment history.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : !hasOrders ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div style={{ color: "var(--clothcore-text-soft)" }}>
                            <Receipt size={48} style={{ color: "var(--clothcore-text-soft)" }} />
                            <h5 className="mt-2">No orders yet</h5>
                            <p style={{ fontSize: "14px" }}>
                              Place an order to start tracking payments.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div style={{ color: "var(--clothcore-text-soft)" }}>
                            <CashStack size={48} style={{ color: "var(--clothcore-text-soft)" }} />
                            <h5 className="mt-2">No payments recorded yet</h5>
                            <p style={{ fontSize: "14px" }}>
                              Payments you make for your orders will show up here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment._id}>
                          <td>
                            <div className="fw-bold" style={{ color: "var(--clothcore-purple)" }}>{payment.orderDisplayId}</div>
                            <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>{payment.orderItem}</div>
                          </td>
                          <td style={{ color: "var(--clothcore-text-soft)" }}>{payment.stage || "N/A"}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2" style={{ color: "var(--clothcore-text-soft)" }}>
                              <CreditCard size={14} />
                              {payment.paymentMethod || "N/A"}
                            </div>
                          </td>
                          <td className="fw-bold text-end" style={{ color: "var(--clothcore-text)" }}>
                            LKR {Number(payment.amount || 0).toLocaleString()}
                          </td>
                          <td>
                            <span className={`admin-badge ${payment.status === "Rejected" ? "admin-badge-danger" : "admin-badge-success"}`}>
                              {displayStatus(payment.status)}
                            </span>
                          </td>
                          <td style={{ color: "var(--clothcore-text-soft)", whiteSpace: "nowrap" }}>
                            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                          </td>
                          <td>
                            {payment.status === "Verified" && (
                              <button
                                className="btn btn-sm fw-bold d-flex align-items-center gap-1"
                                style={{ background: "rgba(82,43,91,0.08)", color: "var(--clothcore-purple)", borderRadius: "8px", border: "none", fontSize: "12px", whiteSpace: "nowrap" }}
                                disabled={downloadingReceiptFor === payment.orderDisplayId}
                                onClick={() => downloadReceipt(payment.orderDisplayId)}
                                title="Download payment receipt"
                              >
                                <Download size={13} />
                                {downloadingReceiptFor === payment.orderDisplayId ? "..." : "Receipt"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
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

export default Payments;

