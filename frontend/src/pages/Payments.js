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
  Receipt,
  Download,
} from "react-bootstrap-icons";
import { getUser } from "../utils/auth";
import { getEffectivePayment, getOrderActionTarget, goToOrder } from "../utils/orderStatus";
import { API_BASE_URL } from "../utils/apiConfig";

const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;
const PAYMENTS_API_URL = `${API_BASE_URL}/api/payments/order`;

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
      contentStyle={{ maxWidth: "100%" }}
      fitScreen
    >
          {/* Header — kept compact so Payment History gets most of the
              screen (page-local override, not a change to the shared
              .admin-page-header class other pages also use). */}
          <div className="admin-page-header" style={{ flexShrink: 0, padding: "14px 22px", marginBottom: "8px" }}>
            <div>
              <h1 className="admin-page-title" style={{ fontSize: "18px", marginBottom: 0 }}>
                My Payments
              </h1>
              <p className="admin-page-subtitle" style={{ fontSize: "12px" }}>
                Payment history for all your orders
              </p>
            </div>
          </div>

          {/* Summary Cards — compact strip */}
          <div className="row g-2 mb-2" style={{ flexShrink: 0 }}>
            <div className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card admin-stat-card h-100"
                style={{ borderRadius: "12px", boxShadow: "var(--clothcore-shadow)" }}
              >
                <div className="card-body px-3 py-2 d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                      Total Paid
                    </div>
                    <div className="fw-bold" style={{ fontSize: "17px", color: "var(--clothcore-text)" }}>
                      LKR {totalPaid.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      background: "var(--clothcore-success-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={16} style={{ color: "var(--clothcore-success)" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card admin-stat-card h-100"
                style={{ borderRadius: "12px", boxShadow: "var(--clothcore-shadow)" }}
              >
                <div className="card-body px-3 py-2 d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                      Outstanding Balance
                    </div>
                    <div className="fw-bold" style={{ fontSize: "17px", color: "var(--clothcore-text)" }}>
                      LKR {totalOutstanding.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      background: "var(--clothcore-warning-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={16} style={{ color: "var(--clothcore-warning)" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card admin-stat-card h-100"
                style={{ borderRadius: "12px", boxShadow: "var(--clothcore-shadow)" }}
              >
                <div className="card-body px-3 py-2 d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--clothcore-text-soft)", fontWeight: "500" }}>
                      Total Payments Recorded
                    </div>
                    <div className="fw-bold" style={{ fontSize: "17px", color: "var(--clothcore-text)" }}>
                      {payments.length}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      background: "rgba(82,43,91,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Wallet2 size={16} style={{ color: "var(--clothcore-purple)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outstanding Balances and Payment History merged into one table
              — one row per order, mixing both: how much of that order is
              still owed (progress bar + Remaining) alongside its latest
              payment transaction (stage/method/date) and a single Status +
              Action column, instead of the same order's data being split
              across two separate boxes. */}
          <div
            className="card admin-content-card d-flex flex-column"
            style={{ flex: 1, minHeight: 0, borderRadius: "20px", boxShadow: "var(--clothcore-shadow-hover)", overflow: "hidden" }}
          >
            <div className="card-header border-0 px-4 py-3" style={{ flexShrink: 0 }}>
              <h5 className="fw-bold mb-0" style={{ color: "var(--clothcore-purple)" }}>Payments</h5>
            </div>
            <div className="card-body p-0" style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="table-responsive" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px", minWidth: "920px" }}>
                  <thead>
                    <tr>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase", minWidth: "170px" }}>Order</th>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Payment Progress</th>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Latest Payment</th>
                      <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Status</th>
                      <th></th>
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
                              Log in to see your payments.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : !hasOrders ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div style={{ color: "var(--clothcore-text-soft)" }}>
                            <Receipt size={48} style={{ color: "var(--clothcore-text-soft)" }} />
                            <h5 className="mt-2">No orders yet</h5>
                            <p style={{ fontSize: "14px" }}>
                              Place an order to start tracking payments.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      [...myOrders]
                        .sort((a, b) => {
                          const remA = getEffectivePayment(a).effectiveRemaining;
                          const remB = getEffectivePayment(b).effectiveRemaining;
                          if ((remA > 0) !== (remB > 0)) return remA > 0 ? -1 : 1;
                          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                        })
                        .map((order) => {
                          const { effectivePaid, effectiveRemaining, status } = getEffectivePayment(order);
                          const total = Number(order.totalAmount || 0);
                          const pct = total > 0 ? Math.min(100, Math.round((effectivePaid / total) * 100)) : 0;
                          const orderKey = order.orderId || order._id;
                          const latestPayment = payments.find((p) => p.orderDisplayId === orderKey);
                          const badgeClass =
                            status === "Full Paid" ? "admin-badge-success" :
                            status === "Advance Paid" ? "admin-badge-accent" : "admin-badge-warning";

                          return (
                            <tr key={order._id}>
                              <td style={{ minWidth: "170px" }}>
                                <div className="fw-bold" style={{ color: "var(--clothcore-purple)" }}>{order.orderId}</div>
                                <div
                                  className="text-truncate"
                                  style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", maxWidth: "200px" }}
                                  title={order.item}
                                >
                                  {order.item}
                                </div>
                              </td>
                              <td style={{ minWidth: "200px" }}>
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
                              <td style={{ minWidth: "180px" }}>
                                {latestPayment ? (
                                  <>
                                    <div className="d-flex align-items-center gap-2" style={{ color: "var(--clothcore-text)", whiteSpace: "nowrap" }}>
                                      <CreditCard size={13} />
                                      {latestPayment.stage || "N/A"} · {latestPayment.paymentMethod || "N/A"}
                                    </div>
                                    <div style={{ fontSize: "11.5px", color: "var(--clothcore-text-soft)" }}>
                                      LKR {Number(latestPayment.amount || 0).toLocaleString()} · {latestPayment.createdAt ? new Date(latestPayment.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                                    </div>
                                  </>
                                ) : (
                                  <span style={{ fontSize: "12.5px", color: "var(--clothcore-text-soft)" }}>No payments yet</span>
                                )}
                              </td>
                              <td>
                                <span className={`admin-badge ${badgeClass}`}>{status}</span>
                              </td>
                              <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                                {effectiveRemaining > 0 ? (
                                  <button
                                    className="btn btn-sm fw-bold px-3"
                                    style={{ background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", borderRadius: "8px", border: "none", whiteSpace: "nowrap" }}
                                    onClick={() => goToOrder(navigate, order)}
                                  >
                                    {getOrderActionTarget(order).label}
                                  </button>
                                ) : latestPayment?.status === "Verified" ? (
                                  <button
                                    className="btn btn-sm fw-bold d-flex align-items-center gap-1 ms-auto"
                                    style={{ background: "rgba(82,43,91,0.08)", color: "var(--clothcore-purple)", borderRadius: "8px", border: "none", fontSize: "12px", whiteSpace: "nowrap" }}
                                    disabled={downloadingReceiptFor === orderKey}
                                    onClick={() => downloadReceipt(orderKey)}
                                    title="Download payment receipt"
                                  >
                                    <Download size={13} />
                                    {downloadingReceiptFor === orderKey ? "..." : "Receipt"}
                                  </button>
                                ) : null}
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

    </ShopOwnerLayout>
  );
}

export default Payments;

