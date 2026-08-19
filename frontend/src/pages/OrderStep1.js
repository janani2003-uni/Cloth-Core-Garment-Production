// src/pages/OrderStep1.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import OrderStepHeader from "../components/order/OrderStepHeader";
import ConfirmModal from "../components/modals/ConfirmModal";
import { ORDER_COLORS as C } from "../utils/orderTheme";
import "../styles/orderFlow.css";
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
  IconRefresh,
  IconLock,
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
  IconAlertTriangle,
} from "@tabler/icons-react";

// Shared order-flow palette (frontend/src/utils/orderTheme.js) — kept as
// the local alias `C` below so the rest of this file didn't need touching.

const PRODUCTS_API_URL = "http://localhost:5000/api/products";

// The garment catalog (name, fabrics, colors, base price) is backend-driven
// now — GET /api/products (backend/routes/productRoutes.js) — rather than
// the hardcoded GARMENTS array this used to be. These two maps translate a
// product's `imageKey` into the actual bundled photo/icon, since the
// catalog only stores a key, not the asset itself. A garment Admin adds
// later with an unrecognized key just falls back to the generic icon.
const IMAGE_MAP = {
  denim: denimImage,
  shirt: shirtImage,
  tshirt: tshirtImage,
  hoodie: hoodieImage,
};

const ICON_MAP = {
  denim: IconHanger2,
  shirt: IconShirtSport,
  tshirt: IconShirt,
  hoodie: IconJacket,
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
  const color = colorId ? garment.colors.find((c) => c.id === colorId) || null : null;
  const unitPrice = garment.price + (fabric?.delta || 0);
  const canConfirm = Boolean(fabric && color);
  const GarmentIcon = garment.Icon;

  return (
    <motion.div
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, rgba(43,18,76,0.5) 0%, rgba(25,0,25,0.78) 100%)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1050,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="gc-modal-card border-0"
        style={{
          borderRadius: 26,
          width: "100%",
          maxWidth: 500,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 32px 80px rgba(25,0,25,0.35), 0 10px 28px rgba(82,43,91,0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="gc-modal-header d-flex justify-content-between align-items-center"
          style={{
            background: `linear-gradient(135deg, ${C.plum900} 0%, ${C.plum700} 65%, ${C.mauve500} 145%)`,
            color: C.cream100,
            padding: "24px 26px",
            borderRadius: "26px 26px 0 0",
            position: "sticky",
            top: 0,
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 25% -20%, rgba(255,255,255,0.28), transparent 55%)",
              pointerEvents: "none",
            }}
          />
          <div className="d-flex align-items-center gap-3" style={{ position: "relative" }}>
            <span
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {garment.image ? (
                <img
                  src={garment.image}
                  alt={garment.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                />
              ) : (
                <GarmentIcon size={26} stroke={1.75} />
              )}
            </span>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.01em" }}>
                {garment.name}
              </div>
              <div style={{ fontSize: 13, color: C.pink200, marginTop: 2 }}>
                Choose fabric and color
              </div>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            whileHover={{
              scale: 1.08,
              backgroundColor: "rgba(255,255,255,0.26)",
              boxShadow: "0 0 0 8px rgba(255,255,255,0.08)",
            }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              position: "relative",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: C.cream100,
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconX size={18} stroke={1.75} />
          </motion.button>
        </div>

        <div className="gc-modal-body" style={{ padding: "28px 26px 26px" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.plum700,
              marginBottom: 14,
            }}
          >
            Fabric
          </div>
          <div className="row g-3 mb-4">
            {garment.fabrics.map((f) => {
              const TagIcon = TAG_ICONS[f.tag] || IconShieldCheck;
              const selected = fabricId === f.id;
              return (
                <div className="col-4 d-flex" key={f.id}>
                  <motion.div
                    className="gc-fabric-card"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    onClick={() => {
                      setFabricId(f.id);
                      setColorId(null);
                    }}
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      borderRadius: 16,
                      padding: "16px 10px",
                      textAlign: "center",
                      width: "100%",
                      border: "2px solid transparent",
                      backgroundImage: selected
                        ? `linear-gradient(160deg, ${C.cream100}, #ffffff), linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`
                        : `linear-gradient(160deg, #ffffff, #fbf7f5), linear-gradient(160deg, rgba(25,0,25,0.08), rgba(25,0,25,0.08))`,
                      backgroundOrigin: "border-box",
                      backgroundClip: "padding-box, border-box",
                      boxShadow: selected
                        ? "0 12px 28px rgba(82,43,91,0.28), 0 0 0 1px rgba(82,43,91,0.05)"
                        : "0 3px 12px rgba(25,0,25,0.05)",
                      transition: "box-shadow .25s ease",
                    }}
                  >
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`,
                          color: "#fff",
                          boxShadow: "0 4px 10px rgba(82,43,91,0.4)",
                        }}
                      >
                        <IconCheck size={13} stroke={3} />
                      </motion.div>
                    )}
                    <div
                      className="mx-auto d-flex align-items-center justify-content-center"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        marginBottom: 8,
                        background: selected
                          ? `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`
                          : C.cream100,
                        color: selected ? "#fff" : C.mauve500,
                      }}
                    >
                      <TagIcon size={16} stroke={2} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.plum900, lineHeight: 1.25 }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.mauve500, marginTop: 3, lineHeight: 1.3 }}>
                      {f.tag}
                    </div>
                    {f.delta > 0 && (
                      <div
                        style={{
                          display: "inline-block",
                          marginTop: 7,
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: C.plum800,
                          background: C.cream100,
                          borderRadius: 20,
                          padding: "2px 9px",
                        }}
                      >
                        +{formatPrice(f.delta)}
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.plum700,
              marginBottom: 14,
            }}
          >
            Color
          </div>
          {!fabric ? (
            <p style={{ fontSize: 13, color: C.mauve500 }}>Select a fabric first.</p>
          ) : (
            <>
              <div className="d-flex flex-wrap gap-4 mb-3">
                {garment.colors.map((c) => {
                  const cid = c.id;
                  const selected = colorId === cid;
                  return (
                    <motion.div
                      key={cid}
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      onClick={() => setColorId(cid)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <span
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: c.hex,
                          border: `2.5px solid ${selected ? "#fff" : "rgba(25,0,25,0.1)"}`,
                          boxShadow: selected
                            ? `0 0 0 3px ${C.plum700}, 0 8px 20px rgba(82,43,91,0.35)`
                            : "0 2px 8px rgba(25,0,25,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "box-shadow .25s ease",
                        }}
                      >
                        {selected && (
                          <IconCheck
                            size={16}
                            stroke={3}
                            color={c.hex === "#ffffff" ? C.plum900 : "#fff"}
                          />
                        )}
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: selected ? 700 : 500,
                          color: selected ? C.plum900 : C.mauve500,
                        }}
                      >
                        {c.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                {color && (
                  <motion.div
                    key={colorId}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="d-flex align-items-center gap-2 mb-4"
                    style={{ fontSize: 12.5, color: C.plum700, fontWeight: 600 }}
                  >
                    <span
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        background: color.hex,
                        border: "1.5px solid rgba(25,0,25,0.15)",
                      }}
                    />
                    Selected: <strong style={{ color: C.plum900 }}>{color.label}</strong>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div
            style={{
              background: `linear-gradient(135deg, ${C.cream100}, #ffffff)`,
              borderRadius: 18,
              padding: "18px 20px",
              marginBottom: 22,
              border: "1px solid rgba(223,182,178,0.4)",
              boxShadow: "0 4px 16px rgba(25,0,25,0.05)",
            }}
          >
            <span
              className="d-flex align-items-center gap-2"
              style={{ fontSize: 12.5, color: C.plum700, fontWeight: 500 }}
            >
              {color ? (
                <>
                  <IconCheck size={14} stroke={2.5} /> In stock · {garment.stock}+ pieces
                </>
              ) : (
                "Select a fabric and color"
              )}
            </span>
            {fabric && (
              <>
                <div style={{ height: 1, background: "rgba(25,0,25,0.08)", margin: "14px 0 12px" }} />
                <div className="d-flex justify-content-between align-items-end">
                  <small
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: C.mauve500,
                    }}
                  >
                    Unit Price
                  </small>
                  <AnimatePresence mode="wait">
                    <motion.strong
                      key={unitPrice}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.22 }}
                      style={{ color: C.plum900, fontSize: 26, fontWeight: 800 }}
                    >
                      {formatPrice(unitPrice)}
                    </motion.strong>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          <div className="d-flex gap-3">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ backgroundColor: C.mauve500, color: "#ffffff", scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="btn flex-fill"
              style={{
                border: `1.5px solid ${C.mauve500}`,
                color: C.plum700,
                background: "transparent",
                borderRadius: 14,
                fontWeight: 600,
                fontSize: 14,
                padding: "14px",
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              disabled={!canConfirm}
              onClick={() => onConfirm({ fabric, color, colorId, unitPrice })}
              whileHover={canConfirm ? { y: -3, boxShadow: "0 16px 36px rgba(25,0,25,0.4)" } : {}}
              whileTap={canConfirm ? { scale: 0.97 } : {}}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="btn flex-fill"
              style={{
                background: canConfirm
                  ? `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`
                  : "#d8cdd4",
                color: canConfirm ? C.cream100 : "#8f8690",
                border: "none",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 14,
                padding: "14px",
                boxShadow: canConfirm
                  ? "0 10px 26px rgba(25,0,25,0.32), inset 0 1px 0 rgba(255,255,255,0.12)"
                  : "none",
                cursor: canConfirm ? "pointer" : "not-allowed",
              }}
            >
              Add to order
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Restores a previously-saved selection (Back-navigating here to review an
// existing order, or simply resuming a draft) so this step never shows
// blank when the shop owner already picked a garment/fabric/color for it.
// Takes the fetched catalog as a parameter since it's no longer a module-
// level constant — it only exists once GET /api/products has resolved.
function getInitialConfirmed(garments) {
  try {
    const draft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
    if (!draft.garment || !draft.fabric || !draft.color) return null;

    const garment = garments.find((g) => g.name === draft.garment);
    if (!garment) return null;

    const fabric = garment.fabrics.find((f) => f.label === draft.fabric);
    if (!fabric) return null;

    const color = garment.colors.find((c) => c.label === draft.color);
    if (!color) return null;

    return {
      garment,
      fabric,
      color,
      unitPrice: typeof draft.unitPrice === "number" ? draft.unitPrice : garment.price + (fabric.delta || 0),
    };
  } catch {
    return null;
  }
}

function OrderStep1() {
  const navigate = useNavigate();

  // Once this draft has a real orderId (i.e. it's already been submitted
  // for approval — see OrderApproval.js's createOrder()), every step in
  // the wizard becomes a read-only look-back at what was actually
  // submitted, not an editable form — changing the garment/fabric/color
  // here after the fact would silently disagree with the order Admin is
  // reviewing. The only way back to an editable, blank Step 1 is "Place
  // Order" from the sidebar or the "Place New Order" button on the
  // Approval page, both of which clear this before landing here (see
  // goToPlaceOrder() in utils/orderStatus.js).
  const isLocked = Boolean(
    JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}").orderId
  );

  const [garments, setGarments] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [modalGarmentId, setModalGarmentId] = useState(null);
  const [confirmed, setConfirmed] = useState(null); // { garment, fabric, color, unitPrice }
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const loadCatalog = React.useCallback(() => {
    setCatalogLoading(true);
    setCatalogError("");
    axios
      .get(PRODUCTS_API_URL)
      .then((res) => {
        const mapped = (res.data?.data || []).map((p) => ({
          id: p._id,
          name: p.name,
          Icon: ICON_MAP[p.imageKey] || IconHanger2,
          image: IMAGE_MAP[p.imageKey] || null,
          price: p.basePrice,
          stock: p.stockHint ?? 0,
          popular: p.popular,
          category: p.category,
          fabrics: p.fabrics || [],
          colors: p.colors || [],
        }));
        setGarments(mapped);
        setConfirmed((current) => current || getInitialConfirmed(mapped));
      })
      .catch(() => {
        setCatalogError("Could not load the garment catalog. Please try again.");
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const modalGarment = garments.find((g) => g.id === modalGarmentId) || null;

  function handleConfirm({ fabric, color, unitPrice }) {
    const garment = garments.find((g) => g.id === modalGarmentId);
    setConfirmed({ garment, fabric, color, unitPrice });
    setModalGarmentId(null);
  }

  function handleNext() {
    if (!confirmed) return;
    setIsLoading(true);
    const existingDraft = JSON.parse(
      localStorage.getItem("clothCoreOrderDraft") || "{}"
    );

    // If a real order was already created for this draft (existingDraft
    // .orderId, set once Step 6 - Admin Approval - actually submits it) but
    // the garment/fabric/color picked here is now different, this is no
    // longer that same order — clear orderId so later steps create a fresh
    // order for these new selections instead of silently re-showing (or
    // re-approving) the old one. This is exactly what caused "placing
    // another order shows/approves the wrong thing": the old orderId stuck
    // around in the draft and every later step kept reusing it.
    const selectionChanged =
      existingDraft.garment !== confirmed.garment.name ||
      existingDraft.fabric !== confirmed.fabric.label ||
      existingDraft.color !== confirmed.color.label;

    const draft = {
      ...existingDraft,
      garment: confirmed.garment.name,
      fabric: confirmed.fabric.label,
      color: confirmed.color.label,
      colorHex: confirmed.color.hex,
      unitPrice: confirmed.unitPrice,
      ...(selectionChanged ? { orderId: undefined } : {}),
    };
    localStorage.setItem("clothCoreOrderDraft", JSON.stringify(draft));

    setTimeout(() => {
      setIsLoading(false);
      navigate("/step2");
    }, 1500);
  }

  // Clears the selected garment/fabric/color and starts the order over.
  // The whole saved draft is discarded, not just this step's fields —
  // every later step (design, quantities, delivery, payment) is built
  // around the garment picked here, so once that's cleared none of that
  // downstream data is still valid to resume either.
  function handleResetSelection() {
    setConfirmed(null);
    setModalGarmentId(null);
    localStorage.removeItem("clothCoreOrderDraft");
    setShowResetConfirm(false);
  }

  return (
    <ShopOwnerLayout
      shellStyle={{ background: C.cream100 }}
      contentClassName="container py-4 order-flow-page"
      contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
    >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-3"
          >
            <div className="flex-grow-1">
              <OrderStepHeader
                stepIndex={1}
                title="Product & Material Selection"
                subtitle="Choose your garment, fabric, and color to get started."
                icon={<IconTarget size={22} stroke={1.75} color={C.mauve500} />}
              />
            </div>
            <div className="d-flex gap-2" style={{ flexShrink: 0 }}>
              {confirmed && !isLocked && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn px-4 py-2 d-flex align-items-center gap-2"
                  style={{
                    background: "transparent",
                    color: "#b3261e",
                    borderRadius: "25px",
                    fontWeight: "bold",
                    border: "1.5px solid rgba(179,38,30,0.4)",
                  }}
                  onClick={() => setShowResetConfirm(true)}
                >
                  <IconRefresh size={17} stroke={1.75} /> Reset Selection
                </motion.button>
              )}
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
            </div>
          </motion.div>

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
                  You're viewing what was submitted for approval — it can no longer be changed here. Use "Place New Order" on the Approval page (or "Place Order" in the sidebar) to start a separate order.
                </div>
              </div>
            </div>
          )}

          <div className="row">
            {/* Left Section - Selection Options */}
            <div className="col-lg-8">
              {/* Garment Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="card mb-4 border-0"
                style={{ borderRadius: "20px", boxShadow: "0 10px 40px rgba(25,0,25,0.08)", background: "#fff" }}
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

                  {catalogLoading && garments.length === 0 ? (
                    <div className="text-center py-5">
                      <IconLoader2 size={32} className="pms-spin" color={C.mauve500} />
                      <p className="mt-3 mb-0" style={{ color: C.mauve500 }}>Loading garment catalog...</p>
                    </div>
                  ) : catalogError ? (
                    <div
                      className="d-flex align-items-center justify-content-between gap-3 p-3"
                      style={{ background: "rgba(179,38,30,0.06)", border: "1px solid rgba(179,38,30,0.2)", borderRadius: 12, color: "#b3261e" }}
                      role="alert"
                    >
                      <span className="d-flex align-items-center gap-2" style={{ fontSize: 13.5, fontWeight: 600 }}>
                        <IconAlertTriangle size={18} stroke={2.5} /> {catalogError}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm fw-bold cc-outline-btn"
                        style={{ border: "1.5px solid #b3261e", color: "#b3261e", borderRadius: 20, background: "transparent" }}
                        onClick={loadCatalog}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                  <div className="row g-3">
                    {garments.map((g) => {
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
                              cursor: isLocked ? "not-allowed" : "pointer",
                              opacity: isLocked && !selected ? 0.55 : 1,
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
                            onClick={() => !isLocked && setModalGarmentId(g.id)}
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
                  )}
                  {garments.length > 0 && (
                    <p className="mb-0 mt-2" style={{ fontSize: 12.5, color: C.mauve500 }}>
                      Tap a garment to choose its fabric and color in a popup.
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Bottom Status Bar (moved up under garment card) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div
                  className="card border-0"
                  style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(25,0,25,0.06)", background: "#fff" }}
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
                              <div className="small" style={{ color: C.mauve500 }}>
                                Available Quantity:{" "}
                                <span className="fw-bold" style={{ color: C.plum900 }}>{confirmed.garment.stock}+ pcs</span>
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
                          <small style={{ color: C.mauve500 }}>Unit Price</small>
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
                  className="card border-0"
                  style={{ borderRadius: "20px", boxShadow: "0 10px 40px rgba(25,0,25,0.12)", overflow: "hidden", background: "#fff" }}
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
                        <small style={{ color: C.mauve500 }}>Garment</small>
                        <span className="fw-bold" style={{ color: C.plum900 }}>
                          {confirmed ? confirmed.garment.name : "Not selected"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small style={{ color: C.mauve500 }}>Fabric</small>
                        <span className="fw-bold" style={{ color: C.plum900 }}>
                          {confirmed ? confirmed.fabric.label : "Not selected"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small style={{ color: C.mauve500 }}>Color</small>
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
                      <small style={{ color: C.mauve500 }}>Unit Price</small>
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

      <ConfirmModal
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleResetSelection}
        title="Reset Selection?"
        message="This clears your selected garment, fabric and color, along with any design, quantities, delivery and payment details already saved for this order. You'll start over from Step 1."
        confirmLabel="Reset Selection"
        danger
      />

      <style>{`
        .pms-spin { animation: pms-spin 0.8s linear infinite; }
        @keyframes pms-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .gc-modal-card { border-radius: 20px !important; }
          .gc-modal-header { padding: 18px !important; border-radius: 20px 20px 0 0 !important; }
          .gc-modal-body { padding: 20px 18px !important; }
          .gc-fabric-card { padding: 12px 6px !important; }
        }
      `}</style>
    </ShopOwnerLayout>
  );
}

export default OrderStep1;