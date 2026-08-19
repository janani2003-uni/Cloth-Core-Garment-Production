// src/components/ActionMenu.js
// Reusable three-dot action menu. Renders its dropdown through a React
// portal into document.body, positioned from the trigger button's own
// bounding rect — so it is never clipped by an ancestor's overflow/
// position context (table-responsive scroll containers, rounded-corner
// cards with `overflow: hidden`, etc.), which is what caused the old
// absolutely-positioned-inside-the-table-cell dropdown on Admin Orders to
// render partly cut off.
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ThreeDotsVertical } from "react-bootstrap-icons";

const C = {
  plum900: "#190019",
  text: "var(--clothcore-text)",
  border: "var(--clothcore-border)",
};

function ActionMenu({ items, ariaLabel = "Row actions" }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 200 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const computePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuWidth = 210;
    // Anchor to the button's bottom-right, but keep the menu fully inside
    // the viewport on both axes (flips left/up near the page edges) instead
    // of ever letting it run off-screen or under other content.
    let left = rect.right - menuWidth;
    if (left < 8) left = rect.left;
    if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;

    let top = rect.bottom + 6;
    const estimatedMenuHeight = items.length * 38 + 16;
    if (top + estimatedMenuHeight > window.innerHeight - 8) {
      top = rect.top - estimatedMenuHeight - 6;
    }

    setCoords({ top, left, width: menuWidth });
  }, [items.length]);

  const toggle = () => {
    if (!open) computePosition();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const handleReposition = () => computePosition();

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, computePosition]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        style={{
          background: "transparent", border: "none", padding: "4px 8px",
          borderRadius: "8px", color: "var(--clothcore-text-soft)", cursor: "pointer",
        }}
      >
        <ThreeDotsVertical size={18} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            background: "#fff",
            borderRadius: "12px",
            padding: "6px",
            boxShadow: "var(--clothcore-shadow-hover, 0 20px 50px rgba(25,0,25,0.18))",
            border: `1px solid ${C.border}`,
            zIndex: 2000,
          }}
        >
          {items.map((item, index) => (
            <button
              key={item.label + index}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              style={{
                display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px",
                fontSize: "13px", padding: "8px 12px", width: "100%", border: "none",
                background: "transparent", textAlign: "left", cursor: "pointer",
                color: item.danger ? "var(--clothcore-danger)" : C.text,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(82,43,91,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default ActionMenu;
