import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { ArrowLeft, Image } from "react-bootstrap-icons";

// Matches the status set used everywhere else in the app (Orders.js's
// getStatusBadgeStyle) — was previously hardcoded to a single static
// "admin-badge-info" chip here regardless of the order's real status.
const STATUS_HERO_COLOR = {
  Pending: "var(--clothcore-warning)",
  Approved: "var(--clothcore-info)",
  Production: "var(--clothcore-mauve)",
  "In Delivery": "var(--clothcore-mauve)",
  Delivered: "var(--clothcore-success)",
  Cancelled: "var(--clothcore-danger)",
};

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [sample, setSample] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const orderRes = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setOrder(orderRes.data);

        const [paymentsRes, sampleRes, deliveryRes] = await Promise.allSettled([
          axios.get(`http://localhost:5000/api/payments/order/${orderRes.data._id}`),
          axios.get(`http://localhost:5000/api/samples/order/${orderRes.data._id}`),
          axios.get(`http://localhost:5000/api/deliveries/order/${orderRes.data._id}`),
        ]);

        if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.data || []);
        if (sampleRes.status === "fulfilled") setSample(sampleRes.value.data);
        if (deliveryRes.status === "fulfilled") setDelivery(deliveryRes.value.data);
      } catch (err) {
        console.error("Load Order Details Error:", err);
        setError(err.response?.data?.message || "Could not load this order.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <AdminLayout>
            <button
              className="btn mb-3 d-flex align-items-center gap-2 admin-link-btn"
              style={{ background: "transparent", border: "none", padding: 0 }}
              onClick={() => navigate("/admin/orders")}
            >
              <ArrowLeft size={16} /> Back to Orders
            </button>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="card admin-content-card">
                <div className="card-body text-center py-5" style={{ color: "var(--clothcore-danger)" }}>
                  {error}
                </div>
              </div>
            ) : (
              <>
                <div className="admin-page-header">
                  <div>
                    <h2 className="admin-page-title">Order {order.orderId}</h2>
                    <p className="admin-page-subtitle">
                      Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <span
                    className="admin-hero-badge"
                    style={{ color: STATUS_HERO_COLOR[order.status] || "var(--clothcore-purple)" }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="row g-4">
                  <div className="col-lg-7">
                    <div className="card admin-content-card">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-purple)" }}>Order Information</h5>
                        <div className="row g-3">
                          <div className="col-md-6"><small className="text-muted">Customer</small><p className="mb-0 fw-medium">{order.customerName}</p></div>
                          <div className="col-md-6"><small className="text-muted">Email</small><p className="mb-0 fw-medium" style={!order.customerEmail ? { fontStyle: "italic", color: "var(--clothcore-text-soft, #999)" } : undefined}>{order.customerEmail || "Legacy order data incomplete"}</p></div>
                          <div className="col-md-6"><small className="text-muted">Item</small><p className="mb-0 fw-medium">{order.item}</p></div>
                          <div className="col-md-6"><small className="text-muted">Quantity</small><p className="mb-0 fw-medium">{order.quantity}</p></div>
                          <div className="col-md-6"><small className="text-muted">Unit Price</small><p className="mb-0 fw-medium">LKR {Number(order.unitPrice || 0).toLocaleString()}</p></div>
                          <div className="col-md-6"><small className="text-muted">Total Amount</small><p className="mb-0 fw-medium" style={{ color: "var(--clothcore-purple)" }}>LKR {Number(order.totalAmount || 0).toLocaleString()}</p></div>
                          <div className="col-md-6"><small className="text-muted">Progress</small><p className="mb-0 fw-medium">{order.progress || 0}%</p></div>
                          <div className="col-md-6"><small className="text-muted">Delivery Date</small><p className="mb-0 fw-medium">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "Not scheduled"}</p></div>
                          <div className="col-md-6"><small className="text-muted">Delivery Method</small><p className="mb-0 fw-medium">{order.deliveryMethod || "Not specified"}</p></div>
                          <div className="col-12"><small className="text-muted">Delivery Address</small><p className="mb-0 fw-medium">{order.deliveryAddress || "Not specified"}</p></div>
                          <div className="col-12"><small className="text-muted">Notes</small><p className="mb-0">{order.notes || "No notes"}</p></div>
                        </div>
                      </div>
                    </div>

                    <div className="card admin-content-card mt-4">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-purple)" }}>Payments</h5>
                        {payments.length === 0 ? (
                          <p className="text-muted mb-0">No payments recorded yet.</p>
                        ) : (
                          <div className="table-responsive">
                            <table className="table admin-table mb-0">
                              <thead><tr><th>Stage</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                              <tbody>
                                {payments.map((p) => (
                                  <tr key={p._id}>
                                    <td>{p.stage}</td>
                                    <td>{p.paymentMethod}</td>
                                    <td>LKR {Number(p.amount || 0).toLocaleString()}</td>
                                    <td><span className={`admin-badge ${p.status === "Verified" ? "admin-badge-success" : p.status === "Rejected" ? "admin-badge-danger" : "admin-badge-warning"}`}>{p.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="card admin-content-card">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-purple)" }}>Sample</h5>
                        {sample ? (
                          <>
                            <span className="admin-badge admin-badge-info mb-2">{sample.status}</span>
                            {sample.imageUrl && (
                              <div className="mb-2">
                                <a href={sample.imageUrl} target="_blank" rel="noreferrer" className="d-flex align-items-center gap-2">
                                  <Image size={14} /> View sample image
                                </a>
                              </div>
                            )}
                            <p className="text-muted mb-0" style={{ fontSize: "13px" }}>{sample.notes || "No notes"}</p>
                          </>
                        ) : (
                          <p className="text-muted mb-0">No sample created yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="card admin-content-card mt-4">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-purple)" }}>Delivery</h5>
                        {delivery ? (
                          <>
                            <span className="admin-badge admin-badge-info mb-2">{delivery.status}</span>
                            <div className="mb-1"><small className="text-muted">Staff</small><p className="mb-0">{delivery.deliveryStaffName || "Not assigned"}</p></div>
                            <div className="mb-1"><small className="text-muted">Tracking Number</small><p className="mb-0">{delivery.trackingNumber || "N/A"}</p></div>
                            <div><small className="text-muted">Scheduled Date</small><p className="mb-0">{delivery.scheduledDate ? new Date(delivery.scheduledDate).toLocaleDateString() : "Not scheduled"}</p></div>
                          </>
                        ) : (
                          <p className="text-muted mb-0">No delivery record created yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
    </AdminLayout>
  );
}

export default AdminOrderDetails;
