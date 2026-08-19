import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import OrderStepHeader from "../components/order/OrderStepHeader";
import OrderNavButtons from "../components/order/OrderNavButtons";
import { ORDER_COLORS as C } from "../utils/orderTheme";
import "../styles/orderFlow.css";
import { IconTruck, IconClock, IconLock } from "@tabler/icons-react";

function OrderDelivery() {
  const navigate = useNavigate();

  const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");

  // Once this draft has a real orderId, it's already been submitted for
  // approval — delivery details can no longer be changed from here. See
  // the matching comment in OrderStep1.js.
  const isLocked = Boolean(draft.orderId);

  const [deliveryDate, setDeliveryDate] = useState(draft.deliveryDate || "");
  const [address, setAddress] = useState(
    draft.deliveryAddress || "No. 123, Main Street, Colombo 05, Sri Lanka"
  );
  const [error, setError] = useState("");

  // Production needs lead time — a delivery date can't be sooner than 20
  // days out from today.
  const MINIMUM_LEAD_DAYS = 20;
  const minDeliveryDate = new Date();
  minDeliveryDate.setDate(minDeliveryDate.getDate() + MINIMUM_LEAD_DAYS);
  const minDeliveryDateStr = minDeliveryDate.toISOString().split("T")[0];

  const cardStyle = {
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(25,0,25,0.08)",
    background: "#fff",
  };

  const inputStyle = {
    borderRadius: "12px",
    padding: "12px 15px",
    border: "1.5px solid rgba(82,43,91,0.18)",
    fontSize: "15px",
    background: "#fff",
    color: C.plum900,
  };

  const handleNext = () => {
    if (!deliveryDate) {
      setError("Please choose a delivery date.");
      return;
    }
    if (deliveryDate < minDeliveryDateStr) {
      setError(`Delivery date must be at least ${MINIMUM_LEAD_DAYS} days from today.`);
      return;
    }
    setError("");
    const updatedDraft = {
      ...draft,
      deliveryDate,
      deliveryAddress: address.trim(),
      // Factory Delivery is the only delivery method in the system now —
      // there is nothing left to select.
      deliveryMethod: "Factory Delivery",
    };
    localStorage.setItem("clothCoreOrderDraft", JSON.stringify(updatedDraft));
    navigate("/order-approval");
  };

  return (
    <ShopOwnerLayout
      contentClassName="order-flow-page"
      contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
      shellStyle={{ background: C.cream100 }}
    >
        <div className="container py-4">
          <OrderStepHeader
            stepIndex={5}
            title="Delivery Information"
            subtitle="Choose a delivery date for your order."
          />

          {isLocked && (
            <div
              className="d-flex align-items-center gap-3 p-3 mb-4"
              style={{ background: "rgba(217,155,168,0.16)", border: `1.5px solid ${C.mauve500}`, borderRadius: 16 }}
              role="status"
            >
              <span
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", color: C.plum700 }}
              >
                <IconLock size={20} stroke={1.75} />
              </span>
              <div>
                <div className="fw-bold" style={{ color: C.plum900, fontSize: 14 }}>
                  This order has already been submitted
                </div>
                <div style={{ color: C.mauve500, fontSize: 12.5 }}>
                  Delivery details can no longer be changed here. Use "Place New Order" on the Approval page to start a separate order.
                </div>
              </div>
            </div>
          )}

          {/* The "Orders So Far" recap box that used to live in a right-hand
              column here has been removed entirely (UI only — saved order
              data is untouched; the same selections still show on Step 4
              Review and the Admin Approval step). Delivery details now use
              the full width instead of leaving an empty second column. */}
          <div className="row justify-content-center">
            <div className="col-lg-9">
              {/* Delivery Date */}
              <div className="card border-0 mb-4" style={cardStyle}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3" style={{ color: C.plum900 }}>
                    Delivery Date
                  </h5>
                  <input
                    type="date"
                    className="form-control"
                    name="deliveryDate"
                    min={minDeliveryDateStr}
                    value={deliveryDate}
                    onChange={(e) => {
                      setDeliveryDate(e.target.value);
                      setError("");
                    }}
                    disabled={isLocked}
                    style={{ ...inputStyle, ...(isLocked ? { background: C.cream100, cursor: "not-allowed" } : {}) }}
                  />
                  {error && (
                    <div className="mt-2" style={{ color: "#b3261e", fontSize: "13px", fontWeight: 600 }}>
                      {error}
                    </div>
                  )}
                  <small className="d-block mt-2" style={{ color: C.mauve500 }}>
                    Pick the date you'd like your order delivered by — at least {MINIMUM_LEAD_DAYS} days from today, to
                    give production enough time.
                  </small>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card border-0 mb-4" style={cardStyle}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3" style={{ color: C.plum900 }}>
                    Delivery Address
                  </h5>
                  <textarea
                    className="form-control"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="3"
                    disabled={isLocked}
                    style={{ ...inputStyle, resize: "vertical", ...(isLocked ? { background: C.cream100, cursor: "not-allowed" } : {}) }}
                  />
                </div>
              </div>

              {/* Delivery Method — fixed, non-interactive. Factory Delivery
                  is the only method the system supports; there is no
                  dropdown, radio group, or multiple cards to choose from. */}
              <div className="card border-0 mb-4" style={cardStyle}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3" style={{ color: C.plum900 }}>
                    Delivery Method
                  </h5>
                  <div
                    className="d-flex align-items-center gap-3 p-3"
                    style={{ background: C.cream100, borderRadius: 14, border: "1px solid rgba(82,43,91,0.12)" }}
                  >
                    <span
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", color: C.plum700 }}
                    >
                      <IconTruck size={22} stroke={1.75} />
                    </span>
                    <div>
                      <div className="fw-bold" style={{ color: C.plum900, fontSize: 15 }}>Factory Delivery</div>
                      <div className="d-flex align-items-center gap-1 mt-1" style={{ color: "#1a56db", fontSize: 13, fontWeight: 700 }}>
                        <IconClock size={14} stroke={2} /> Delivered within 20–24 days
                      </div>
                    </div>
                  </div>
                  <small className="d-block mt-2" style={{ color: C.mauve500 }}>
                    Every order ships directly from the factory. Admin/Supervisor will see this when scheduling delivery.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <OrderNavButtons
            nextLabel="Next: Approval"
            onBack={() => navigate("/step4")}
            onNext={handleNext}
          />
        </div>
    </ShopOwnerLayout>
  );
}

export default OrderDelivery;
