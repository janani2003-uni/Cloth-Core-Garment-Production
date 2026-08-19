// src/components/order/OrderNavButtons.js
// Shared Back / Next footer for every order-flow page.
import React from "react";
import { IconArrowLeft, IconArrowRight, IconLoader2 } from "@tabler/icons-react";

function OrderNavButtons({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
  nextDisabled = false,
  backDisabled = false,
  loading = false,
  hideBack = false,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      {hideBack ? <span /> : (
        <button
          type="button"
          className="btn order-nav-back d-flex align-items-center gap-2"
          onClick={onBack}
          disabled={backDisabled}
        >
          <IconArrowLeft size={18} stroke={2} /> {backLabel}
        </button>
      )}
      <button
        type="button"
        className="btn order-nav-next d-flex align-items-center gap-2"
        onClick={onNext}
        disabled={nextDisabled || loading}
      >
        {loading ? (
          <>
            <IconLoader2 size={18} className="pms-spin" /> Processing...
          </>
        ) : (
          <>
            {nextLabel} <IconArrowRight size={18} stroke={2} />
          </>
        )}
      </button>
    </div>
  );
}

export default OrderNavButtons;
