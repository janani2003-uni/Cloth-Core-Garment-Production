
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Building, Paperclip, X, Lock } from "react-bootstrap-icons";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import OrderStepHeader from "../components/order/OrderStepHeader";
import OrderNavButtons from "../components/order/OrderNavButtons";
import { ORDER_COLORS as C } from "../utils/orderTheme";
import { getUser } from "../utils/auth";
import { ADMIN_PREVIEW_ORDER_KEY } from "../components/order/AdminOrderFlowNav";
import "../styles/orderFlow.css";

const ORDERS_API_URL = "http://localhost:5000/api/orders";
const PAYMENTS_API_URL = "http://localhost:5000/api/payments";

const MAX_PROOF_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_PROOF_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

function OrderStep5() {
  const navigate = useNavigate();

  const [draft, setDraft] = useState(null);
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockedMessage, setBlockedMessage] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Card Payment");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [proofFile, setProofFile] = useState(null); // File object
  const [proofFileName, setProofFileName] = useState("");
  const [proofFileError, setProofFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Editable "Amount to Pay" — defaults to the required minimum for the
  // current stage but the shop owner may raise it (up to the order's full
  // remaining balance) to pay more than the required advance, including
  // paying everything upfront. Never allowed to go below the minimum.
  const [payAmountInput, setPayAmountInput] = useState("");

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_PROOF_TYPES.includes(file.type)) {
      setProofFileError("Unsupported file type. Please use JPG, JPEG, PNG, or PDF.");
      return;
    }
    if (file.size > MAX_PROOF_FILE_SIZE) {
      setProofFileError("File is too large. Maximum size is 10MB.");
      return;
    }

    setProofFile(file);
    setProofFileName(file.name);
    setProofFileError("");
  };

  const loadInvoice = useCallback(async (orderId) => {
    try {
      const res = await axios.get(`${ORDERS_API_URL}/${orderId}/invoice`);
      setInvoice(res.data);
    } catch {
      // Non-fatal — the summary just won't show the auto-calculated amount
      // until this succeeds; the backend still enforces the real amount at
      // submission time regardless.
    }
  }, []);

  // Payment is only reachable once the backend confirms the order is
  // Approved (or exempt via "Not Required") — never trust the frontend's
  // own local draft state for this. A real Shop Owner with an order still
  // Pending or Rejected is bounced back to the Admin Approval step exactly
  // as before. An Admin who jumped here directly via Admin Test Navigation
  // instead stays on the page with an inline blocked message.
  const loadOrder = useCallback(async () => {
    const isAdmin = getUser()?.role === "admin";
    const stored = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");

    if (isAdmin) {
      const candidateIds = [stored.orderId, localStorage.getItem(ADMIN_PREVIEW_ORDER_KEY)].filter(Boolean);
      setDraft(stored);

      for (const candidateId of candidateIds) {
        try {
          const res = await axios.get(`${ORDERS_API_URL}/${candidateId}`);
          const fetchedOrder = res.data;
          const approvalStatus = fetchedOrder.approval?.status;

          setOrder(fetchedOrder);
          if (approvalStatus !== "Approved" && approvalStatus !== "Not Required") {
            setBlockedMessage(
              approvalStatus === "Rejected"
                ? `This order was rejected${fetchedOrder.approval?.rejectionReason ? `: "${fetchedOrder.approval.rejectionReason}"` : "."}`
                : "This order is still waiting for Admin/Supervisor approval."
            );
          } else {
            loadInvoice(fetchedOrder._id);
          }
          setLoading(false);
          return;
        } catch {
          // Stale/deleted — try the next candidate instead of erroring out.
        }
      }

      setBlockedMessage('No saved orders exist yet to preview. Pick one from "Admin Test Navigation" above, or place a real order as a Shop Owner first.');
      setLoading(false);
      return;
    }

    if (!stored.orderId) {
      alert("Please complete the Admin Approval step before proceeding to payment.");
      navigate("/order-approval");
      return;
    }

    setDraft(stored);

    try {
      const res = await axios.get(`${ORDERS_API_URL}/${stored.orderId}`);
      const fetchedOrder = res.data;
      const approvalStatus = fetchedOrder.approval?.status;

      if (approvalStatus !== "Approved" && approvalStatus !== "Not Required") {
        alert("Your order must be approved by an Admin or Supervisor before you can pay.");
        navigate("/order-approval");
        return;
      }

      setOrder(fetchedOrder);
      await loadInvoice(fetchedOrder._id);
    } catch (err) {
      alert(err.response?.data?.message || "Could not load your order. Please try again.");
      navigate("/order-approval");
    } finally {
      setLoading(false);
    }
  }, [navigate, loadInvoice]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (invoice?.amountToPay) {
      setPayAmountInput(String(invoice.amountToPay));
    }
  }, [invoice]);

  if (loading) {
    return (
      <ShopOwnerLayout
        contentClassName="order-flow-page"
        contentStyle={{ padding: "20px" }}
        shellStyle={{ background: C.cream100 }}
      >
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
        </div>
      </ShopOwnerLayout>
    );
  }

  if (blockedMessage) {
    return (
      <ShopOwnerLayout
        contentClassName="order-flow-page"
        contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
        shellStyle={{ background: C.cream100 }}
      >
        <div className="container py-4">
          <OrderStepHeader stepIndex={7} title="Payments" subtitle="Admin preview" />
          <div
            className="p-4 text-center"
            style={{ background: "#fff", borderRadius: 20, boxShadow: "0 10px 40px rgba(25,0,25,0.08)", color: C.mauve500 }}
          >
            {order && (
              <div className="fw-bold mb-2" style={{ color: C.plum900 }}>
                {order.orderId}
              </div>
            )}
            {blockedMessage}
          </div>
        </div>
      </ShopOwnerLayout>
    );
  }

  if (!draft || !order) {
    return (
      <ShopOwnerLayout
        contentClassName="order-flow-page"
        contentStyle={{ padding: "20px" }}
        shellStyle={{ background: C.cream100 }}
      >
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
        </div>
      </ShopOwnerLayout>
    );
  }

  const totalOrderCost = order.totalAmount;
  const advanceRequired = Number(order.advanceAmount || 0);
  const remainingBalance = Number(order.remainingBalance ?? Math.max(0, totalOrderCost - advanceRequired));
  const amountToPay = invoice?.amountToPay ?? advanceRequired;
  const stageLabel = invoice?.nextStage === "Final" ? "remaining balance" : "50% advance payment";
  const alreadyFullyPaid = invoice && invoice.nextStage === null;

  // The garment/fabric/color display normally comes straight from the local
  // draft, but a shop owner can land here via an "Order Approved"
  // notification on a session that never had that draft — fall back to
  // parsing them out of the order's own `item` string, which the backend
  // always has, so the summary never renders blank.
  const itemMatch = /^(.*?)\s*\((.*?),\s*(.*?)\)\s*$/.exec(order.item || "");
  const garmentDisplay = draft.garment || itemMatch?.[1] || order.item || "—";
  const fabricDisplay = draft.fabric || itemMatch?.[2] || "—";
  const colorDisplay = draft.color || itemMatch?.[3] || "—";

  const cardLast4 = cardNumber.replace(/\D/g, "").slice(-4);
  const payAmount = Number(payAmountInput) || 0;
  const minPayable = Number(amountToPay) || 0;
  const maxPayable = Number(invoice?.balanceDue ?? amountToPay) || 0;
  const amountValid = payAmount >= minPayable - 0.001 && payAmount <= maxPayable + 0.001;
  const canSubmit =
    !alreadyFullyPaid &&
    amountValid &&
    (paymentMethod === "Card Payment"
      ? /^\d{13,19}$/.test(cardNumber.replace(/\s/g, "")) && /^\d{2}\/\d{2}$/.test(cardExpiry) && /^\d{3,4}$/.test(cardCvv)
      : Boolean(proofFile));

  const handleSubmit = async () => {
    if (!amountValid) {
      setSubmitError(`Please enter an amount between Rs. ${minPayable.toFixed(2)} and Rs. ${maxPayable.toFixed(2)}.`);
      return;
    }
    if (!canSubmit) {
      setSubmitError(
        paymentMethod === "Online Bank Transfer"
          ? "Please attach your payment proof (JPG, PNG or PDF) before continuing."
          : "Please enter a valid card number, expiry (MM/YY), and CVV."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("orderId", order._id);
      formData.append("paymentMethod", paymentMethod);
      formData.append("amount", String(payAmount));
      if (paymentMethod === "Card Payment") {
        formData.append("cardLast4", cardLast4);
      } else if (proofFile) {
        formData.append("proofFile", proofFile);
      }

      await axios.post(PAYMENTS_API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Never keep raw card details around, even in memory, once used.
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");

      localStorage.removeItem("clothCoreOrderDraft");
      navigate("/step6", { state: { order } });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Could not record your payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardStyle = {
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(25,0,25,0.08)",
    background: "#fff",
  };

  return (
    <ShopOwnerLayout
      contentClassName="order-flow-page"
      contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
      shellStyle={{ background: C.cream100 }}
    >
      <div className="container py-4">
        <OrderStepHeader
          stepIndex={7}
          title="Payments"
          subtitle="Your order has been approved — complete your payment to confirm it."
        />

        {/* Mandatory payment notice — no wording anywhere suggests payment
            is optional or skippable. */}
        <div className="alert mb-4" style={{
          borderRadius: "15px",
          border: "none",
          background: "rgba(82,43,91,0.08)",
          padding: "15px 20px"
        }}>
          <div className="d-flex align-items-center">
            <span className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", color: C.plum700, marginRight: 15 }}>
              <Lock size={17} />
            </span>
            <div>
              <strong style={{ color: C.plum900 }}>
                {alreadyFullyPaid
                  ? "This order is fully paid."
                  : `A ${stageLabel} of Rs. ${Number(amountToPay).toFixed(2)} is required to confirm your order.`}
              </strong>
            </div>
          </div>
        </div>

        <div className="row">

          {/* Left Column - Order Summary */}
          <div className="col-lg-8">
            <div className="card border-0 mb-4" style={cardStyle}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`,
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    1
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                    Order Summary
                  </h4>
                </div>

                <div className="d-flex align-items-center gap-2 mb-3">
                  <span
                    className="d-flex align-items-center gap-1 fw-bold"
                    style={{ background: "rgba(31,122,68,0.12)", color: "#1f7a44", padding: "5px 14px", borderRadius: 20, fontSize: 12.5 }}
                  >
                    Order {order.orderId} · Approved
                  </span>
                </div>

                <div className="p-3" style={{
                  background: C.cream100,
                  borderRadius: "12px"
                }}>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Garment</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>{garmentDisplay}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Fabric</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>{fabricDisplay}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Color</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>{colorDisplay}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Quantity</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>{order.quantity} pcs</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Unit Price</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>Rs. {Number(order.unitPrice).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Delivery Date</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not set"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ fontSize: "16px", color: C.mauve500 }}>Total Order Cost</span>
                    <span className="fw-bold" style={{ fontSize: "16px", color: C.plum700 }}>
                      Rs. {Number(totalOrderCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: "#1f7a44", fontWeight: 600 }}>Advance Payment Required (50%)</span>
                    <span className="fw-bold" style={{ color: "#1f7a44" }}>Rs. {advanceRequired.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span style={{ color: C.plum700, fontWeight: 600 }}>Remaining Balance (50%)</span>
                    <span className="fw-bold" style={{ color: C.plum700 }}>Rs. {remainingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="col-lg-4">
            <div
              className="p-4"
              style={{
                background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`,
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "35px",
                boxShadow: "0 8px 32px rgba(43,18,76,0.25)",
              }}
            >
              <h5 className="text-white fw-bold mb-1">Payment</h5>
              <p className="text-white-50 small mb-3">
                {alreadyFullyPaid ? "No further payment is due." : "50% advance payment is required to confirm your order."}
              </p>

              {!alreadyFullyPaid && (
                <>
                  {/* Amount to Pay — defaults to the required minimum for
                      this stage, but editable: the shop owner can pay more
                      (up to the full remaining balance) if they choose to,
                      never less than the minimum. */}
                  <div className="mb-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.92)", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.mauve500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Amount to Pay (min Rs. {minPayable.toFixed(2)})
                    </div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <span style={{ fontSize: 18, fontWeight: 800, color: C.plum900 }}>Rs.</span>
                      <input
                        type="number"
                        min={minPayable}
                        max={maxPayable}
                        step="0.01"
                        value={payAmountInput}
                        onChange={(e) => { setPayAmountInput(e.target.value); setSubmitError(""); }}
                        style={{
                          fontSize: 20, fontWeight: 800, color: C.plum900, border: "none",
                          background: "transparent", width: "100%", outline: "none",
                        }}
                      />
                    </div>
                    {!amountValid && payAmountInput !== "" && (
                      <div style={{ fontSize: 11.5, color: "#b3261e", fontWeight: 600, marginTop: 2 }}>
                        Must be between Rs. {minPayable.toFixed(2)} and Rs. {maxPayable.toFixed(2)}.
                      </div>
                    )}
                    {maxPayable > minPayable && (
                      <div style={{ fontSize: 11, color: C.mauve500, marginTop: 2 }}>
                        You may pay more than the minimum — up to the full remaining balance of Rs. {maxPayable.toFixed(2)}.
                      </div>
                    )}
                  </div>

                  {/* Payment method — exactly two options. */}
                  <div className="d-flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("Card Payment"); setSubmitError(""); }}
                      className="btn flex-fill d-flex align-items-center justify-content-center gap-2 cc-toggle-btn"
                      style={{
                        borderRadius: 10,
                        padding: "10px",
                        fontWeight: 700,
                        fontSize: 13,
                        border: paymentMethod === "Card Payment" ? "2px solid #fff" : "1.5px solid rgba(255,255,255,0.4)",
                        background: paymentMethod === "Card Payment" ? "#fff" : "transparent",
                        color: paymentMethod === "Card Payment" ? C.plum800 : "#fff",
                      }}
                    >
                      <CreditCard size={15} /> Card
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("Online Bank Transfer"); setSubmitError(""); }}
                      className="btn flex-fill d-flex align-items-center justify-content-center gap-2 cc-toggle-btn"
                      style={{
                        borderRadius: 10,
                        padding: "10px",
                        fontWeight: 700,
                        fontSize: 13,
                        border: paymentMethod === "Online Bank Transfer" ? "2px solid #fff" : "1.5px solid rgba(255,255,255,0.4)",
                        background: paymentMethod === "Online Bank Transfer" ? "#fff" : "transparent",
                        color: paymentMethod === "Online Bank Transfer" ? C.plum800 : "#fff",
                      }}
                    >
                      <Building size={15} /> Bank Transfer
                    </button>
                  </div>

                  {paymentMethod === "Card Payment" ? (
                    <>
                      <div className="input-group mb-2">
                        <span className="input-group-text"><CreditCard /></span>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={19}
                          className="form-control"
                          placeholder="Card number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                        />
                      </div>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          maxLength={5}
                          className="form-control"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/[^\d]/g, "");
                            if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
                            setCardExpiry(v);
                          }}
                        />
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          className="form-control"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <p className="text-white-50 mb-3" style={{ fontSize: 11 }}>
                        <Lock size={10} className="me-1" />
                        Your card number and CVV are never stored — only the last 4 digits are kept for your own reference.
                      </p>
                    </>
                  ) : (
                    <div className="mb-3">
                      {proofFile ? (
                        <div
                          className="d-flex align-items-center justify-content-between px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.9)", borderRadius: 8, fontSize: 13 }}
                        >
                          <span className="d-flex align-items-center gap-2" style={{ color: C.plum900, minWidth: 0 }}>
                            <Paperclip size={14} style={{ flexShrink: 0 }} />
                            <span className="text-truncate">{proofFileName}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => { setProofFile(null); setProofFileName(""); }}
                            style={{ background: "transparent", border: "none", color: C.mauve500, flexShrink: 0 }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="d-flex align-items-center gap-2 px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.9)", borderRadius: 8, fontSize: 13, color: C.plum700, cursor: "pointer", marginBottom: 0 }}
                        >
                          <Paperclip size={14} />
                          Attach payment proof (required)
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleProofFileChange} style={{ display: "none" }} />
                        </label>
                      )}
                      {proofFileError && (
                        <div className="mt-1" style={{ color: "#ffd7d7", fontSize: 12 }}>{proofFileError}</div>
                      )}
                      <p className="text-white-50 mt-2 mb-0" style={{ fontSize: 11 }}>
                        Upload your bank transfer receipt (JPG, PNG or PDF).
                      </p>
                    </div>
                  )}

                  {submitError && (
                    <div className="mb-2" style={{ color: "#ffd7d7", fontSize: 12.5, fontWeight: 600 }}>{submitError}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <OrderNavButtons
          backLabel="Back"
          nextLabel={alreadyFullyPaid ? "Continue" : "Pay & Confirm Order"}
          onBack={() => navigate("/order-approval")}
          onNext={alreadyFullyPaid ? () => navigate("/step6", { state: { order } }) : handleSubmit}
          nextDisabled={!alreadyFullyPaid && !canSubmit}
          backDisabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>

      {/* Page-specific CSS (shared fade-in/focus/nav styles live in orderFlow.css) */}
      <style>
        {`
          .input-group-text {
            background: rgba(255,255,255,0.9);
            border: none;
          }

          .form-control, .form-select {
            border: none;
            background: rgba(255,255,255,0.9);
            color: #190019;
          }

          .form-control::placeholder {
            color: #854f6c;
            opacity: 0.7;
          }

          .form-control:focus, .form-select:focus {
            box-shadow: none;
            border: none;
            background: white;
            color: #190019;
          }
        `}
      </style>
    </ShopOwnerLayout>
  );
}

export default OrderStep5;
