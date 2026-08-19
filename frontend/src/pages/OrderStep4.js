
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import OrderStepHeader from "../components/order/OrderStepHeader";
import OrderNavButtons from "../components/order/OrderNavButtons";
import GarmentDesignPreview from "../components/order/GarmentDesignPreview";
import { ORDER_COLORS as C } from "../utils/orderTheme";
import { getBusinessRules } from "../utils/businessRules";
import "../styles/orderFlow.css";
import { IconFileText, IconSparkles, IconBuildingStore } from "@tabler/icons-react";

function OrderStep4() {
  const navigate = useNavigate();

  const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
  const [advancePercent, setAdvancePercent] = useState(50);

  useEffect(() => {
    getBusinessRules().then((rules) => setAdvancePercent(rules.advancePaymentPercentage));
  }, []);

  const hasRequiredFields =
    draft.garment &&
    draft.fabric &&
    draft.color &&
    typeof draft.unitPrice === "number" &&
    draft.sizes &&
    typeof draft.totalQuantity === "number" &&
    draft.totalQuantity > 0;

  const cardStyle = {
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(25,0,25,0.08)",
    background: "#fff",
  };

  if (!hasRequiredFields) {
    return (
      <ShopOwnerLayout
        contentClassName="container py-4 order-flow-page"
        contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
        shellStyle={{ background: C.cream100 }}
      >
            <div
              className="card border-0 text-center p-5"
              style={cardStyle}
            >
              <h4 className="fw-bold mb-3" style={{ color: C.plum900 }}>
                Please complete the previous steps first
              </h4>
              <p className="mb-4" style={{ color: C.mauve500 }}>
                We couldn't find a complete order draft. Start again from Step 1 to
                select your garment, fabric, color, and quantities.
              </p>
              <button
                className="btn px-5 py-2 fw-bold mx-auto cc-pill-cta"
                style={{
                  background: `linear-gradient(45deg, ${C.plum700}, ${C.mauve500})`,
                  color: "white",
                  borderRadius: "30px",
                  border: "none",
                  maxWidth: "220px"
                }}
                onClick={() => navigate("/step1")}
              >
                Go to Step 1
              </button>
            </div>
      </ShopOwnerLayout>
    );
  }

  const totalQuantity = draft.totalQuantity;
  // Total Order Cost — no Discount, no Tax. The backend recomputes this
  // exact same figure (and the 50/50 split below) independently at order
  // creation time and never trusts a frontend-submitted amount — this
  // display is a preview of that same formula, not the source of truth.
  const totalOrderCost = draft.unitPrice * draft.totalQuantity;
  const advancePayment = Math.round((totalOrderCost * advancePercent) / 100 * 100) / 100;
  const remainingBalance = Math.round((totalOrderCost - advancePayment) * 100) / 100;

  const design = draft.design;

  return (
  <ShopOwnerLayout
    contentClassName="order-flow-page"
    contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
    shellStyle={{ background: C.cream100 }}
  >

      <div className="container py-4">

        <OrderStepHeader
          stepIndex={4}
          title="Review Your Order"
          subtitle="Check everything over before choosing a delivery date."
        />

        <div className="row">

          {/* Left Column - Order Summary & Design */}
          <div className="col-lg-7">

            {/* Order Summary Card */}
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

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="small d-block" style={{ color: C.mauve500 }}>Garment Type</label>
                    <p className="fw-bold mb-0" style={{ color: C.plum900 }}>{draft.garment}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="small d-block" style={{ color: C.mauve500 }}>Fabric / Material</label>
                    <p className="fw-bold mb-0" style={{ color: C.plum900 }}>{draft.fabric}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="small d-block" style={{ color: C.mauve500 }}>Color</label>
                    <p className="fw-bold mb-0" style={{ color: C.plum900 }}>{draft.color}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="small d-block" style={{ color: C.mauve500 }}>Unit Price</label>
                    <p className="fw-bold mb-0" style={{ color: C.plum700 }}>
                      Rs. {draft.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="small d-block" style={{ color: C.mauve500 }}>Total Quantity</label>
                    <p className="fw-bold mb-0" style={{ color: C.plum900 }}>{totalQuantity} pcs</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="small d-block" style={{ color: C.mauve500 }}>Total Order Cost</label>
                    <p className="fw-bold mb-0" style={{ color: "#1f7a44" }}>
                      Rs. {totalOrderCost.toFixed(2)}
                    </p>
                  </div>
                  {draft.designNotes && (
                    <div className="col-12">
                      <label className="small d-block" style={{ color: C.mauve500 }}>Design Notes</label>
                      <p className="mb-0" style={{ color: C.plum900 }}>{draft.designNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Design Preview Card */}
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
                    2
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                    Design Preview
                  </h4>
                </div>

                {design?.designSource === "ai_generated" ? (
                  <div className="text-center">
                    <img
                      src={design.generatedDesignPath}
                      alt={`AI generated design: ${design.prompt}`}
                      style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 12, marginBottom: 10 }}
                    />
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <IconSparkles size={15} stroke={2} color={C.mauve500} />
                      <small className="fw-bold" style={{ color: C.plum700 }}>Design Type: AI Generated</small>
                    </div>
                  </div>
                ) : design?.designSource === "uploaded_logo" ? (
                  <div>
                    <GarmentDesignPreview
                      garmentName={draft.garment}
                      colorLabel={draft.color}
                      colorHex={draft.colorHex}
                      logoPath={design.uploadedLogoPath}
                      height={220}
                    />
                    <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                      {design.uploadedLogoSource === "shop_logo" ? (
                        <IconBuildingStore size={15} stroke={2} color={C.mauve500} />
                      ) : (
                        <IconFileText size={15} stroke={2} color={C.mauve500} />
                      )}
                      <small className="fw-bold" style={{ color: C.plum700 }}>Design Type: Uploaded Logo</small>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4" style={{
                    background: C.cream100,
                    borderRadius: "16px",
                  }}>
                    <div style={{ fontSize: "64px", marginBottom: "10px" }}>👕</div>
                    <p className="mb-0" style={{ color: C.plum800 }}>{draft.garment} Design</p>
                    <small style={{ color: C.mauve500 }}>No design was selected for this order.</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Size Breakdown & Price */}
          <div className="col-lg-5">

            {/* Size Breakdown Card */}
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
                    3
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                    Size Breakdown
                  </h4>
                </div>

                <div className="order-table-wrap">
                  <table className="order-table" style={{ textAlign: "center" }}>
                    <thead>
                      <tr>
                        <th>Size</th>
                        {Object.keys(draft.sizes).map((size) => (
                          <th key={size}>{size}</th>
                        ))}
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold">Quantity (pcs)</td>
                        {Object.values(draft.sizes).map((qty, index) => (
                          <td key={index}>{qty}</td>
                        ))}
                        <td className="fw-bold" style={{
                          background: "rgba(82,43,91,0.08)",
                          color: C.plum700
                        }}>
                          {totalQuantity}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Price Calculation Card */}
            <div className="card border-0" style={{ ...cardStyle, boxShadow: "0 10px 40px rgba(25,0,25,0.12)" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`,
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    4
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                    Price Calculation
                  </h4>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Total Quantity</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>{totalQuantity} pcs</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(82,43,91,0.1)" }}>
                    <span style={{ color: C.mauve500 }}>Unit Price</span>
                    <span className="fw-bold" style={{ color: C.plum900 }}>Rs. {draft.unitPrice.toFixed(2)}</span>
                  </div>
                </div>

                <hr style={{ borderColor: C.mauve500, borderWidth: "1.5px", opacity: 0.3 }} />

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: C.plum900 }}>Total Order Cost</h5>
                  <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                    Rs. {totalOrderCost.toFixed(2)}
                  </h4>
                </div>

                <div
                  className="p-3 mb-2"
                  style={{ borderRadius: 14, background: "rgba(31,122,68,0.08)", border: "1px solid rgba(31,122,68,0.2)" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ color: "#1f7a44", fontWeight: 600, fontSize: 13.5 }}>
                      Advance Payment Required ({advancePercent}%)
                    </span>
                    <span className="fw-bold" style={{ color: "#1f7a44", fontSize: 16 }}>
                      Rs. {advancePayment.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div
                  className="p-3"
                  style={{ borderRadius: 14, background: "rgba(82,43,91,0.06)", border: "1px solid rgba(82,43,91,0.15)" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ color: C.plum700, fontWeight: 600, fontSize: 13.5 }}>
                      Remaining Balance ({100 - advancePercent}%)
                    </span>
                    <span className="fw-bold" style={{ color: C.plum700, fontSize: 16 }}>
                      Rs. {remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="mb-0 mt-3" style={{ fontSize: 12, color: C.mauve500 }}>
                  The {advancePercent}% advance is required to confirm your order; the remaining balance can be paid any time afterward, whenever you're ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        <OrderNavButtons
          nextLabel="Next: Estimate Delivery"
          onBack={() => navigate("/step3")}
          onNext={() => navigate("/order-delivery")}
        />

      </div>
  </ShopOwnerLayout>
  );
}

export default OrderStep4;
