
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Building, Upload, CheckLg, Calendar, Lock }
from "react-bootstrap-icons";

function OrderStep5() {
  const navigate = useNavigate();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [formData, setFormData] = useState({
    paymentMethod: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bankName: "",
    accountNumber: "",
    amount: 120000,
  });

  // Mock data - in real app this would come from previous steps
  const orderData = {
    grandTotal: 120000.00,
    advancePercentage: 50
  };

  const advanceAmount = (orderData.grandTotal * orderData.advancePercentage) / 100;
  const balanceAmount = orderData.grandTotal - advanceAmount;

  const paymentMethods = [
    { id: "bank", name: "Bank Transfer", icon: "🏦", description: "Transfer the advance amount to our bank account." },
    { id: "cod", name: "Cash on Delivery (Advance)", icon: "💵", description: "Pay advance now, balance on delivery." },
    { id: "online", name: "Online Payment", icon: "💳", description: "Pay advance securely online." }
  ];

  const handlePaymentSelect = (methodId) => {
    setSelectedPayment(methodId);
    // Map the new payment methods to the old ones
    let mappedMethod = "";
    if (methodId === "credit") mappedMethod = "Credit Card";
    else if (methodId === "debit") mappedMethod = "Debit Card";
    else if (methodId === "deposit") mappedMethod = "Bank Deposit";
    else if (methodId === "online") mappedMethod = "Online Banking";
    
    setFormData({ ...formData, paymentMethod: mappedMethod });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    console.log("File selected:", e.target.files[0]);
  };

  const handlePayment = () => {
    if (formData.paymentMethod) {
      let methodName = formData.paymentMethod;
      alert(`Payment method selected: ${methodName}\nAdvance payment of Rs. ${advanceAmount.toFixed(2)} will be processed.`);
      navigate("/step6");
    } else {
      alert("Please select a payment method first.");
    }
  };

  const handleConfirmPayment = () => {
    if (selectedPayment || formData.paymentMethod) {
      alert(`Payment method selected: ${formData.paymentMethod || selectedPayment}\nAdvance payment of Rs. ${advanceAmount.toFixed(2)} will be processed.`);
      navigate("/step6");
    } else {
      alert("Please select a payment method first.");
    }
  };

  return (
    <div className="container-fluid p-0" style={{ 
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      minHeight: "100vh"
    }}>
      <div className="container py-4">

        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold" style={{ fontSize: "2.2rem" }}>
            <span style={{ 
              background: "linear-gradient(45deg, #f2a100, #ff6f00)",
              padding: "5px 20px",
              borderRadius: "10px",
              color: "white",
              marginRight: "15px"
            }}>
              Step 6
            </span>
            <span style={{ color: "#0b3aa0" }}>
              Payment
            </span>
          </h1>
        </div>

        {/* Advance Payment Notice */}
        <div className="alert alert-warning mb-4" style={{
          borderRadius: "15px",
          border: "none",
          background: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
          padding: "15px 20px"
        }}>
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "24px", marginRight: "15px" }}>⚠️</span>
            <div>
              <strong style={{ color: "#e65100" }}>
                To confirm your order, an advance payment (50%) is required.
              </strong>
            </div>
          </div>
        </div>

        <div className="row">

          {/* Left Column - Payment Summary & Methods */}
          <div className="col-lg-8">

            {/* Payment Summary Card */}
            <div className="card border-0 mb-4" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    1
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                    Payment Summary
                  </h4>
                </div>

                <div className="p-3" style={{
                  background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                  borderRadius: "12px"
                }}>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Grand Total</span>
                    <span className="fw-bold" style={{ fontSize: "18px", color: "#0b3aa0" }}>
                      Rs. {orderData.grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted">Advance Payment (50%)</span>
                    <span className="fw-bold text-primary" style={{ fontSize: "18px" }}>
                      Rs. {advanceAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span className="text-muted">Balance Payment (50%)</span>
                    <span className="fw-bold text-success" style={{ fontSize: "18px" }}>
                      Rs. {balanceAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <small className="text-muted d-block mt-2">
                  *Payable before production/shipping
                </small>
              </div>
            </div>

           
          </div>

          {/* Right Column - Enhanced Payment Card */}
          <div className="col-lg-4">
            <div
              className="p-4"
              style={{
                background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "35px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <h3 className="text-white fw-bold mb-4">Payment Method</h3>

              {/* Credit Card */}
              <div
                className={`card mb-3 ${formData.paymentMethod === "Credit Card" ? "border-primary border-3" : ""}`}
                style={{ cursor: "pointer", background: formData.paymentMethod === "Credit Card" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)" }}
                onClick={() => {
                  setFormData({ ...formData, paymentMethod: "Credit Card" });
                  setSelectedPayment("credit");
                }}
              >
                <div className="card-body d-flex align-items-center">
                  <CreditCard size={28} className="text-primary me-3" />
                  <div>
                    <h6 className="fw-bold mb-0">Credit Card</h6>
                    <small className="text-muted">Pay with credit card</small>
                  </div>
                  {formData.paymentMethod === "Credit Card" && (
                    <CheckLg className="ms-auto text-primary" size={20} />
                  )}
                </div>
              </div>

              {/* Debit Card */}
              <div
                className={`card mb-3 ${formData.paymentMethod === "Debit Card" ? "border-primary border-3" : ""}`}
                style={{ cursor: "pointer", background: formData.paymentMethod === "Debit Card" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)" }}
                onClick={() => {
                  setFormData({ ...formData, paymentMethod: "Debit Card" });
                  setSelectedPayment("debit");
                }}
              >
                <div className="card-body d-flex align-items-center">
                  <CreditCard size={28} className="text-primary me-3" />
                  <div>
                    <h6 className="fw-bold mb-0">Debit Card</h6>
                    <small className="text-muted">Pay using Visa / MasterCard</small>
                  </div>
                  {formData.paymentMethod === "Debit Card" && (
                    <CheckLg className="ms-auto text-primary" size={20} />
                  )}
                </div>
              </div>

              {/* Bank Deposit */}
              <div
                className={`card mb-3 ${formData.paymentMethod === "Bank Deposit" ? "border-primary border-3" : ""}`}
                style={{ cursor: "pointer", background: formData.paymentMethod === "Bank Deposit" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)" }}
                onClick={() => {
                  setFormData({ ...formData, paymentMethod: "Bank Deposit" });
                  setSelectedPayment("deposit");
                }}
              >
                <div className="card-body d-flex align-items-center">
                  <Building size={28} className="text-success me-3" />
                  <div>
                    <h6 className="fw-bold mb-0">Bank Deposit</h6>
                    <small className="text-muted">Pay via bank transfer</small>
                  </div>
                  {formData.paymentMethod === "Bank Deposit" && (
                    <CheckLg className="ms-auto text-success" size={20} />
                  )}
                </div>
              </div>

              

              {/* CARD DETAILS */}
              {(formData.paymentMethod === "Credit Card" || formData.paymentMethod === "Debit Card") && (
                <>
                  <h3 className="text-white fw-bold mb-3">Card Details</h3>

                  {/* Card Number */}
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <CreditCard />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="**** **** **** ****"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "").substring(0, 16);
                        value = value.replace(/(.{4})/g, "$1 ");
                        setFormData({
                          ...formData,
                          cardNumber: value.trim(),
                        });
                      }}
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="row">
                    <div className="col-8">
                      <div className="input-group mb-3">
                        <span className="input-group-text">
                          <Calendar />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "").substring(0, 4);
                            if (value.length > 2) {
                              value = value.substring(0, 2) + "/" + value.substring(2);
                            }
                            setFormData({
                              ...formData,
                              expiry: value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="input-group mb-3">
                        <span className="input-group-text">
                          <Lock />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="CVV"
                          maxLength="3"
                          value={formData.cvv}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cvv: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* BANK DETAILS */}
              {formData.paymentMethod === "Bank Deposit" && (
                <>
                  <h3 className="text-white fw-bold mb-3">Bank Details</h3>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <Building />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Bank Name"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <CreditCard />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Account Number"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <Upload />
                    </span>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}

              
              <div className="d-flex justify-content-between text-white mb-3">
                <h4 className="fw-bold">ADVANCE</h4>
                <h2 className="fw-bold">Rs. {advanceAmount.toFixed(2)}</h2>
              </div>

              <button
                className="btn btn-light fw-bold w-100 rounded-pill py-3"
                onClick={handlePayment}
                disabled={!formData.paymentMethod}
                style={{ opacity: formData.paymentMethod ? 1 : 0.6 }}
              >
                PAY NOW
              </button>
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
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            ← Back
          </button>
          <button
            className="btn px-5 py-2 fw-bold"
            style={{
              background: selectedPayment || formData.paymentMethod
                ? "linear-gradient(45deg, #0b3aa0, #1a6bff)" 
                : "#ccc",
              color: selectedPayment || formData.paymentMethod ? "white" : "#999",
              borderRadius: "30px",
              border: "none",
              boxShadow: selectedPayment || formData.paymentMethod
                ? "0 4px 25px rgba(11, 58, 160, 0.4)" 
                : "none",
              transition: "all 0.3s ease",
              cursor: selectedPayment || formData.paymentMethod ? "pointer" : "not-allowed"
            }}
            onClick={handleConfirmPayment}
            disabled={!selectedPayment && !formData.paymentMethod}
            onMouseEnter={(e) => {
              if (selectedPayment || formData.paymentMethod) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPayment || formData.paymentMethod) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            Confirm & Pay
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

          .btn:hover {
            transform: scale(1.05);
          }

          .alert {
            animation: fadeIn 0.5s ease;
          }

          .input-group-text {
            background: rgba(255,255,255,0.9);
            border: none;
          }

          .form-control {
            border: none;
            background: rgba(255,255,255,0.9);
          }

          .form-control:focus {
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