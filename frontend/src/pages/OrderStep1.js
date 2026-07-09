// src/pages/OrderStep1.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar"; // ✅ Correct import path

function OrderStep1() {
  const navigate = useNavigate();

  const [selectedGarment, setSelectedGarment] = useState("School Uniform");
  const [selectedFabric, setSelectedFabric] = useState("Lycra");
  const [selectedColor, setSelectedColor] = useState("Yellow");
  const [isLoading, setIsLoading] = useState(false);

  const garments = [
    { id: 1, name: "T-Shirt", price: 1200, icon: "👕", stock: 500, popular: true, category: "Casual" },
    { id: 2, name: "Trouser", price: 1600, icon: "👖", stock: 350, popular: false, category: "Formal" },
    { id: 3, name: "School Uniform", price: 1800, icon: "🎒", stock: 200, popular: true, category: "Uniform" },
    { id: 4, name: "Hoodie", price: 2100, icon: "🧥", stock: 150, popular: true, category: "Casual" },
    { id: 5, name: "Polo Shirt", price: 1350, icon: "👔", stock: 300, popular: false, category: "Semi-Formal" }
  ];

  const fabrics = [
    { id: 1, name: "100% Cotton", icon: "🌿", quality: "Premium", sustainable: true },
    { id: 2, name: "Cotton Blend", icon: "🧵", quality: "Standard", sustainable: false },
    { id: 3, name: "Polyester", icon: "🧶", quality: "Durable", sustainable: false },
    { id: 4, name: "Lycra", icon: "💨", quality: "Premium", sustainable: false }
  ];

  const colors = [
    { name: "Navy Blue", hex: "#1a237e", light: "#e8eaf6" },
    { name: "Black", hex: "#212121", light: "#f5f5f5" },
    { name: "Gray", hex: "#757575", light: "#f5f5f5" },
    { name: "White", hex: "#ffffff", light: "#ffffff" },
    { name: "Red", hex: "#f44336", light: "#ffebee" },
    { name: "Green", hex: "#4CAF50", light: "#e8f5e9" },
    { name: "Yellow", hex: "#FFEB3B", light: "#fffde7" }
  ];

  const currentItem = garments.find((g) => g.name === selectedGarment) || garments[0];

  const handleNext = () => {
    setIsLoading(true);
    const orderData = {
      garment: selectedGarment,
      fabric: selectedFabric,
      color: selectedColor,
      price: currentItem.price,
      item: currentItem
    };
    localStorage.setItem('orderStep1Data', JSON.stringify(orderData));
    
    setTimeout(() => {
      setIsLoading(false);
      navigate("/step2");
    }, 1500);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Sidebar />
      <div className="flex-grow-1" style={{ padding: "20px" }}>
        <div className="container py-4">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="d-flex justify-content-between align-items-center mb-4"
          >
            <div>
              <h1 className="fw-bold" style={{ fontSize: "2.2rem" }}>
                <span style={{ 
                  background: "linear-gradient(45deg, #f2a100, #ff6f00)",
                  padding: "5px 20px",
                  borderRadius: "10px",
                  color: "white",
                  marginRight: "15px"
                }}>
                  Step 1
                </span>
                <span style={{ color: "#0b3aa0" }}>
                  Product & Material Selection
                </span>
              </h1>
              <p className="text-muted mt-2" style={{ fontSize: "1.1rem" }}>
                🎯 Choose your garment, fabric, and color to get started
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn px-4 py-2" 
              style={{ 
                background: "linear-gradient(45deg, #f2a100, #ff6f00)",
                color: "white",
                borderRadius: "25px",
                fontWeight: "bold",
                border: "none",
                boxShadow: "0 4px 15px rgba(242, 161, 0, 0.4)"
              }}
            >
              💾 Save Progress
            </motion.button>
          </motion.div>

          <div className="row">
            {/* Left Section - Selection Options */}
            <div className="col-lg-8">
              {/* Garment Selection */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="card mb-4 border-0"
                style={{ 
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
                }}
              >
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
                      Select Garment Type
                    </h4>
                    <span className="ms-3 badge bg-light text-dark">Choose one</span>
                  </div>

                  <div className="row">
                    {garments.map((g) => (
                      <motion.div 
                        key={g.id} 
                        className="col-md-4 mb-3"
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div
                          className="card h-100"
                          style={{
                            cursor: "pointer",
                            borderRadius: "16px",
                            border: selectedGarment === g.name 
                              ? "3px solid #0b3aa0" 
                              : "2px solid #e0e0e0",
                            background: selectedGarment === g.name 
                              ? "linear-gradient(135deg, #e3f2fd, #bbdefb)" 
                              : "white",
                            transition: "all 0.3s ease",
                            boxShadow: selectedGarment === g.name 
                              ? "0 8px 30px rgba(11, 58, 160, 0.2)" 
                              : "none",
                            transform: selectedGarment === g.name ? "scale(1.02)" : "scale(1)",
                            position: "relative",
                            overflow: "hidden"
                          }}
                          onClick={() => setSelectedGarment(g.name)}
                        >
                          {g.popular && (
                            <div style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              background: "linear-gradient(45deg, #ff6b6b, #ff4757)",
                              color: "white",
                              padding: "2px 12px",
                              borderRadius: "12px",
                              fontSize: "10px",
                              fontWeight: "bold"
                            }}>
                              POPULAR
                            </div>
                          )}
                          <div className="card-body text-center p-3">
                            <div style={{ fontSize: "40px" }}>{g.icon}</div>
                            <h6 className="fw-bold mt-2 mb-1">{g.name}</h6>
                            <span className="badge mb-2" style={{ 
                              background: "linear-gradient(45deg, #4CAF50, #66BB6A)",
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "20px"
                            }}>
                              IN STOCK
                            </span>
                            <p className="mb-0" style={{ 
                              color: "#0b3aa0",
                              fontWeight: "bold",
                              fontSize: "15px"
                            }}>
                              Rs. {g.price.toLocaleString()} / unit
                            </p>
                            {selectedGarment === g.name && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-2"
                              >
                                <span className="badge bg-primary" style={{ padding: "5px 15px" }}>
                                  ✓ Selected
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Fabric Selection */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card mb-4 border-0"
                style={{ 
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      fontSize: "1.2rem",
                      padding: "8px 18px",
                      borderRadius: "12px",
                      color: "white"
                    }}>
                      2
                    </span>
                    <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                      Select Fabric
                    </h4>
                    <span className="ms-3 badge bg-light text-dark">Choose one</span>
                  </div>

                  <div className="row">
                    {fabrics.map((f) => (
                      <motion.div 
                        key={f.id} 
                        className="col-md-3 mb-3"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div
                          className="card text-center"
                          style={{
                            cursor: "pointer",
                            borderRadius: "14px",
                            border: selectedFabric === f.name 
                              ? "3px solid #0b3aa0" 
                              : "2px solid #e0e0e0",
                            background: selectedFabric === f.name 
                              ? "linear-gradient(135deg, #fff3e0, #ffe0b2)" 
                              : "white",
                            transition: "all 0.3s ease",
                            boxShadow: selectedFabric === f.name 
                              ? "0 8px 25px rgba(11, 58, 160, 0.15)" 
                              : "none"
                          }}
                          onClick={() => setSelectedFabric(f.name)}
                        >
                          <div className="card-body p-3">
                            <div style={{ fontSize: "30px" }}>{f.icon}</div>
                            <h6 className="fw-bold mt-2 mb-1" style={{ fontSize: "14px" }}>
                              {f.name}
                            </h6>
                            <span className="badge" style={{
                              background: f.sustainable ? "#4CAF50" : "#FF9800",
                              fontSize: "10px",
                              padding: "2px 10px"
                            }}>
                              {f.sustainable ? "♻️ Eco" : f.quality}
                            </span>
                            {selectedFabric === f.name && (
                              <div className="mt-1">
                                <span style={{ color: "#4CAF50", fontWeight: "bold" }}>✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Color Selection */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card border-0"
                style={{ 
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <span className="badge me-3" style={{
                      background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                      fontSize: "1.2rem",
                      padding: "8px 18px",
                      borderRadius: "12px",
                      color: "white"
                    }}>
                      3
                    </span>
                    <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                      Select Color
                    </h4>
                    <span className="ms-3 badge bg-light text-dark">Choose one</span>
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    {colors.map((c) => (
                      <motion.div
                        key={c.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(c.name)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "12px 20px",
                          borderRadius: "16px",
                          background: selectedColor === c.name 
                            ? `linear-gradient(135deg, ${c.light}, #e0e0e0)` 
                            : "transparent",
                          border: selectedColor === c.name 
                            ? "3px solid #0b3aa0" 
                            : "2px solid transparent",
                          transition: "all 0.3s ease",
                          minWidth: "70px"
                        }}
                      >
                        <div
                          style={{
                            width: 45,
                            height: 45,
                            borderRadius: "50%",
                            background: c.hex,
                            border: c.name === "White" ? "2px solid #ccc" : "none",
                            boxShadow: selectedColor === c.name 
                              ? "0 4px 25px rgba(11, 58, 160, 0.4)" 
                              : "0 2px 10px rgba(0,0,0,0.1)",
                            transition: "all 0.3s ease"
                          }}
                        />
                        <span className="mt-2" style={{ 
                          fontSize: "12px",
                          fontWeight: selectedColor === c.name ? "bold" : "normal",
                          color: selectedColor === c.name ? "#0b3aa0" : "#666"
                        }}>
                          {c.name}
                        </span>
                        {selectedColor === c.name && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              fontSize: "10px",
                              color: "#4CAF50",
                              fontWeight: "bold"
                            }}
                          >
                            ✓ Selected
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Section - Order Summary */}
            <div className="col-lg-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="position-sticky"
                style={{ top: "20px" }}
              >
                <div className="card border-0" style={{ 
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                  overflow: "hidden"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    padding: "20px",
                    color: "white"
                  }}>
                    <h5 className="fw-bold mb-0">
                      📋 Order Summary
                    </h5>
                    <small className="opacity-75">Review your selections</small>
                  </div>

                  <div className="card-body p-4">
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">Garment</small>
                        <span className="fw-bold" style={{ color: "#0b3aa0" }}>
                          {selectedGarment}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">Fabric</small>
                        <span className="fw-bold">{selectedFabric}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Color</small>
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: colors.find(c => c.name === selectedColor)?.hex || "#000",
                              marginRight: "8px",
                              border: selectedColor === "White" ? "2px solid #ccc" : "none"
                            }}
                          />
                          <span className="fw-bold">{selectedColor}</span>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div className="mb-3">
                      <small className="text-muted">Unit Price</small>
                      <h3 className="fw-bold text-primary mb-0">
                        Rs. {currentItem.price.toLocaleString()}
                      </h3>
                    </div>

                    <div className="alert alert-success" style={{
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
                      border: "none",
                      padding: "12px 15px"
                    }}>
                      <div className="d-flex align-items-center">
                        <span style={{ fontSize: "20px", marginRight: "10px" }}>✅</span>
                        <div>
                          <strong>In Stock</strong>
                          <div className="small">Available: 500+ pieces</div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn w-100 py-3 fw-bold"
                      style={{
                        background: "linear-gradient(45deg, #0b3aa0, #1a6bff)",
                        color: "white",
                        borderRadius: "14px",
                        border: "none",
                        boxShadow: "0 4px 25px rgba(11, 58, 160, 0.3)",
                        fontSize: "18px",
                        transition: "all 0.3s ease"
                      }}
                      onClick={handleNext}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Processing...
                        </>
                      ) : (
                        "Next: Design →"
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4"
          >
            <div className="card border-0" style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff, #f8f9fa)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
            }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex align-items-center">
                    <div style={{
                      background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
                      padding: "8px 15px",
                      borderRadius: "10px",
                      marginRight: "15px"
                    }}>
                      <span style={{ fontSize: "20px" }}>✅</span>
                    </div>
                    <div>
                      <strong className="text-success">Great! This product is in stock.</strong>
                      <div className="text-muted small">
                        Available Quantity: <span className="fw-bold">500+ pcs</span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mt-2 mt-md-0">
                    <div className="text-end">
                      <small className="text-muted">Unit Price</small>
                      <h6 className="text-primary fw-bold mb-0">
                        Rs. {currentItem.price.toLocaleString()}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default OrderStep1;