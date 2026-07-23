// src/pages/OrderStep1.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import denimImage from "../assets/denim.jpg.png";
import shirtImage from "../assets/shirt.jpg.png";
import tshirtImage from "../assets/tshirt.jpg.png";
import hoodieImage from "../assets/hoodie.jpg.png";
import {
  IconShirt,
  IconShirtSport,
  IconJacket,
  IconHanger2,
  IconDeviceFloppy,
  IconX,
  IconArrowRight,
  IconCheck,
  IconFlame,
  IconLeaf,
  IconShieldCheck,
  IconCrown,
  IconWeight,
  IconTarget,
  IconClipboardList,
  IconLoader2,
} from "@tabler/icons-react";

// Brand palette — swap these to re-theme the whole page.
const C = {
  plum900: "#190019",
  plum800: "#2B124C",
  plum700: "#522B5B",
  mauve500: "#854F6C",
  pink200: "#DFB6B2",
  cream100: "#FBE4D8",
};

// Which fabrics and colors are valid for each garment type.
// Swap GARMENTS for an API call (e.g. GET /api/products) once the backend is wired up.
const COLORS = {
  navy: { label: "Navy Blue", hex: "#1e3a5f" },
  black: { label: "Black", hex: "#212121" },
  gray: { label: "Gray", hex: "#757575" },
  white: { label: "White", hex: "#ffffff" },
  red: { label: "Red", hex: "#f44336" },
  green: { label: "Green", hex: "#4CAF50" },
  yellow: { label: "Yellow", hex: "#FFEB3B" },
};

// Small icon shown next to each fabric's tag (Eco, Durable, Premium...).
const TAG_ICONS = {
  Eco: IconLeaf,
  Standard: IconShieldCheck,
  Durable: IconShieldCheck,
  Premium: IconCrown,
  Heavy: IconWeight,
  Warm: IconFlame,
};

const GARMENTS = [
  {
    id: 1,
    name: "Denim",
    Icon: IconHanger2,
    image: denimImage,
    price: 1600,
    stock: 350,
    popular: false,
    category: "Casual",
    fabrics: [
      { id: "blend", label: "Cotton Blend", tag: "Standard", delta: 0 },
      { id: "poly", label: "Polyester", tag: "Durable", delta: 100 },
      { id: "denim", label: "Denim", tag: "Heavy", delta: 250 },
    ],
    colors: ["navy", "black", "gray", "white"],
  },
  {
    id: 2,
    name: "Shirt",
    Icon: IconShirtSport,
    image: shirtImage,
    price: 1350,
    stock: 300,
    popular: false,
    category: "Semi-Formal",
    fabrics: [
      { id: "cotton", label: "100% Cotton", tag: "Eco", delta: 0 },
      { id: "blend", label: "Cotton Blend", tag: "Standard", delta: 80 },
      { id: "poly", label: "Polyester", tag: "Durable", delta: 130 },
    ],
    colors: ["white", "navy", "black", "red", "green"],
  },
  {
    id: 3,
    name: "T-Shirt",
    Icon: IconShirt,
    image: tshirtImage,
    price: 1200,
    stock: 500,
    popular: true,
    category: "Casual",
    fabrics: [
      { id: "cotton", label: "100% Cotton", tag: "Eco", delta: 0 },
      { id: "blend", label: "Cotton Blend", tag: "Standard", delta: 100 },
      { id: "poly", label: "Polyester", tag: "Durable", delta: 150 },
    ],
    colors: ["navy", "black", "gray", "white", "red", "green", "yellow"],
  },
  {
    id: 4,
    name: "Hoodie",
    Icon: IconJacket,
    image: hoodieImage,
    price: 2100,
    stock: 150,
    popular: true,
    category: "Casual",
    fabrics: [
      { id: "blend", label: "Cotton Blend", tag: "Standard", delta: 0 },
      { id: "poly", label: "Polyester", tag: "Durable", delta: 100 },
      { id: "fleece", label: "Fleece", tag: "Warm", delta: 220 },
    ],
    colors: ["black", "gray", "navy", "red"],
  },
];

function formatPrice(amount) {
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}

// Popup shown when a garment card is clicked. Keeps its own draft
// fabric/color state so Cancel discards changes instead of touching
// the confirmed selection shown in the order summary.
function GarmentModal({ garment, onCancel, onConfirm }) {
  const [fabricId, setFabricId] = useState(null);
  const [colorId, setColorId] = useState(null);

  const fabric = garment.fabrics.find((f) => f.id === fabricId) || null;
  const color = colorId ? COLORS[colorId] : null;
  const unitPrice = garment.price + (fabric?.delta || 0);
  const canConfirm = Boolean(fabric && color);
  const GarmentIcon = garment.Icon;

  return (
    <motion.div
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(25,0,25,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1050,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="card admin-content-card border-0"
        style={{
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(25,0,25,0.32)",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center"
          style={{
            background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`,
            color: C.cream100,
            padding: 18,
            borderRadius: "20px 20px 0 0",
            position: "sticky",
            top: 0,
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {garment.image ? (
                <img
                  src={garment.image}
                  alt={garment.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <GarmentIcon size={20} stroke={1.75} />
              )}
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{garment.name}</div>
              <div style={{ fontSize: 12, color: C.pink200 }}>
                Choose fabric and color
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: C.cream100,
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconX size={18} stroke={1.75} />
          </button>
        </div>

        <div className="p-4">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Fabric</div>
          <div className="row g-2 mb-4">
            {garment.fabrics.map((f) => {
              const TagIcon = TAG_ICONS[f.tag] || IconShieldCheck;
              const selected = fabricId === f.id;
              return (
                <div className="col-4" key={f.id}>
                  <div
                    onClick={() => {
                      setFabricId(f.id);
                      setColorId(null);
                    }}
                    style={{
                      cursor: "pointer",
                      borderRadius: 12,
                      border: `1.5px solid ${selected ? C.plum700 : "#f0e3dd"}`,
                      background: selected ? C.cream100 : "#fff",
                      padding: "10px 8px",
                      textAlign: "center",
                      transition: "all .15s ease",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.plum900 }}>
                      {f.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: C.plum700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <TagIcon size={12} stroke={2} />
                      {f.tag}
                      {f.delta ? ` · +${formatPrice(f.delta)}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Color</div>
          {!fabric ? (
            <p style={{ fontSize: 13, color: C.mauve500 }}>Select a fabric first.</p>
          ) : (
            <div className="d-flex flex-wrap gap-3 mb-4">
              {garment.colors.map((cid) => {
                const c = COLORS[cid];
                const selected = colorId === cid;
                return (
                  <div
                    key={cid}
                    onClick={() => setColorId(cid)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: c.hex,
                        border: `2px solid ${selected ? C.plum700 : "#f0e3dd"}`,
                        boxShadow: selected ? `0 0 0 3px ${C.pink200}` : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected && (
                        <IconCheck
                          size={14}
                          stroke={3}
                          color={c.hex === "#ffffff" ? C.plum900 : "#fff"}
                        />
                      )}
                    </span>
                    <span style={{ fontSize: 11, color: C.plum700 }}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div
            className="d-flex justify-content-between align-items-center mb-3"
            style={{
              background: C.cream100,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12.5,
              color: C.plum700,
            }}
          >
            <span className="d-flex align-items-center gap-2">
              {color ? (
                <>
                  <IconCheck size={14} stroke={2.5} /> In stock · {garment.stock}+ pieces
                </>
              ) : (
                "Select a fabric and color"
              )}
            </span>
            {fabric && (
              <strong style={{ color: C.plum800, fontSize: 14 }}>
                {formatPrice(unitPrice)}
              </strong>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn flex-fill"
              style={{
                border: `1.5px solid ${C.mauve500}`,
                color: C.plum700,
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                padding: "11px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => onConfirm({ fabric, color, colorId, unitPrice })}
              className="btn flex-fill"
              style={{
                background: canConfirm ? C.plum900 : "#d8cdd4",
                color: canConfirm ? C.cream100 : "#8f8690",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                padding: "11px",
              }}
            >
              Add to order
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function OrderStep1() {
  const navigate = useNavigate();

  const [modalGarmentId, setModalGarmentId] = useState(null);
  const [confirmed, setConfirmed] = useState(null); // { garment, fabric, color, unitPrice }
  const [isLoading, setIsLoading] = useState(false);

  const modalGarment = GARMENTS.find((g) => g.id === modalGarmentId) || null;

  function handleConfirm({ fabric, color, unitPrice }) {
    const garment = GARMENTS.find((g) => g.id === modalGarmentId);
    setConfirmed({ garment, fabric, color, unitPrice });
    setModalGarmentId(null);
  }

  function handleNext() {
    if (!confirmed) return;
    setIsLoading(true);
    const existingDraft = JSON.parse(
      localStorage.getItem("clothCoreOrderDraft") || "{}"
    );
    const draft = {
      ...existingDraft,
      garment: confirmed.garment.name,
      fabric: confirmed.fabric.label,
      color: confirmed.color.label,
      unitPrice: confirmed.unitPrice,
    };
    localStorage.setItem("clothCoreOrderDraft", JSON.stringify(draft));

    setTimeout(() => {
      setIsLoading(false);
      navigate("/step2");
    }, 1500);
  }

  return (
    <ShopOwnerLayout
      shellStyle={{ background: C.cream100 }}
      contentClassName="container py-4"
      contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
    >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3"
          >
            <div>
              <h1 className="fw-bold d-flex align-items-center flex-wrap" style={{ fontSize: "2.2rem" }}>
                <span
                  style={{
                    background: C.plum900,
                    padding: "5px 20px",
                    borderRadius: "10px",
                    color: C.cream100,
                    marginRight: "15px",
                    fontSize: "1.1rem",
                  }}
                >
                  Step 1
                </span>
                <span style={{ color: C.plum900 }}>Product & Material Selection</span>
              </h1>
              <p className="mt-2 d-flex align-items-center gap-2" style={{ fontSize: "1.1rem", color: C.plum700 }}>
                <IconTarget size={18} stroke={1.75} /> Choose your garment, fabric, and
                color to get started
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn px-4 py-2 d-flex align-items-center gap-2"
              style={{
                background: "#fff",
                color: C.plum700,
                borderRadius: "25px",
                fontWeight: "bold",
                border: `1.5px solid ${C.mauve500}`,
              }}
            >
              <IconDeviceFloppy size={17} stroke={1.75} /> Save Progress
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
                className="card admin-content-card mb-4 border-0"
                style={{ borderRadius: "20px", boxShadow: "0 10px 40px rgba(25,0,25,0.08)" }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <span
                      className="me-3 d-flex align-items-center justify-content-center"
                      style={{
                        background: C.plum800,
                        width: 36,
                        height: 36,
                        borderRadius: "12px",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      1
                    </span>
                    <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                      Select Garment Type
                    </h4>
                    <span className="ms-3 badge bg-light text-dark">Choose one</span>
                  </div>

                  <div className="row g-3">
                    {GARMENTS.map((g) => {
                      const selected = confirmed?.garment.id === g.id;
                      return (
                        <motion.div
                          key={g.id}
                          className="col-6"
                          whileHover={{ y: -6 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div
                            className="h-100"
                            style={{
                              cursor: "pointer",
                              borderRadius: "22px",
                              border: `2px solid ${selected ? C.plum700 : "rgba(25,0,25,0.08)"}`,
                              background: "white",
                              transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                              boxShadow: selected
                                ? `0 16px 40px rgba(82,43,91,0.28)`
                                : "0 6px 20px rgba(25,0,25,0.07)",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onClick={() => setModalGarmentId(g.id)}
                          >
                            {/* Photo */}
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                aspectRatio: "4 / 5",
                                overflow: "hidden",
                                background: C.cream100,
                              }}
                            >
                              {g.image ? (
                                <img
                                  src={g.image}
                                  alt={g.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "top center",
                                  }}
                                />
                              ) : (
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: "100%", height: "100%", color: C.mauve500 }}
                                >
                                  <g.Icon size={54} stroke={1.25} />
                                </div>
                              )}

                              {/* Gradient wash so the label reads over any photo */}
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background:
                                    "linear-gradient(to top, rgba(25,0,25,0.82) 0%, rgba(25,0,25,0.28) 40%, rgba(25,0,25,0) 62%)",
                                }}
                              />

                              {g.popular && (
                                <div
                                  className="d-flex align-items-center gap-1"
                                  style={{
                                    position: "absolute",
                                    top: "12px",
                                    right: "12px",
                                    background: C.pink200,
                                    color: C.plum800,
                                    padding: "3px 11px",
                                    borderRadius: "20px",
                                    fontSize: "10.5px",
                                    fontWeight: "bold",
                                    letterSpacing: "0.03em",
                                  }}
                                >
                                  <IconFlame size={11} stroke={2} /> POPULAR
                                </div>
                              )}

                              {selected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="d-flex align-items-center justify-content-center"
                                  style={{
                                    position: "absolute",
                                    top: "12px",
                                    left: "12px",
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    background: C.plum700,
                                    color: C.cream100,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                  }}
                                >
                                  <IconCheck size={16} stroke={3} />
                                </motion.div>
                              )}

                              <div
                                style={{
                                  position: "absolute",
                                  left: 16,
                                  right: 16,
                                  bottom: 14,
                                }}
                              >
                                <h5
                                  className="fw-bold mb-0"
                                  style={{
                                    color: "#fff",
                                    fontSize: "1.15rem",
                                    letterSpacing: "0.01em",
                                    textShadow: "0 2px 10px rgba(0,0,0,0.45)",
                                  }}
                                >
                                  {g.name}
                                </h5>
                                <small style={{ color: C.pink200, fontSize: 11.5 }}>
                                  {g.category}
                                </small>
                              </div>
                            </div>

                            {/* Info footer */}
                            <div className="p-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <span
                                  className="badge"
                                  style={{
                                    background: "#e8f5e9",
                                    color: "#1f7a44",
                                    padding: "5px 12px",
                                    borderRadius: "20px",
                                    fontWeight: 600,
                                    fontSize: 11,
                                  }}
                                >
                                  IN STOCK
                                </span>
                                <strong style={{ color: C.plum800, fontSize: "16px" }}>
                                  {formatPrice(g.price)}
                                  <span style={{ color: C.mauve500, fontWeight: 500, fontSize: 12 }}>
                                    {" "}/ unit
                                  </span>
                                </strong>
                              </div>
                              {selected && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="d-flex align-items-center gap-1 mt-2"
                                  style={{ color: C.plum700, fontWeight: 700, fontSize: 12 }}
                                >
                                  <IconCheck size={14} stroke={2.5} /> Selected
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="mb-0 mt-2" style={{ fontSize: 12.5, color: C.mauve500 }}>
                    Tap a garment to choose its fabric and color in a popup.
                  </p>
                </div>
              </motion.div>

              {/* Bottom Status Bar (moved up under garment card) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div
                  className="card admin-content-card border-0"
                  style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(25,0,25,0.06)" }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            background: confirmed ? "#e8f5e9" : "#f1eeee",
                            color: confirmed ? "#1f7a44" : C.mauve500,
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            marginRight: "15px",
                          }}
                        >
                          <IconCheck size={20} stroke={2} />
                        </div>
                        <div>
                          {confirmed ? (
                            <>
                              <strong style={{ color: "#1f7a44" }}>
                                Great! {confirmed.garment.name} in {confirmed.fabric.label},{" "}
                                {confirmed.color.label} is in stock.
                              </strong>
                              <div className="text-muted small">
                                Available Quantity:{" "}
                                <span className="fw-bold">{confirmed.garment.stock}+ pcs</span>
                              </div>
                            </>
                          ) : (
                            <strong style={{ color: C.plum700 }}>
                              Select a garment above to see stock and pricing.
                            </strong>
                          )}
                        </div>
                      </div>
                      {confirmed && (
                        <div className="text-end mt-2 mt-md-0">
                          <small className="text-muted">Unit Price</small>
                          <h6 className="fw-bold mb-0" style={{ color: C.plum800 }}>
                            {formatPrice(confirmed.unitPrice)}
                          </h6>
                        </div>
                      )}
                    </div>
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
                <div
                  className="card admin-content-card border-0"
                  style={{ borderRadius: "20px", boxShadow: "0 10px 40px rgba(25,0,25,0.12)", overflow: "hidden" }}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`,
                      padding: "20px",
                      color: C.cream100,
                    }}
                  >
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <IconClipboardList size={18} stroke={1.75} /> Order Summary
                    </h5>
                    <small style={{ color: C.pink200 }}>Review your selections</small>
                  </div>

                  <div className="card-body p-4">
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">Garment</small>
                        <span className="fw-bold" style={{ color: C.plum900 }}>
                          {confirmed ? confirmed.garment.name : "Not selected"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">Fabric</small>
                        <span className="fw-bold" style={{ color: C.plum900 }}>
                          {confirmed ? confirmed.fabric.label : "Not selected"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Color</small>
                        <div className="d-flex align-items-center">
                          {confirmed && (
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: confirmed.color.hex,
                                marginRight: "8px",
                                border:
                                  confirmed.color.hex === "#ffffff" ? "2px solid #ccc" : "none",
                              }}
                            />
                          )}
                          <span className="fw-bold" style={{ color: C.plum900 }}>
                            {confirmed ? confirmed.color.label : "Not selected"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div className="mb-3">
                      <small className="text-muted">Unit Price</small>
                      <h3 className="fw-bold mb-0" style={{ color: C.plum800 }}>
                        {formatPrice(confirmed ? confirmed.unitPrice : 0)}
                      </h3>
                    </div>

                    {confirmed && (
                      <div
                        className="alert border-0"
                        style={{ borderRadius: "12px", background: C.cream100, padding: "12px 15px" }}
                      >
                        <div className="d-flex align-items-center">
                          <span
                            className="d-flex align-items-center justify-content-center me-2"
                            style={{ color: "#1f7a44" }}
                          >
                            <IconCheck size={20} stroke={2} />
                          </span>
                          <div>
                            <strong style={{ color: C.plum800 }}>In Stock</strong>
                            <div className="small" style={{ color: C.plum700 }}>
                              Available: {confirmed.garment.stock}+ pieces
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: confirmed && !isLoading ? 1.02 : 1 }}
                      whileTap={{ scale: confirmed && !isLoading ? 0.98 : 1 }}
                      className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: confirmed
                          ? `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`
                          : "#d8cdd4",
                        color: confirmed ? C.cream100 : "#8f8690",
                        borderRadius: "14px",
                        border: "none",
                        fontSize: "18px",
                      }}
                      onClick={handleNext}
                      disabled={!confirmed || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <IconLoader2 size={18} className="pms-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          Next: Design <IconArrowRight size={18} stroke={2} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

      <AnimatePresence>
        {modalGarment && (
          <GarmentModal
            garment={modalGarment}
            onCancel={() => setModalGarmentId(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>

      <style>{`
        .pms-spin { animation: pms-spin 0.8s linear infinite; }
        @keyframes pms-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </ShopOwnerLayout>
  );
}

export default OrderStep1;