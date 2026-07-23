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
  Calendar,
  CashStack,
  Receipt
} from "react-bootstrap-icons";
import { getUser } from "../utils/auth";

const ORDERS_API_URL = "http://localhost:5000/api/orders";
const PAYMENTS_API_URL = "http://localhost:5000/api/payments/order";
const PAYMENTS_SUBMIT_URL = "http://localhost:5000/api/payments";
const PAYMENT_TYPES = ["Advance Payment", "Full Payment", "Remaining Balance", "Credit Payment"];

function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasOrders, setHasOrders] = useState(false);
  const [myOrders, setMyOrders] = useState([]);

  const [payingOrder, setPayingOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [payForm, setPayForm] = useState({ paymentType: "Advance Payment", paymentMethod: "", transactionReference: "", amount: "" });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [payError, setPayError] = useState("");

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
            console.error(
              `Load payments for order ${order._id} error:`,
              err
            );
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

  const outstandingOrders = myOrders.filter(
    (order) => order.paymentStatus === "Pending" || order.paymentStatus === "Partial"
  );

  const openPayModal = async (order) => {
    setPayingOrder(order);
    setPayError("");
    setInvoice(null);
    setInvoiceLoading(true);
    setPayForm({
      paymentType: order.paymentStatus === "Partial" ? "Remaining Balance" : "Advance Payment",
      paymentMethod: "",
      transactionReference: "",
      amount: "",
    });
    try {
      const res = await axios.get(`${ORDERS_API_URL}/${order._id}/invoice`);
      setInvoice(res.data);
      setPayForm((f) => ({ ...f, amount: res.data.balanceDue }));
    } catch (err) {
      setPayError(err.response?.data?.message || "Could not load invoice details.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!payingOrder) return;
    if (!payForm.paymentMethod.trim() || !payForm.transactionReference.trim()) {
      setPayError("Payment method and transaction reference are required.");
      return;
    }
    const amountNum = Number(payForm.amount);
    if (!amountNum || amountNum <= 0) {
      setPayError("Enter a valid payment amount.");
      return;
    }

    try {
      setSubmittingPayment(true);
      setPayError("");
      await axios.post(PAYMENTS_SUBMIT_URL, {
        orderId: payingOrder._id,
        paymentType: payForm.paymentType,
        paymentMethod: payForm.paymentMethod.trim(),
        amount: amountNum,
        transactionReference: payForm.transactionReference.trim(),
      });
      setPayingOrder(null);
      await fetchPayments();
    } catch (err) {
      setPayError(err.response?.data?.message || "Could not submit the payment.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "Verified")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === "Submitted")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const getStatusBadgeStyle = (status) => {
    const styles = {
      Verified: {
        bg: "linear-gradient(135deg, var(--clothcore-success), #158a52)",
        icon: CheckCircle,
      },
      Submitted: {
        bg: "linear-gradient(135deg, var(--clothcore-warning), #b8701d)",
        icon: Clock,
      },
      Rejected: {
        bg: "linear-gradient(135deg, var(--clothcore-danger), #b83d4d)",
        icon: XCircle,
      },
    };
    return styles[status] || styles["Submitted"];
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
              <h5 style={{ color: "var(--clothcore-blush)" }}>Loading Payments...</h5>
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
    <ShopOwnerLayout>
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
                      Total Paid (Verified)
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
                      Pending Verification
                    </div>
                    <div className="fw-bold" style={{ fontSize: "26px", color: "var(--clothcore-text)", marginTop: "4px" }}>
                      LKR {totalPending.toLocaleString()}
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
                    <Wallet2 size={24} style={{ color: "var(--clothcore-blush)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center mb-4 gap-3">
            <div>
              <h1 className="fw-bold" style={{ fontSize: "28px", color: "var(--clothcore-text)" }}>
                My Payments
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: "15px" }}>
                Payment history for all your orders
              </p>
            </div>
          </div>

          {/* Outstanding Balances */}
          {outstandingOrders.length > 0 && (
            <div
              className="card admin-content-card mb-4"
              style={{ borderRadius: "20px", boxShadow: "var(--clothcore-shadow)", overflow: "hidden" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-blush)" }}>Outstanding Balances</h5>
                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "14px" }}>
                    <thead>
                      <tr>
                        <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Order ID</th>
                        <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Item</th>
                        <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Total</th>
                        <th className="fw-bold" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", textTransform: "uppercase" }}>Payment Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {outstandingOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>{order.orderId}</td>
                          <td>{order.item}</td>
                          <td>LKR {Number(order.totalAmount || 0).toLocaleString()}</td>
                          <td>
                            <span className={`admin-badge ${order.paymentStatus === "Partial" ? "admin-badge-accent" : "admin-badge-warning"}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm fw-bold px-3"
                              style={{ background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", borderRadius: "8px", border: "none" }}
                              onClick={() => openPayModal(order)}
                            >
                              Make Payment
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Table Card */}
          <div
            className="card admin-content-card"
            style={{ borderRadius: "20px", boxShadow: "var(--clothcore-shadow-hover)", overflow: "hidden" }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: "14px" }}>
                  <thead
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderBottom: "2px solid var(--clothcore-border)",
                    }}
                  >
                    <tr>
                      {["Order ID", "Item", "Payment Type", "Method", "Amount", "Transaction Ref", "Status", "Date"].map(
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
                        <td colSpan="8" className="text-center py-5">
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
                        <td colSpan="8" className="text-center py-5">
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
                        <td colSpan="8" className="text-center py-5">
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
                      payments.map((payment) => {
                        const statusStyle = getStatusBadgeStyle(payment.status);
                        const StatusIcon = statusStyle.icon;
                        return (
                          <tr key={payment._id} style={{ borderBottom: "1px solid var(--clothcore-border)" }}>
                            <td className="px-4 py-3">
                              <span className="fw-bold" style={{ color: "var(--clothcore-blush)", fontSize: "13px" }}>
                                #{payment.orderDisplayId}
                              </span>
                            </td>
                            <td className="px-4 py-3">{payment.orderItem}</td>
                            <td className="px-4 py-3">{payment.paymentType || "N/A"}</td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <CreditCard size={14} className="text-muted me-2" />
                                {payment.paymentMethod || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="fw-bold" style={{ color: "var(--clothcore-text)" }}>
                                LKR {Number(payment.amount || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">{payment.transactionReference || "N/A"}</td>
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
                                {payment.status || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <Calendar size={14} className="text-muted me-2" />
                                {payment.createdAt
                                  ? new Date(payment.createdAt).toLocaleDateString()
                                  : "N/A"}
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

      {payingOrder && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)" }}>
                  Make a Payment — {payingOrder.orderId}
                </h5>
                <button className="btn-close" onClick={() => !submittingPayment && setPayingOrder(null)} />
              </div>
              <div className="modal-body" style={{ padding: "24px" }}>
                {invoiceLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} />
                  </div>
                ) : invoice ? (
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <div className="p-2" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "10px" }}>
                        <small className="text-muted d-block">Total</small>
                        <span className="fw-bold">LKR {Number(invoice.order.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "10px" }}>
                        <small className="text-muted d-block">Paid</small>
                        <span className="fw-bold" style={{ color: "var(--clothcore-success)" }}>LKR {Number(invoice.amountPaid || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2" style={{ background: "rgba(223,182,178,0.10)", borderRadius: "10px" }}>
                        <small className="text-muted d-block">Remaining</small>
                        <span className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>LKR {Number(invoice.balanceDue || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mb-2">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Payment Type</label>
                  <select
                    className="form-select"
                    value={payForm.paymentType}
                    onChange={(e) => setPayForm((f) => ({ ...f, paymentType: e.target.value }))}
                  >
                    {PAYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Amount (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={payForm.amount}
                    onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Payment Method</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bank Transfer, Cheque, Cash"
                    value={payForm.paymentMethod}
                    onChange={(e) => setPayForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Transaction Reference</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Bank slip / cheque / reference number"
                    value={payForm.transactionReference}
                    onChange={(e) => setPayForm((f) => ({ ...f, transactionReference: e.target.value }))}
                  />
                </div>
                <p className="mb-0" style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
                  Your payment will be submitted for Admin verification. You'll be notified once it's verified.
                </p>
                {payError && (
                  <div className="mt-2" style={{ fontSize: "13px", color: "var(--clothcore-danger)" }}>{payError}</div>
                )}
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button className="btn px-4" style={{ borderRadius: "10px", background: "rgba(223,182,178,0.10)", color: "var(--clothcore-text-soft)" }} onClick={() => setPayingOrder(null)} disabled={submittingPayment}>
                  Cancel
                </button>
                <button
                  className="btn px-4 fw-bold"
                  style={{ borderRadius: "10px", background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", color: "white", border: "none" }}
                  onClick={handleSubmitPayment}
                  disabled={submittingPayment}
                >
                  {submittingPayment ? "Submitting..." : "Submit Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ShopOwnerLayout>
  );
}

export default Payments;
