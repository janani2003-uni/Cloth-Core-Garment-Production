// src/components/order/ShopProfileGuard.js
// Wraps every order-placement route (Step 1 through Payment) so a normal
// Shop Owner can't start — or jump directly into, via URL — the order flow
// before their Shop Profile has the required basic information filled in.
// Checked against the backend (GET /api/shops/profile-status), never a
// locally-cached flag, so it can't be stale or spoofed by client state.
//
// Admin is exempt entirely, using the REAL authenticated role
// (getUser().role), not whichever view they're currently previewing — an
// Admin previewing the Shop Owner interface must still be able to open
// every step for testing without ever having created a Shop record.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IconBuildingStore } from "@tabler/icons-react";
import ShopOwnerLayout from "../ShopOwnerLayout";
import { ORDER_COLORS as C } from "../../utils/orderTheme";
import { getUser } from "../../utils/auth";

const PROFILE_STATUS_URL = "http://localhost:5000/api/shops/profile-status";

function ShopProfileGuard({ children }) {
  const navigate = useNavigate();
  const isAdmin = getUser()?.role === "admin";
  const [status, setStatus] = useState(isAdmin ? "ok" : "checking");

  useEffect(() => {
    if (isAdmin) return undefined;

    let cancelled = false;
    axios
      .get(PROFILE_STATUS_URL)
      .then((res) => {
        if (!cancelled) setStatus(res.data?.profileComplete ? "ok" : "blocked");
      })
      .catch(() => {
        // Fail closed — if profile status can't be confirmed, don't let
        // them into a flow that would fail server-side anyway.
        if (!cancelled) setStatus("blocked");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "checking") {
    return (
      <ShopOwnerLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
        </div>
      </ShopOwnerLayout>
    );
  }

  if (status === "blocked") {
    return (
      <ShopOwnerLayout>
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(25,0,25,0.5)", position: "fixed", inset: 0, zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 20, border: "none", boxShadow: "0 30px 80px rgba(25,0,25,0.3)" }}>
              <div className="modal-body text-center" style={{ padding: "36px 32px" }}>
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})` }}
                >
                  <IconBuildingStore size={28} color="#fff" />
                </div>
                <h4 className="fw-bold mb-2" style={{ color: C.plum900 }}>
                  Complete Your Shop Profile
                </h4>
                <p className="mb-1" style={{ color: C.mauve500 }}>
                  Please update your Shop Profile before placing an order.
                </p>
                <p className="mb-4" style={{ color: C.mauve500, fontSize: 13.5 }}>
                  Your shop information is required before you can submit garment orders.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    style={{ border: `1.5px solid ${C.mauve500}`, color: C.plum700, borderRadius: 12, padding: "10px 22px", fontWeight: 600, background: "transparent" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/shop-profile", { state: { fromOrderGuard: true } })}
                    style={{ background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`, color: "#fff", borderRadius: 12, padding: "10px 22px", fontWeight: 600, border: "none" }}
                  >
                    Update Shop Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ShopOwnerLayout>
    );
  }

  return children;
}

export default ShopProfileGuard;
