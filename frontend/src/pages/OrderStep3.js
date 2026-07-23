
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import { getBusinessRules } from "../utils/businessRules";

function OrderStep3() {
  const navigate = useNavigate();

  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(100);

  useEffect(() => {
    getBusinessRules().then((rules) => setMinimumOrderQuantity(rules.minimumOrderQuantity));
  }, []);

  const [quantities, setQuantities] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  });

  const [sizeChart, setSizeChart] = useState({
    unit: "inches" // or "cm"
  });

  const sizeData = [
    { size: "S", chest: 36, length: 26, shoulder: 16, sleeve: 7.5, available: 150 },
    { size: "M", chest: 38, length: 27, shoulder: 17, sleeve: 8, available: 200 },
    { size: "L", chest: 40, length: 28, shoulder: 18, sleeve: 8.5, available: 180 },
    { size: "XL", chest: 42, length: 29, shoulder: 19, sleeve: 9, available: 120 },
    { size: "XXL", chest: 44, length: 30, shoulder: 20, sleeve: 9.5, available: 80 }
  ];

  const handleQuantityChange = (size, value) => {
    const newValue = parseInt(value) || 0;
    setQuantities({
      ...quantities,
      [size]: newValue
    });
  };

  const handleIncrement = (size) => {
    setQuantities({
      ...quantities,
      [size]: quantities[size] + 1
    });
  };

  const handleDecrement = (size) => {
    if (quantities[size] > 0) {
      setQuantities({
        ...quantities,
        [size]: quantities[size] - 1
      });
    }
  };

  const totalQuantity = Object.values(quantities).reduce((sum, val) => sum + val, 0);
  const isMinimumMet = totalQuantity >= minimumOrderQuantity;






  
return (
  <ShopOwnerLayout contentClassName="" contentStyle={{ padding: "20px" }}>
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
              Step 3
            </span>
            <span style={{ color: "#dfb6b2" }}>
              Quantities & Size Breakdown
            </span>
          </h1>
          <p className="text-muted mt-2" style={{ fontSize: "1.1rem" }}>
            📊 Select quantities for each size
          </p>
        </div>

        {/* Size Chart Section */}
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
                Size Chart ({sizeChart.unit})
              </h4>
            </div>

            {/* Unit Toggle */}
            <div className="d-flex gap-2 mb-3">
              <button
                className="btn btn-sm px-4"
                style={{
                  background: sizeChart.unit === "cm" ? "#522b5b" : "#e9ecef",
                  color: sizeChart.unit === "cm" ? "white" : "#333",
                  borderRadius: "8px",
                  fontWeight: "bold"
                }}
                onClick={() =>
                  setSizeChart((prev) => ({
                    ...prev,
                    unit: "cm"
                  }))
                }
              >
                cm
              </button>
              <button
                className="btn btn-sm px-4"
                style={{
                  background: sizeChart.unit === "inches" ? "#522b5b" : "#e9ecef",
                  color: sizeChart.unit === "inches" ? "white" : "#333",
                  borderRadius: "8px",
                  fontWeight: "bold"
                }}
                onClick={() =>
                  setSizeChart((prev) => ({
                    ...prev,
                    unit: "inches"
                  }))
                }
              >
                In
              </button>
            </div>

            <h6 className="fw-bold mb-3" style={{ color: "#dfb6b2" }}>
              T-Shirt Size Chart (Unisex)
            </h6>

            <div className="table-responsive">
              <table className="table table-hover admin-table table-bordered" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <thead style={{ background: "linear-gradient(135deg, #522b5b, #854f6c)", color: "white" }}>
                  <tr>
                    <th style={{ padding: "12px 15px" }}>Size</th>
                    <th style={{ padding: "12px 15px" }}>Chest</th>
                    <th style={{ padding: "12px 15px" }}>Length</th>
                    <th style={{ padding: "12px 15px" }}>Shoulder</th>
                    <th style={{ padding: "12px 15px" }}>Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((item) => (
                    <tr key={item.size} style={{ transition: "all 0.3s ease" }}>
                      <td className="fw-bold" style={{ padding: "10px 15px" }}>{item.size}</td>
                      <td style={{ padding: "10px 15px" }}>
                        {sizeChart.unit === "inches"
                          ? item.chest + '"'
                          : (item.chest * 2.54).toFixed(1) + " cm"}
                      </td>
                      <td style={{ padding: "10px 15px" }}>
                        {sizeChart.unit === "inches"
                          ? item.length + '"'
                          : (item.length * 2.54).toFixed(1) + " cm"}
                      </td>
                      <td style={{ padding: "10px 15px" }}>
                        {sizeChart.unit === "inches"
                          ? item.shoulder + '"'
                          : (item.shoulder * 2.54).toFixed(1) + " cm"}
                      </td>
                      <td style={{ padding: "10px 15px" }}>
                        {sizeChart.unit === "inches"
                          ? item.sleeve + '"'
                          : (item.sleeve * 2.54).toFixed(1) + " cm"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <small className="text-muted d-block mt-2">
              * Measurements may vary by ±0.5 inch
            </small>
          </div>
        </div>

        {/* Quantities Section */}
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
                2
              </span>
              <h4 className="fw-bold mb-0" style={{ color: "#dfb6b2" }}>
                Enter Quantities by Size
              </h4>
            </div>

            <div className="alert alert-info py-2 px-3 mb-4" style={{ borderRadius: "10px", background: "#e3f2fd", border: "none" }}>
              <small className="text-primary fw-bold">
                ⚠️ Minimum total quantity is {minimumOrderQuantity} pcs
              </small>
            </div>

            <div className="table-responsive">
              <table className="table admin-table table-bordered" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <thead style={{ background: "linear-gradient(135deg, #2b124c, #522b5b)", color: "white" }}>
                  <tr>
                    <th style={{ padding: "12px 15px" }}>Size</th>
                    <th style={{ padding: "12px 15px" }}>Quantity (pcs)</th>
                    <th style={{ padding: "12px 15px" }}>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((item) => (
                    <tr key={item.size}>
                      <td className="fw-bold" style={{ padding: "10px 15px", verticalAlign: "middle" }}>
                        {item.size}
                      </td>
                      <td style={{ padding: "10px 15px", verticalAlign: "middle" }}>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm px-3"
                            onClick={() => handleDecrement(item.size)}
                            style={{ borderRadius: "8px", fontWeight: "bold" }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            style={{ 
                              width: "70px", 
                              borderRadius: "8px",
                              fontWeight: "bold"
                            }}
                            value={quantities[item.size]}
                            onChange={(e) => handleQuantityChange(item.size, e.target.value)}
                            min="0"
                          />
                          <button
                            className="btn btn-outline-primary btn-sm px-3"
                            onClick={() => handleIncrement(item.size)}
                            style={{ borderRadius: "8px", fontWeight: "bold" }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "10px 15px", verticalAlign: "middle" }}>
                        <span className="badge" style={{ 
                          background: "#1a9c5f",
                          color: "white",
                          padding: "5px 12px"
                        }}>
                          {item.available}+
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Quantity */}
            <div className="mt-3 p-3" style={{
              borderRadius: "12px",
              background: isMinimumMet ? "linear-gradient(135deg, #e8f5e9, #c8e6c9)" : "linear-gradient(135deg, #fff3e0, #ffe0b2)",
              border: isMinimumMet ? "2px solid #1a9c5f" : "2px solid #d98324"
            }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h5 className="fw-bold mb-0">
                    Total Quantity
                  </h5>
                  <span className="fw-bold" style={{ fontSize: "24px", color: isMinimumMet ? "#12633f" : "#a3600e" }}>
                    {totalQuantity} pcs
                  </span>
                </div>
                <div>
                  {isMinimumMet ? (
                    <span className="badge" style={{
                      background: "#1a9c5f",
                      color: "white",
                      padding: "8px 20px",
                      fontSize: "14px"
                    }}>
                      ✅ Minimum requirement met
                    </span>
                  ) : (
                    <span className="badge" style={{
                      background: "#d98324",
                      color: "white",
                      padding: "8px 20px",
                      fontSize: "14px"
                    }}>
                      ⚠️ Need {minimumOrderQuantity - totalQuantity} more pcs
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <small className="text-muted">
                ⚡ Stocks are updated in real-time. Quantities shown are available.
              </small>
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
            onClick={() => navigate("/step2")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            ← Back
          </button>
          <button
            className="btn px-5 py-2 fw-bold"
            style={{
              background: isMinimumMet 
                ? "linear-gradient(45deg, #522b5b, #854f6c)" 
                : "#ccc",
              color: isMinimumMet ? "white" : "#999",
              borderRadius: "30px",
              border: "none",
              boxShadow: isMinimumMet ? "0 4px 25px rgba(11, 58, 160, 0.4)" : "none",
              transition: "all 0.3s ease",
              cursor: isMinimumMet ? "pointer" : "not-allowed"
            }}
            onClick={() => {
              if (isMinimumMet) {
                const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
                localStorage.setItem(
                  "clothCoreOrderDraft",
                  JSON.stringify({ ...draft, sizes: quantities, totalQuantity })
                );
                navigate("/step4");
              }
            }}
            disabled={!isMinimumMet}
            onMouseEnter={(e) => {
              if (isMinimumMet) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (isMinimumMet) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            Next: Review →
          </button>
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

          table tr:hover {
            background: #f8f9fa;
          }

          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          input[type="number"] {
            -moz-appearance: textfield;
          }

          .btn-sm {
            font-size: 16px;
            padding: 4px 12px;
          }

          .table-bordered {
            border: 2px solid #dee2e6;
          }

          .table-bordered td,
          .table-bordered th {
            border: 2px solid #dee2e6;
          }
        `}
      </style>
  </ShopOwnerLayout>
  );
}

export default OrderStep3;