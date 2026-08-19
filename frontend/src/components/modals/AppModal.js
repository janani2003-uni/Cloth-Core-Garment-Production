// src/components/modals/AppModal.js
// Minimal shared modal shell — overlay + centered card + fade/scale entrance
// + keyboard/accessibility behavior — used by LogoutConfirmModal.js and
// SuccessModal.js so both share one consistent look and behavior instead of
// each hand-rolling its own overlay. Mirrors the existing overlay pattern
// already used across the app (see RejectOrderModal.js) rather than
// inventing a new one.
//
// Rendered into a document.body portal rather than inline: `position:
// fixed` is only relative to the viewport as long as no ancestor has a CSS
// transform (or filter/perspective/will-change: transform), but the
// order-placement pages (OrderStep1-6) wrap their content in framer-motion
// `motion.div`s for page-transition animation, which do apply a transform
// and become the fixed-position containing block instead. Without the
// portal, opening this modal (e.g. the Logout confirmation from the
// sidebar) while on one of those pages rendered it clipped inside the
// page's own layout instead of covering the full screen — visible as a
// squeezed-in sliver of text with an unreachable/unclickable button.
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

function AppModal({ open, onClose, labelledBy, describedBy, maxWidth = 440, children, closeOnBackdrop = true, closeOnEsc = true }) {
  const cardRef = useRef(null);

  // Keep background content from scrolling/interacting while the modal is open.
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // ESC closes cancelable modals; focus lands on the card itself so keyboard
  // users start somewhere sensible without needing to tab in from the page.
  useEffect(() => {
    if (!open) return undefined;

    cardRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEsc && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="app-modal-overlay"
          onClick={() => closeOnBackdrop && onClose && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(25,0,25,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1080,
          }}
        >
          <motion.div
            ref={cardRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            style={{
              width: "100%",
              maxWidth,
              background: "#FFFDFB",
              borderRadius: 24,
              boxShadow: "0 30px 80px rgba(25,0,25,0.32), 0 8px 24px rgba(82,43,91,0.14)",
              overflow: "hidden",
              outline: "none",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default AppModal;
