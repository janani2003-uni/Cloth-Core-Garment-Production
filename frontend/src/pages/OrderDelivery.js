import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";

function OrderDelivery() {
  const navigate = useNavigate();

  const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");

  const [deliveryDate, setDeliveryDate] = useState(draft.deliveryDate || "");
  const [address, setAddress] = useState(
    "No. 123, Main Street, Colombo 05, Sri Lanka"
  );
  const [deliveryMethod, setDeliveryMethod] = useState("Factory Delivery");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleNext = () => {
    if (!deliveryDate) {
      setError("Please choose a delivery date.");
      return;
    }
    if (deliveryDate <= today) {
      setError("Delivery date must be in the future.");
      return;
    }
    setError("");
    const updatedDraft = { ...draft, deliveryDate };
    localStorage.setItem("clothCoreOrderDraft", JSON.stringify(updatedDraft));
    navigate("/step5");
  };

  return (
    <ShopOwnerLayout contentClassName="" contentStyle={{ padding: "20px" }}>
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
                Step 5
              </span>
              <span style={{ color: "#dfb6b2" }}>
                Delivery Information
              </span>
            </h1>
            <p className="text-muted mt-2" style={{ fontSize: "1.1rem" }}>
              Choose a delivery date for your order
            </p>
          </div>

          <div className="row">
            {/* Left Column - Delivery Details */}
            <div className="col-lg-7">
              {/* Delivery Date */}
              <div className="card admin-content-card border-0 mb-4" style={{
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #522b5b, #854f6c)",
                      fontSize: "1rem",
                      padding: "6px 15px",
                      borderRadius: "10px",
                      color: "white"
                    }}>
                      📅
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                      Delivery Date
                    </h5>
                  </div>
                  <input
                    type="date"
                    className="form-control"
                    name="deliveryDate"
                    min={today}
                    value={deliveryDate}
                    onChange={(e) => {
                      setDeliveryDate(e.target.value);
                      setError("");
                    }}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 15px",
                      border: "2px solid #e0e0e0",
                      fontSize: "16px"
                    }}
                  />
                  {error && (
                    <div className="mt-2" style={{ color: "#d1495b", fontSize: "13px", fontWeight: 600 }}>
                      {error}
                    </div>
                  )}
                  <small className="text-muted d-block mt-2">
                    Pick the date you'd like your order delivered by.
                  </small>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card admin-content-card border-0 mb-4" style={{
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #522b5b, #854f6c)",
                      fontSize: "1rem",
                      padding: "6px 15px",
                      borderRadius: "10px",
                      color: "white"
                    }}>
                      📍
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                      Delivery Address
                    </h5>
                  </div>
                  <textarea
                    className="form-control"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="3"
                    style={{
                      borderRadius: "12px",
                      padding: "12px 15px",
                      border: "2px solid #e0e0e0",
                      fontSize: "16px",
                      resize: "vertical"
                    }}
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div className="card admin-content-card border-0 mb-4" style={{
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #522b5b, #854f6c)",
                      fontSize: "1rem",
                      padding: "6px 15px",
                      borderRadius: "10px",
                      color: "white"
                    }}>
                      🚚
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                      Delivery Method
                    </h5>
                  </div>
                  <select
                    className="form-select"
                    name="deliveryMethod"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 15px",
                      border: "2px solid #e0e0e0",
                      fontSize: "16px"
                    }}
                  >
                    <option value="Factory Delivery">Factory Delivery</option>
                    <option value="Home Delivery">Home Delivery</option>
                    <option value="Pickup Point">Pickup Point</option>
                    <option value="Courier Service">Courier Service</option>
                  </select>
                  <small className="text-muted d-block mt-2">
                    Delivery method and address are for reference only and are not
                    yet sent to the backend.
                  </small>
                </div>
              </div>
            </div>

            {/* Right Column - Order Recap */}
            <div className="col-lg-5">
              <div className="card admin-content-card border-0 mb-4" style={{
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)"
              }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3" style={{ color: "#dfb6b2" }}>
                    Order So Far
                  </h5>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <span className="text-muted">Garment</span>
                    <span className="fw-bold">{draft.garment || "—"}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <span className="text-muted">Fabric</span>
                    <span className="fw-bold">{draft.fabric || "—"}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <span className="text-muted">Color</span>
                    <span className="fw-bold">{draft.color || "—"}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Total Quantity</span>
                    <span className="fw-bold">
                      {draft.totalQuantity ? `${draft.totalQuantity} pcs` : "—"}
                    </span>
                  </div>
                  <small className="text-muted d-block mt-3 text-center">
                    Delivery timelines are agreed with the factory directly; there is
                    no automated estimate yet.
                  </small>
                </div>
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
              onClick={() => navigate("/step4")}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              ← Back
            </button>
            <button
              className="btn px-5 py-2 fw-bold"
              style={{
                background: "linear-gradient(45deg, #522b5b, #854f6c)",
                color: "white",
                borderRadius: "30px",
                border: "none",
                boxShadow: "0 4px 25px rgba(82, 43, 91, 0.4)",
                transition: "all 0.3s ease"
              }}
              onClick={handleNext}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Next: Review Order →
            </button>
          </div>
        </div>
    </ShopOwnerLayout>
  );
}

export default OrderDelivery;
