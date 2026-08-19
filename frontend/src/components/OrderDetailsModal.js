// src/components/OrderDetailsModal.js
// "View Details" modal for Admin Orders — a single consolidated, real-data
// view (order + shop + payments + production + delivery) instead of
// navigating to a separate page. Fetches GET /api/orders/:id/full-details
// on open.
import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "react-bootstrap-icons";
import AppModal from "./modals/AppModal";
import GarmentDesignPreview from "./order/GarmentDesignPreview";

const ORDERS_API_URL = "http://localhost:5000/api/orders";

const C = {
  plum900: "#190019",
  plum700: "#522B5B",
  mauve500: "#854F6C",
};

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between align-items-start py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.08)", gap: 12 }}>
      <span style={{ color: C.mauve500, fontSize: 13, flexShrink: 0 }}>{label}</span>
      <span className="fw-bold" style={{ color: C.plum900, fontSize: 13.5, textAlign: "right" }}>{value ?? "—"}</span>
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

function formatDate(d) {
  if (!d) return "Not set";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function OrderDetailsModal({ orderId, onClose, onSendToProduction }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError("");
    axios.get(`${ORDERS_API_URL}/${orderId}/full-details`)
      .then((res) => setDetail(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load order details."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const order = detail?.order;
  const itemMatch = order ? /^(.*?)\s*\((.*?),\s*(.*?)\)\s*$/.exec(order.item || "") : null;
  const garment = order?.garmentType || itemMatch?.[1] || order?.item || "—";
  const fabric = itemMatch?.[2] || "—";
  const color = itemMatch?.[3] || "—";

  const canSendToProduction =
    order?.approval?.status === "Approved" &&
    order?.status === "Approved" &&
    order?.paymentStatus !== "Pending";

  const handleSend = async () => {
    if (!onSendToProduction) return;
    setSending(true);
    await onSendToProduction(order);
    setSending(false);
  };

  return (
    <AppModal open={Boolean(orderId)} onClose={onClose} labelledBy="order-details-title" maxWidth={640}>
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`, color: "#fff", padding: 18 }}
      >
        <div id="order-details-title" className="fw-bold">
          Order {order?.orderId || "…"}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ background: "rgba(255,255,255,0.14)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4" style={{ maxHeight: "78vh", overflowY: "auto" }}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
          </div>
        ) : error ? (
          <div style={{ color: "#b3261e", fontWeight: 600, fontSize: 13.5 }}>{error}</div>
        ) : detail ? (
          <>
            <Section title="Shop & Customer">
              <Row label="Shop" value={detail.shop?.shopName || "—"} />
              <Row label="Shop Owner" value={order.customerName} />
              <Row label="Email" value={order.customerEmail} />
              <Row label="Phone" value={detail.shop?.phone || "—"} />
            </Section>

            <Section title="Garment">
              <Row label="Garment" value={garment} />
              <Row label="Fabric" value={fabric} />
              <Row label="Color" value={color} />
              <Row label="Total Quantity" value={`${order.quantity} pcs`} />
              <Row
                label="Design Type"
                value={
                  order.design?.designSource === "ai_generated" ? "AI Generated"
                    : order.design?.designSource === "uploaded_logo" ? "Uploaded Logo"
                    : "No design on file"
                }
              />
              {order.design?.designSource === "ai_generated" && order.design.generatedDesignPath && (
                <img
                  src={order.design.generatedDesignPath}
                  alt="AI generated design"
                  style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginTop: 8 }}
                />
              )}
              {order.design?.designSource === "uploaded_logo" && (
                <div style={{ marginTop: 8 }}>
                  <GarmentDesignPreview garmentName={garment} colorLabel={color} logoPath={order.design.uploadedLogoPath} height={200} />
                </div>
              )}
            </Section>

            <Section title="Pricing & Payment">
              <Row label="Unit Price" value={`Rs. ${Number(order.unitPrice).toFixed(2)}`} />
              <Row label="Total Order Cost" value={`Rs. ${Number(order.totalAmount).toFixed(2)}`} />
              <Row label="Amount Paid (Verified)" value={`Rs. ${Number(detail.amountPaid).toFixed(2)}`} />
              <Row label="Pending Balance" value={`Rs. ${Number(detail.balanceDue).toFixed(2)}`} />
              <Row label="Payment Status" value={order.paymentStatus} />
            </Section>

            <Section title="Order Status">
              <Row label="Approval Status" value={order.approval?.status || "Not Required"} />
              <Row label="Order Status" value={order.status} />
              <Row label="Production Stage" value={detail.production ? `${detail.production.stage} (${detail.production.progress}%)` : "Not started"} />
              <Row label="Delivery Status" value={detail.delivery?.status || "No delivery record yet"} />
            </Section>

            <Section title="Dates">
              <Row label="Order Placed" value={formatDate(order.createdAt)} />
              <Row label="Delivery Date" value={formatDate(order.deliveryDate)} />
            </Section>

            {canSendToProduction && onSendToProduction && (
              <button
                type="button"
                className="btn w-100 fw-bold"
                disabled={sending}
                onClick={handleSend}
                style={{ background: "linear-gradient(135deg, #522b5b, #854f6c)", color: "#fff", border: "none", borderRadius: 12, padding: "11px" }}
              >
                {sending ? "Sending…" : "Send to Production"}
              </button>
            )}
          </>
        ) : null}
      </div>
    </AppModal>
  );
}

export default OrderDetailsModal;
