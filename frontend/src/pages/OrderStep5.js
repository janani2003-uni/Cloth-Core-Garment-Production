
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Building, CheckLg } from "react-bootstrap-icons";
import { getUser } from "../utils/auth";
import ShopTopbar from "../components/ShopTopbar";
import { getBusinessRules } from "../utils/businessRules";

function OrderStep5() {
  const navigate = useNavigate();

  const [draft, setDraft] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState(30);

  useEffect(() => {
    getBusinessRules().then((rules) => setAdvancePaymentPercentage(rules.advancePaymentPercentage));
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
    const hasRequiredFields =
      stored.garment &&
      stored.fabric &&
      stored.color &&
      typeof stored.unitPrice === "number" &&
      stored.sizes &&
      typeof stored.totalQuantity === "number" &&
      stored.totalQuantity > 0;

    if (!hasRequiredFields) {
      alert("Please complete the previous steps before submitting an order.");
      navigate("/step1");
      return;
    }
    setDraft(stored);
  }, [navigate]);

  if (!draft) {
    return null;
  }

  const subTotal = draft.unitPrice * draft.totalQuantity;

  const handleSubmit = async () => {
    const user = getUser();
    if (!user) {
      alert("You must be logged in to place an order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("http://localhost:5000/api/orders", {
        userId: user._id,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        item: `${draft.garment} (${draft.fabric}, ${draft.color})`,
        quantity: draft.totalQuantity,
        unitPrice: draft.unitPrice,
        deliveryDate: draft.deliveryDate || undefined,
        notes: draft.designNotes || "",
      });

      const createdOrder = response.data.order || response.data;

      // Only record a payment if the user actually filled in the fields —
      // never fabricate a transaction. A failure here should not hide the
      // fact that the order itself was created successfully.
      if (paymentMethod && amount && transactionReference) {
        try {
          await axios.post("http://localhost:5000/api/payments", {
            orderId: createdOrder._id,
            paymentType: "Advance Payment",
            paymentMethod,
            amount: Number(amount),
            transactionReference,
          });
        } catch (paymentErr) {
          alert(
            "Your order was created, but recording the advance payment failed: " +
              (paymentErr.response?.data?.message || paymentErr.message)
          );
        }
      }

      localStorage.removeItem("clothCoreOrderDraft");
      navigate("/step6", { state: { order: createdOrder } });
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit the order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0" style={{
      background: "var(--clothcore-bg, #fdf8f7)",
      minHeight: "100vh"
    }}>
      <ShopTopbar />
      <div className="container py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold" style={{ fontSize: "2.2rem" }}>
            <span style={{
              background: "linear-gradient(45deg, #2b124c, #522b5b)",
              padding: "5px 20px",
              borderRadius: "10px",
              color: "white",
              marginRight: "15px"
            }}>
              Step 6
            </span>
            <span style={{ color: "#dfb6b2" }}>
              Payment
            </span>
          </h1>
        </div>

        {/* Advance Payment Notice */}
        <div className="alert mb-4" style={{
          borderRadius: "15px",
          border: "none",
          background: "rgba(217,131,36,0.12)",
          padding: "15px 20px"
        }}>
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "24px", marginRight: "15px" }}>⚠️</span>
            <div>
              <strong style={{ color: "#d98324" }}>
                Recording an advance payment below is optional. Submitting the order
                does not require payment — this only logs a record if you provide one.
              </strong>
            </div>
          </div>
        </div>

        <div className="row">

          {/* Left Column - Order Summary */}
          <div className="col-lg-8">
            <div className="card admin-content-card border-0 mb-4" style={{
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #522b5b, #854f6c)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    1
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                    Order Summary
                  </h4>
                </div>

                <div className="p-3" style={{
                  background: "#f8f9fa",
                  borderRadius: "12px"
                }}>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Garment</span>
                    <span className="fw-bold">{draft.garment}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Fabric</span>
                    <span className="fw-bold">{draft.fabric}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Color</span>
                    <span className="fw-bold">{draft.color}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Quantity</span>
                    <span className="fw-bold">{draft.totalQuantity} pcs</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Unit Price</span>
                    <span className="fw-bold">Rs. {draft.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Delivery Date</span>
                    <span className="fw-bold">{draft.deliveryDate || "Not set"}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span className="text-muted" style={{ fontSize: "18px" }}>Sub Total</span>
                    <span className="fw-bold" style={{ fontSize: "18px", color: "#dfb6b2" }}>
                      Rs. {subTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Optional Advance Payment Record */}
          <div className="col-lg-4">
            <div
              className="p-4"
              style={{
                background: "linear-gradient(135deg, #522b5b, #854f6c)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "35px",
                boxShadow: "0 8px 32px rgba(43,18,76,0.25)",
              }}
            >
              <h5 className="text-white fw-bold mb-1">Record Advance Payment</h5>
              <p className="text-white-50 small mb-3">Optional — leave blank to skip.</p>

              <div className="input-group mb-3">
                <span className="input-group-text"><Building /></span>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Select payment method...</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              <div className="input-group mb-1">
                <span className="input-group-text"><CreditCard /></span>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Amount paid (Rs.)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <p className="text-white-50 small mb-3">
                Suggested {advancePaymentPercentage}% advance: Rs. {Math.round(subTotal * advancePaymentPercentage / 100).toFixed(2)}
                {" "}
                <button
                  type="button"
                  className="btn btn-sm p-0 border-0"
                  style={{ background: "transparent", color: "#fff", textDecoration: "underline" }}
                  onClick={() => setAmount(String(Math.round(subTotal * advancePaymentPercentage / 100)))}
                >
                  Use this
                </button>
              </p>

              <div className="input-group mb-3">
                <span className="input-group-text"><CheckLg /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Transaction reference / receipt no."
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                />
              </div>

              <p className="text-white-50 small mb-0">
                This record is saved alongside your order once submitted.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <button
            className="btn px-5 py-2"
            style={{
              background: "#6c757d",
              color: "white",
              borderRadius: "30px",
              fontWeight: "bold",
              border: "none",
              transition: "all 0.3s ease"
            }}
            onClick={() => navigate("/order-delivery")}
            disabled={isSubmitting}
          >
            ← Back
          </button>
          <button
            className="btn px-5 py-2 fw-bold"
            style={{
              background: isSubmitting
                ? "#ccc"
                : "linear-gradient(45deg, #522b5b, #854f6c)",
              color: "white",
              borderRadius: "30px",
              border: "none",
              boxShadow: isSubmitting ? "none" : "0 4px 25px rgba(82, 43, 91, 0.4)",
              transition: "all 0.3s ease",
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Confirm & Submit Order"}
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .card {
            animation: fadeIn 0.5s ease;
          }

          .btn:hover:not(:disabled) {
            transform: scale(1.05);
          }

          .input-group-text {
            background: rgba(255,255,255,0.9);
            border: none;
          }

          .form-control, .form-select {
            border: none;
            background: rgba(255,255,255,0.9);
          }

          .form-control:focus, .form-select:focus {
            box-shadow: none;
            border: none;
            background: white;
          }
        `}
      </style>
    </div>
  );
}

export default OrderStep5;
