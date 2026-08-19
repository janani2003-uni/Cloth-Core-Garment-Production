// src/components/ApprovalQueueView.js
// Shared order-approval queue used by both the Admin and Supervisor pages
// (role protection happens server-side + at the route level — this
// component itself doesn't hardcode role checks). One implementation, two
// thin page wrappers.
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  IconSearch, IconEye, IconCheck, IconX, IconAlertTriangle,
  IconClock, IconRefresh,
} from "@tabler/icons-react";
import RejectOrderModal from "./RejectOrderModal";
import StockComparisonTable from "./StockComparisonTable";
import GarmentDesignPreview from "./order/GarmentDesignPreview";

const C = {
  plum900: "#190019",
  plum800: "#2B124C",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  cream100: "#FBE4D8",
};

const ORDERS_API_URL = "http://localhost:5000/api/orders";

const STATUS_TABS = ["Pending", "Approved", "Rejected", "All"];

const STATUS_BADGE = {
  Pending: { bg: "rgba(217,131,36,0.15)", color: "#a3600e", Icon: IconClock },
  Approved: { bg: "rgba(31,122,68,0.12)", color: "#1f7a44", Icon: IconCheck },
  Rejected: { bg: "rgba(179,38,30,0.1)", color: "#b3261e", Icon: IconX },
};

function StatusBadge({ status }) {
  const meta = STATUS_BADGE[status] || STATUS_BADGE.Pending;
  const Icon = meta.Icon;
  return (
    <span
      className="d-flex align-items-center gap-1 fw-bold"
      style={{ background: meta.bg, color: meta.color, padding: "5px 12px", borderRadius: 20, fontSize: 11.5, width: "fit-content" }}
    >
      <Icon size={12} stroke={3} /> {status}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ApprovalQueueView({ heading = "Order Approvals", subtitle = "Review and approve or reject orders waiting for stock verification." }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await axios.get(`${ORDERS_API_URL}/approvals`, { params: { status: statusFilter } });
      setOrders(res.data?.data || []);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load the approval queue.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // "New Order Approval Request" notifications link here with ?orderId=...
  // (see Admintopbar.js / RoleNotificationsView.js) — open that exact
  // order's detail view directly instead of leaving Admin/Supervisor to
  // find it in the list themselves.
  useEffect(() => {
    const deepLinkOrderId = searchParams.get("orderId");
    if (!deepLinkOrderId) return;

    openDetails(deepLinkOrderId);

    const next = new URLSearchParams(searchParams);
    next.delete("orderId");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !search ||
      order.orderId.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFrom || new Date(order.createdAt) >= new Date(dateFrom);
    return matchesSearch && matchesDate;
  });

  const openDetails = async (orderId) => {
    setSelectedOrderId(orderId);
    setDetail(null);
    setDetailLoading(true);
    setActionError("");
    try {
      const res = await axios.get(`${ORDERS_API_URL}/${orderId}/approval-details`);
      setDetail(res.data.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOrderId(null);
    setDetail(null);
    setActionError("");
  };

  const handleApprove = async (orderId) => {
    setActionSubmitting(true);
    setActionError("");
    try {
      const res = await axios.patch(`${ORDERS_API_URL}/${orderId}/approve`);
      await loadOrders();
      if (selectedOrderId === orderId) {
        setDetail((prev) => (prev ? { ...prev, order: res.data.order } : prev));
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not approve this order.");
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setActionSubmitting(true);
    setActionError("");
    try {
      await axios.patch(`${ORDERS_API_URL}/${rejectTarget}/reject`, { reason });
      setRejectTarget(null);
      await loadOrders();
      if (selectedOrderId === rejectTarget) closeDetails();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not reject this order.");
    } finally {
      setActionSubmitting(false);
    }
  };

  const cardStyle = { borderRadius: 20, boxShadow: "0 10px 40px rgba(25,0,25,0.08)", background: "#fff" };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title mb-1" style={{ fontSize: "1.8rem" }}>{heading}</h1>
          <p className="admin-page-subtitle mb-0">{subtitle}</p>
        </div>
      </div>

      <div className="card border-0 mb-4" style={cardStyle}>
        <div className="card-body p-4">
          {/* Filters */}
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
            <div className="order-segmented">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={statusFilter === tab ? "is-active" : ""}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-2">
              <div style={{ position: "relative" }}>
                <IconSearch size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.mauve500 }} />
                <input
                  type="text"
                  placeholder="Search order # or customer"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 34, paddingRight: 12, height: 38, borderRadius: 10, border: "1.5px solid rgba(82,43,91,0.18)", fontSize: 13, color: C.plum900, minWidth: 220 }}
                />
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Submitted on or after"
                style={{ height: 38, borderRadius: 10, border: "1.5px solid rgba(82,43,91,0.18)", fontSize: 13, color: C.plum900, padding: "0 10px" }}
              />
              <button
                type="button"
                onClick={loadOrders}
                className="btn d-flex align-items-center gap-1"
                style={{ border: `1.5px solid ${C.mauve500}`, color: C.plum700, borderRadius: 10, fontSize: 13, fontWeight: 600 }}
              >
                <IconRefresh size={14} stroke={2} /> Refresh
              </button>
            </div>
          </div>

          {loadError && (
            <div className="d-flex align-items-center gap-2 mb-3" style={{ color: "#b3261e", fontWeight: 600, fontSize: 13 }} role="alert">
              <IconAlertTriangle size={16} stroke={2.5} /> {loadError}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
            </div>
          ) : loadError ? null : filteredOrders.length === 0 ? (
            <div className="admin-empty-state" style={{ background: C.cream100, borderColor: "rgba(82,43,91,0.15)" }}>
              <div className="admin-empty-state-title" style={{ color: C.plum900 }}>
                {orders.length === 0 ? "No approval requests" : "No matching orders"}
              </div>
              <div className="admin-empty-state-message" style={{ color: C.mauve500 }}>
                {orders.length === 0
                  ? `There are no ${statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}orders waiting for review right now.`
                  : "Nothing matches your current search or date filter — try adjusting them."}
              </div>
            </div>
          ) : (
            <div className="order-table-wrap">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Garment</th>
                    <th>Qty</th>
                    <th>Submitted</th>
                    <th>Stock Check</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const stockStatus = order.approval?.stockVerificationResult?.status;
                    return (
                      <tr key={order._id}>
                        <td className="fw-bold">{order.orderId}</td>
                        <td>{order.customerName}</td>
                        <td>{order.garmentType || "—"}</td>
                        <td>{order.quantity}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          {stockStatus === "sufficient" ? (
                            <span style={{ color: "#1f7a44", fontWeight: 600, fontSize: 12.5 }}>Available</span>
                          ) : stockStatus === "insufficient" ? (
                            <span style={{ color: "#b3261e", fontWeight: 600, fontSize: 12.5 }}>Insufficient</span>
                          ) : (
                            <span style={{ color: C.mauve500, fontSize: 12.5 }}>Not yet checked</span>
                          )}
                        </td>
                        <td><StatusBadge status={order.approval?.status || "Pending"} /></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              onClick={() => openDetails(order._id)}
                              aria-label={`View details for order ${order.orderId}`}
                              title="View Details"
                              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(82,43,91,0.18)", background: "#fff", color: C.plum700, display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <IconEye size={15} stroke={2} />
                            </button>
                            {order.approval?.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(order._id)}
                                  disabled={actionSubmitting}
                                  aria-label={`Approve order ${order.orderId}`}
                                  title="Approve"
                                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(31,122,68,0.3)", background: "rgba(31,122,68,0.08)", color: "#1f7a44", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                  <IconCheck size={15} stroke={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectTarget(order._id)}
                                  aria-label={`Reject order ${order.orderId}`}
                                  title="Reject"
                                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(179,38,30,0.3)", background: "rgba(179,38,30,0.06)", color: "#b3261e", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                  <IconX size={15} stroke={2.5} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedOrderId && (
        <div
          onClick={closeDetails}
          style={{ position: "fixed", inset: 0, background: "rgba(25,0,25,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1040 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 640, maxHeight: "88vh", overflowY: "auto", background: "#fff", borderRadius: 24, boxShadow: "0 30px 80px rgba(25,0,25,0.35)" }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`, color: "#fff", padding: 18, position: "sticky", top: 0, borderRadius: "24px 24px 0 0" }}
            >
              <div className="fw-bold">Order {detail?.order?.orderId || "…"}</div>
              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close"
                style={{ background: "rgba(255,255,255,0.14)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <IconX size={16} stroke={2} />
              </button>
            </div>

            <div className="p-4">
              {detailLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
                </div>
              ) : detail ? (
                <>
                  {actionError && (
                    <div className="d-flex align-items-center gap-2 mb-3" style={{ color: "#b3261e", fontWeight: 600, fontSize: 13 }} role="alert">
                      <IconAlertTriangle size={16} stroke={2.5} /> {actionError}
                    </div>
                  )}

                  <div className="mb-3">
                    <StatusBadge status={detail.order.approval?.status || "Pending"} />
                  </div>

                  <Section title="Shop & Customer">
                    <Row label="Shop" value={detail.shop?.shopName || "—"} />
                    <Row label="Shop Code" value={detail.shop?.shopCode || "—"} />
                    <Row label="Customer" value={detail.order.customerName} />
                    <Row label="Email" value={detail.order.customerEmail} />
                    <Row label="Phone" value={detail.shop?.phone || "—"} />
                  </Section>

                  <Section title="Garment">
                    <Row label="Item" value={detail.order.item} />
                    <Row
                      label="Design Type"
                      value={
                        detail.order.design?.designSource === "ai_generated" || detail.order.design?.type === "ai"
                          ? "AI Generated"
                          : detail.order.design?.designSource === "uploaded_logo" || detail.order.design?.type === "upload"
                          ? "Uploaded Logo"
                          : "No design provided"
                      }
                    />
                    {(() => {
                      const design = detail.order.design;
                      const itemMatch = /^(.*?)\s*\((.*?),\s*(.*?)\)\s*$/.exec(detail.order.item || "");
                      const garmentName = detail.order.garmentType || itemMatch?.[1] || "";
                      const colorLabel = itemMatch?.[3] || "";

                      if (design?.designSource === "ai_generated" || design?.type === "ai") {
                        return (
                          <div className="mt-2">
                            <img
                              src={design.generatedDesignPath}
                              alt={`AI generated design: ${design.prompt}`}
                              style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12 }}
                            />
                            {design.prompt && (
                              <div className="mt-1" style={{ fontSize: 12, color: C.mauve500 }}>Prompt: "{design.prompt}"</div>
                            )}
                          </div>
                        );
                      }
                      if (design?.designSource === "uploaded_logo" || design?.type === "upload") {
                        return (
                          <div className="mt-2">
                            <GarmentDesignPreview
                              garmentName={garmentName}
                              colorLabel={colorLabel}
                              logoPath={design.uploadedLogoPath}
                              height={200}
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </Section>

                  <Section title="Size Breakdown vs. Available Stock">
                    <StockComparisonTable details={detail.stockComparison?.details} />
                  </Section>

                  <Section title="Delivery & Pricing">
                    <Row label="Total Quantity" value={`${detail.order.quantity} pcs`} />
                    <Row label="Unit Price" value={`Rs. ${Number(detail.order.unitPrice).toFixed(2)}`} />
                    <Row label="Estimated Total" value={`Rs. ${Number(detail.order.totalAmount).toFixed(2)}`} />
                    <Row label="Delivery Date" value={formatDate(detail.order.deliveryDate)} />
                    <Row label="Delivery Method" value={detail.order.deliveryMethod || "—"} />
                    <Row label="Delivery Address" value={detail.order.deliveryAddress || "—"} />
                    <Row label="Payment Status" value={detail.order.paymentStatus} />
                    {detail.order.notes && <Row label="Notes" value={detail.order.notes} />}
                  </Section>

                  <Section title="Timeline">
                    <Row label="Submitted" value={formatDate(detail.order.createdAt)} />
                    {detail.order.approval?.approvedAt && <Row label="Approved" value={formatDate(detail.order.approval.approvedAt)} />}
                    {detail.order.approval?.rejectedAt && <Row label="Rejected" value={formatDate(detail.order.approval.rejectedAt)} />}
                    {detail.order.approval?.rejectionReason && <Row label="Rejection Reason" value={detail.order.approval.rejectionReason} />}
                  </Section>

                  {detail.order.approval?.status === "Pending" && (
                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleApprove(detail.order._id)}
                        disabled={actionSubmitting}
                        className="btn flex-fill fw-bold"
                        style={{ background: "linear-gradient(135deg, #1f7a44, #2fa361)", color: "#fff", border: "none", borderRadius: 12, padding: "11px" }}
                      >
                        {actionSubmitting ? "Approving…" : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(detail.order._id)}
                        className="btn flex-fill fw-bold"
                        style={{ background: "transparent", color: "#b3261e", border: "1.5px solid #b3261e", borderRadius: 12, padding: "11px" }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // The order this modal was opened for couldn't be loaded —
                // most often a stale notification pointing at an order
                // that's since been deleted. Previously this rendered
                // nothing at all (just the "Order …" header, no
                // explanation), which read as a broken page rather than a
                // gone-order message.
                <div className="d-flex align-items-center gap-2" style={{ color: "#b3261e", fontWeight: 600, fontSize: 13.5 }} role="alert">
                  <IconAlertTriangle size={16} stroke={2.5} />
                  {actionError || "This order could not be found — it may have been deleted."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <RejectOrderModal
          order={orders.find((o) => o._id === rejectTarget) || detail?.order}
          submitting={actionSubmitting}
          onCancel={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <small className="fw-bold d-block mb-2" style={{ color: C.mauve500, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
        {title}
      </small>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between align-items-start py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.08)", gap: 12 }}>
      <span style={{ color: C.mauve500, fontSize: 13, flexShrink: 0 }}>{label}</span>
      <span className="fw-bold" style={{ color: C.plum900, fontSize: 13.5, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default ApprovalQueueView;
