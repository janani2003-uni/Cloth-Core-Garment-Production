
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import OrderStepHeader from "../components/order/OrderStepHeader";
import OrderNavButtons from "../components/order/OrderNavButtons";
import InlineStockWarning from "../components/order/InlineStockWarning";
import { ORDER_COLORS as C } from "../utils/orderTheme";
import "../styles/orderFlow.css";
import { getBusinessRules } from "../utils/businessRules";
import { IconCheck, IconAlertTriangle, IconMinus, IconPlus, IconLock } from "@tabler/icons-react";

const SIZE_MEASUREMENTS = {
  S: { chest: 36, length: 26, shoulder: 16, sleeve: 7.5 },
  M: { chest: 38, length: 27, shoulder: 17, sleeve: 8 },
  L: { chest: 40, length: 28, shoulder: 18, sleeve: 8.5 },
  XL: { chest: 42, length: 29, shoulder: 19, sleeve: 9 },
  XXL: { chest: 44, length: 30, shoulder: 20, sleeve: 9.5 },
};
const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];

function OrderStep3() {
  const navigate = useNavigate();
  const rowRefs = useRef({});

  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(100);
  const [garmentType, setGarmentType] = useState("");

  // Once this draft has a real orderId, it's already been submitted for
  // approval — quantities can no longer be changed from here. See the
  // matching comment in OrderStep1.js.
  const isLocked = Boolean(
    JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}").orderId
  );

  useEffect(() => {
    getBusinessRules().then((rules) => setMinimumOrderQuantity(rules.minimumOrderQuantity));
    const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
    setGarmentType(draft.garment || "");
  }, []);

  // Restores previously-saved size quantities (Back-navigating here to
  // review an existing order) instead of always starting at all zeros.
  const [quantities, setQuantities] = useState(() => {
    const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
    if (draft.sizes && typeof draft.sizes === "object") {
      return { S: 0, M: 0, L: 0, XL: 0, XXL: 0, ...draft.sizes };
    }
    return { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  });
  const [stockBySize, setStockBySize] = useState({});
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState("");
  const [rowWarnings, setRowWarnings] = useState({});
  const [invalidRows, setInvalidRows] = useState([]);
  const [validationSummary, setValidationSummary] = useState("");

  const [sizeChart, setSizeChart] = useState({ unit: "inches" });

  const loadStock = useCallback(() => {
    if (!garmentType) return;
    setStockLoading(true);
    setStockError("");
    axios
      .get("http://localhost:5000/api/garment-stock", { params: { garmentType } })
      .then((res) => {
        const bySize = {};
        (res.data?.data || []).forEach((entry) => {
          bySize[entry.size.toUpperCase()] = entry.availableQuantity;
        });
        setStockBySize(bySize);
      })
      .catch(() => {
        setStockError("Could not load live stock. Please refresh the page.");
      })
      .finally(() => setStockLoading(false));
  }, [garmentType]);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const sizeData = SIZE_ORDER.map((size) => ({
    size,
    ...SIZE_MEASUREMENTS[size],
    available: stockBySize[size] ?? 0,
  }));

  function showRowWarning(size, message) {
    setRowWarnings((prev) => ({ ...prev, [size]: message }));
  }

  function clearRowWarning(size) {
    setRowWarnings((prev) => {
      if (!(size in prev)) return prev;
      const next = { ...prev };
      delete next[size];
      return next;
    });
  }

  function setSizeQuantity(size, rawValue) {
    const max = stockBySize[size] ?? 0;
    let value = Number.isFinite(rawValue) ? Math.trunc(rawValue) : 0;

    if (value < 0) value = 0;

    if (value > max) {
      value = max;
      showRowWarning(size, `Only ${max} pieces are available for size ${size}.`);
    } else {
      clearRowWarning(size);
    }

    setQuantities((prev) => ({ ...prev, [size]: value }));
    setInvalidRows((prev) => prev.filter((s) => s !== size));
    setValidationSummary("");
  }

  const handleQuantityChange = (size, rawInputValue) => {
    if (rawInputValue === "") {
      setSizeQuantity(size, 0);
      return;
    }
    // Reject anything that isn't a whole number (blocks "1.5", "-3", "e", etc.
    // beyond what type="number" already screens out on most browsers).
    if (!/^\d+$/.test(rawInputValue)) return;
    setSizeQuantity(size, parseInt(rawInputValue, 10));
  };

  const handleIncrement = (size) => {
    setSizeQuantity(size, (quantities[size] || 0) + 1);
  };

  const handleDecrement = (size) => {
    if (quantities[size] > 0) {
      clearRowWarning(size);
      setQuantities((prev) => ({ ...prev, [size]: prev[size] - 1 }));
    }
  };

  const totalQuantity = Object.values(quantities).reduce((sum, val) => sum + val, 0);
  const isMinimumMet = totalQuantity >= minimumOrderQuantity;
  const progressPercent = Math.min(100, Math.round((totalQuantity / minimumOrderQuantity) * 100) || 0);

  function validateBeforeNext() {
    const overStock = SIZE_ORDER.filter((size) => quantities[size] > (stockBySize[size] ?? 0));
    const negativeOrFractional = SIZE_ORDER.filter(
      (size) => !Number.isInteger(quantities[size]) || quantities[size] < 0
    );
    const invalid = [...new Set([...overStock, ...negativeOrFractional])];

    if (invalid.length > 0) {
      setInvalidRows(invalid);
      setValidationSummary(
        `Please fix the highlighted size${invalid.length > 1 ? "s" : ""} before continuing: ${invalid.join(", ")}.`
      );
      const firstRow = rowRefs.current[invalid[0]];
      if (firstRow) firstRow.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    if (totalQuantity <= 0) {
      setValidationSummary("Please select at least one size with a quantity greater than zero.");
      return false;
    }

    if (!isMinimumMet) {
      setValidationSummary(`Total quantity must be at least ${minimumOrderQuantity} pcs.`);
      return false;
    }

    setInvalidRows([]);
    setValidationSummary("");
    return true;
  }

  const cardStyle = {
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(25,0,25,0.08)",
    background: "#fff",
  };

  return (
  <ShopOwnerLayout
    contentClassName="container py-4 order-flow-page"
    contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
    shellStyle={{ background: C.cream100 }}
  >
        <OrderStepHeader
          stepIndex={3}
          title="Quantities & Size Breakdown"
          subtitle="Select quantities for each size."
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
                Quantities can no longer be changed here. Use "Place New Order" on the Approval page to start a separate order.
              </div>
            </div>
          </div>
        )}

        {/* Size Chart Section */}
        <div className="card border-0 mb-4" style={cardStyle}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
              <div className="d-flex align-items-center">
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
                  Size Chart
                </h4>
              </div>

              {/* Unit Toggle */}
              <div className="order-segmented">
                <button
                  type="button"
                  className={sizeChart.unit === "cm" ? "is-active" : ""}
                  onClick={() => setSizeChart((prev) => ({ ...prev, unit: "cm" }))}
                >
                  cm
                </button>
                <button
                  type="button"
                  className={sizeChart.unit === "inches" ? "is-active" : ""}
                  onClick={() => setSizeChart((prev) => ({ ...prev, unit: "inches" }))}
                >
                  In
                </button>
              </div>
            </div>

            <h6 className="fw-bold mb-3" style={{ color: C.mauve500 }}>
              {garmentType || "Garment"} Size Chart (Unisex)
            </h6>

            <div className="order-table-wrap">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Length</th>
                    <th>Shoulder</th>
                    <th>Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((item) => (
                    <tr key={item.size}>
                      <td className="fw-bold">{item.size}</td>
                      <td>
                        {sizeChart.unit === "inches"
                          ? item.chest + '"'
                          : (item.chest * 2.54).toFixed(1) + " cm"}
                      </td>
                      <td>
                        {sizeChart.unit === "inches"
                          ? item.length + '"'
                          : (item.length * 2.54).toFixed(1) + " cm"}
                      </td>
                      <td>
                        {sizeChart.unit === "inches"
                          ? item.shoulder + '"'
                          : (item.shoulder * 2.54).toFixed(1) + " cm"}
                      </td>
                      <td>
                        {sizeChart.unit === "inches"
                          ? item.sleeve + '"'
                          : (item.sleeve * 2.54).toFixed(1) + " cm"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <small className="d-block mt-2" style={{ color: C.mauve500 }}>
              * Measurements may vary by ±0.5 inch
            </small>
          </div>
        </div>

        {/* Quantities Section */}
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
                Enter Quantities by Size
              </h4>
            </div>

            <div className="order-warning-card mb-4">
              <IconAlertTriangle size={18} stroke={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Minimum total quantity is {minimumOrderQuantity} pcs</span>
            </div>

            {stockError && (
              <div
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#b3261e", fontSize: 13, fontWeight: 600 }}
                role="alert"
              >
                <IconAlertTriangle size={16} stroke={2.5} /> {stockError}
                <button
                  type="button"
                  className="btn btn-sm cc-text-btn"
                  style={{ color: C.plum700, textDecoration: "underline", border: "none", background: "transparent" }}
                  onClick={loadStock}
                >
                  Retry
                </button>
              </div>
            )}

            {validationSummary && (
              <div
                className="d-flex align-items-center gap-2 mb-3"
                style={{
                  background: "rgba(179,38,30,0.08)",
                  border: "1px solid rgba(179,38,30,0.25)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  color: "#b3261e",
                  fontSize: 13,
                  fontWeight: 600,
                }}
                role="alert"
              >
                <IconAlertTriangle size={16} stroke={2.5} style={{ flexShrink: 0 }} /> {validationSummary}
              </div>
            )}

            <div className="order-table-wrap">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Quantity (pcs)</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((item) => {
                    const max = item.available;
                    const isInvalid = invalidRows.includes(item.size);
                    return (
                      <tr
                        key={item.size}
                        ref={(el) => { rowRefs.current[item.size] = el; }}
                        style={isInvalid ? { boxShadow: "inset 3px 0 0 #b3261e", background: "rgba(179,38,30,0.04)" } : undefined}
                      >
                        <td className="fw-bold">{item.size}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="order-qty-btn"
                              onClick={() => handleDecrement(item.size)}
                              disabled={isLocked || quantities[item.size] <= 0}
                              aria-label={`Decrease ${item.size} quantity`}
                            >
                              <IconMinus size={15} stroke={2.5} />
                            </button>
                            <input
                              type="number"
                              className="order-qty-input"
                              value={quantities[item.size]}
                              onChange={(e) => handleQuantityChange(item.size, e.target.value)}
                              min="0"
                              max={max}
                              step="1"
                              disabled={isLocked || stockLoading}
                              aria-label={`${item.size} quantity, maximum ${max}`}
                              aria-invalid={isInvalid}
                            />
                            <button
                              type="button"
                              className="order-qty-btn"
                              onClick={() => handleIncrement(item.size)}
                              disabled={isLocked || stockLoading || quantities[item.size] >= max}
                              aria-label={`Increase ${item.size} quantity`}
                            >
                              <IconPlus size={15} stroke={2.5} />
                            </button>
                          </div>
                          <InlineStockWarning
                            message={rowWarnings[item.size]}
                            onDismiss={() => clearRowWarning(item.size)}
                          />
                        </td>
                        <td>
                          {stockLoading ? (
                            <span style={{ color: C.mauve500, fontSize: 12.5 }}>Loading…</span>
                          ) : (
                            <span className="order-stock-badge">
                              {max} Available
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Quantity summary */}
            <div
              className="mt-4 p-4"
              style={{
                borderRadius: "18px",
                background: `linear-gradient(135deg, ${C.cream100}, #ffffff)`,
                border: `1px solid ${isMinimumMet ? "rgba(31,122,68,0.3)" : "rgba(217,131,36,0.3)"}`,
              }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div>
                  <small className="fw-bold" style={{ color: C.mauve500, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
                    Total Quantity
                  </small>
                  <div className="fw-bold" style={{ fontSize: "28px", color: C.plum900 }}>
                    {totalQuantity} <span style={{ fontSize: 15, color: C.mauve500, fontWeight: 600 }}>pcs</span>
                  </div>
                </div>
                <div className="text-end">
                  <small className="fw-bold d-block" style={{ color: C.mauve500, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
                    Minimum Required
                  </small>
                  <span className="fw-bold" style={{ fontSize: 18, color: C.plum800 }}>
                    {minimumOrderQuantity} pcs
                  </span>
                </div>
              </div>

              <div className="order-progress-bar-track mb-3">
                <div
                  className={`order-progress-bar-fill ${isMinimumMet ? "is-met" : ""}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                {isMinimumMet ? (
                  <span
                    className="d-flex align-items-center gap-2 fw-bold"
                    style={{ background: "rgba(31,122,68,0.12)", color: "#1f7a44", padding: "8px 18px", borderRadius: 20, fontSize: 13.5 }}
                  >
                    <IconCheck size={16} stroke={2.5} /> Minimum requirement met
                  </span>
                ) : (
                  <span
                    className="d-flex align-items-center gap-2 fw-bold"
                    style={{ background: "rgba(217,131,36,0.15)", color: "#a3600e", padding: "8px 18px", borderRadius: 20, fontSize: 13.5 }}
                  >
                    <IconAlertTriangle size={16} stroke={2.5} /> Need {minimumOrderQuantity - totalQuantity} more pcs
                  </span>
                )}
                <small style={{ color: C.mauve500, fontWeight: 600 }}>{progressPercent}% of minimum</small>
              </div>
            </div>

            <div className="mt-3">
              <small style={{ color: C.mauve500 }}>
                Stocks are updated in real-time. Quantities shown are available.
              </small>
            </div>
          </div>
        </div>

        <OrderNavButtons
          nextLabel="Next: Review"
          nextDisabled={!isMinimumMet || stockLoading}
          onBack={() => navigate("/step2")}
          onNext={() => {
            if (!validateBeforeNext()) return;
            const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
            localStorage.setItem(
              "clothCoreOrderDraft",
              JSON.stringify({ ...draft, sizes: quantities, totalQuantity })
            );
            navigate("/step4");
          }}
        />
  </ShopOwnerLayout>
  );
}

export default OrderStep3;
