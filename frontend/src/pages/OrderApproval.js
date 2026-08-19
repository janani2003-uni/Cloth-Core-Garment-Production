import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import OrderStepHeader from "../components/order/OrderStepHeader";
import OrderNavButtons from "../components/order/OrderNavButtons";
import ApprovalStatusCard from "../components/order/ApprovalStatusCard";
import ApprovalTimeline from "../components/order/ApprovalTimeline";
import { ORDER_COLORS as C } from "../utils/orderTheme";
import { getUser } from "../utils/auth";
import { goToPlaceOrder } from "../utils/orderStatus";
import { ADMIN_PREVIEW_ORDER_KEY } from "../components/order/AdminOrderFlowNav";
import "../styles/orderFlow.css";
import { IconRefresh, IconAlertTriangle, IconPlus } from "@tabler/icons-react";

const ORDERS_API_URL = "http://localhost:5000/api/orders";
const POLL_INTERVAL_MS = 8000;

function getDraft() {
  return JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
}

function saveDraft(patch) {
  localStorage.setItem("clothCoreOrderDraft", JSON.stringify({ ...getDraft(), ...patch }));
}

function OrderApproval() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resubmitting, setResubmitting] = useState(false);
  const pollRef = useRef(null);
  // Guards against React.StrictMode's dev-only double-invoke of effects
  // (mount -> cleanup -> mount again, same component instance/refs) — this
  // effect's job includes a real, order-creating POST to the backend, so
  // running it twice for one page visit silently created two separate
  // orders for a single submission (visible as "the same order twice" in
  // My Recent Orders), and whichever of the two concurrent requests
  // resolved last decided the final loading/error state — occasionally
  // surfacing "Could not load your order" even though an order (or two)
  // had actually been created. A ref survives StrictMode's simulated
  // remount, so this correctly limits the real side effect to exactly one
  // run per visit regardless of how many times the effect body fires.
  const hasLoadedRef = useRef(false);

  const fetchOrder = useCallback(async (orderMongoId) => {
    const res = await axios.get(`${ORDERS_API_URL}/${orderMongoId}`);
    return res.data;
  }, []);

  const createOrder = useCallback(async () => {
    const draft = getDraft();
    const user = getUser();

    const hasRequiredFields =
      draft.garment && draft.fabric && draft.color &&
      typeof draft.unitPrice === "number" &&
      draft.sizes && typeof draft.totalQuantity === "number" && draft.totalQuantity > 0;

    if (!hasRequiredFields || !user) {
      navigate("/step1");
      return null;
    }

    const response = await axios.post(ORDERS_API_URL, {
      userId: user._id,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      item: `${draft.garment} (${draft.fabric}, ${draft.color})`,
      quantity: draft.totalQuantity,
      unitPrice: draft.unitPrice,
      deliveryDate: draft.deliveryDate || undefined,
      deliveryAddress: draft.deliveryAddress || "",
      deliveryMethod: draft.deliveryMethod || "",
      notes: draft.designNotes || "",
      garmentType: draft.garment,
      sizeBreakdown: draft.sizes,
      design:
        draft.design?.designSource === "ai_generated"
          ? {
              designSource: "ai_generated",
              prompt: draft.design.prompt,
              generatedDesignPath: draft.design.generatedDesignPath,
              previewGarment: draft.garment,
              previewColor: draft.color,
              previewColorHex: draft.colorHex,
            }
          : draft.design?.designSource === "uploaded_logo"
          ? {
              designSource: "uploaded_logo",
              uploadedLogoPath: draft.design.uploadedLogoPath,
              uploadedLogoSource: draft.design.uploadedLogoSource,
              fileName: draft.design.fileName,
              previewGarment: draft.garment,
              previewColor: draft.color,
              previewColorHex: draft.colorHex,
            }
          : undefined,
    });

    return response.data.order;
  }, [navigate]);

  const loadOrExistingOrCreate = useCallback(async () => {
    setLoading(true);
    setError("");

    // An Admin gets two genuinely different situations here, and they must
    // never be conflated:
    //  1. They actually walked the wizard (Steps 1-5) in Shop Owner preview
    //     and built a real, submittable draft — that draft deserves its own
    //     real order and its own real (fresh, "Pending") approval status,
    //     exactly like a Shop Owner would get. Previously this branch never
    //     created anything for Admin, so it always fell through to case 2
    //     below — meaning Step 6 silently showed some OTHER, unrelated
    //     order's (possibly already-approved) status, making it look like
    //     "my order got approved with no approval given."
    //  2. They jumped here directly via "Admin Test Navigation" with no
    //     real draft built — that's a deliberate request to preview an
    //     existing order's approval UI, so the cached preview-order
    //     selection is exactly right here.
    if (getUser()?.role === "admin") {
      const draft = getDraft();

      if (draft.orderId) {
        try {
          const found = await fetchOrder(draft.orderId);
          setOrder(found);
          setLoading(false);
          return;
        } catch {
          // Stale/deleted — fall through to building a fresh one below.
        }
      } else {
        const hasRequiredFields =
          draft.garment && draft.fabric && draft.color &&
          typeof draft.unitPrice === "number" &&
          draft.sizes && typeof draft.totalQuantity === "number" && draft.totalQuantity > 0;

        if (hasRequiredFields) {
          try {
            const created = await createOrder();
            if (created) {
              saveDraft({ orderId: created._id });
              // Keep "Admin Test Navigation" in sync so jumping to Step 7
              // (Payment) or back to Step 6 later follows this exact order
              // instead of an older, unrelated preview pick.
              localStorage.setItem(ADMIN_PREVIEW_ORDER_KEY, created._id);
              setOrder(created);
              setLoading(false);
              return;
            }
          } catch (err) {
            setError(err.response?.data?.message || "Could not create the order for preview.");
          }
        }
      }

      // No real draft to work with — genuinely jumping here via Admin Test
      // Navigation to preview an existing order. Never surface a hard error
      // just because that pick turned out to be stale (e.g. deleted test
      // data); fall straight to the empty state instead.
      const previewId = localStorage.getItem(ADMIN_PREVIEW_ORDER_KEY);
      if (previewId) {
        try {
          const found = await fetchOrder(previewId);
          setOrder(found);
          setLoading(false);
          return;
        } catch {
          // Stale/deleted.
        }
      }

      setOrder(null);
      setLoading(false);
      return;
    }

    try {
      const draft = getDraft();
      let current;

      if (draft.orderId) {
        current = await fetchOrder(draft.orderId);
      } else {
        current = await createOrder();
        if (current) {
          saveDraft({ orderId: current._id });
        }
      }

      if (current) setOrder(current);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [createOrder, fetchOrder]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadOrExistingOrCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll while pending so an Admin/Supervisor's decision shows up without
  // the shop owner having to manually refresh.
  useEffect(() => {
    if (!order || order.approval?.status !== "Pending") {
      if (pollRef.current) clearInterval(pollRef.current);
      return undefined;
    }

    pollRef.current = setInterval(async () => {
      try {
        const refreshed = await fetchOrder(order._id);
        setOrder(refreshed);
      } catch {
        // Silent — the manual refresh button and next tick both retry.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [order, fetchOrder]);

  const handleRefresh = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const refreshed = await fetchOrder(order._id);
      setOrder(refreshed);
    } catch (err) {
      setError(err.response?.data?.message || "Could not refresh status.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async () => {
    if (!order) return;
    setResubmitting(true);
    setError("");
    try {
      const res = await axios.post(`${ORDERS_API_URL}/${order._id}/submit-for-approval`);
      setOrder(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resubmit the order.");
    } finally {
      setResubmitting(false);
    }
  };

  const handlePlaceNewOrder = () => {
    goToPlaceOrder(navigate);
  };

  const isApproved = order?.approval?.status === "Approved";
  const isRejected = order?.approval?.status === "Rejected";

  return (
    <ShopOwnerLayout
      contentClassName="order-flow-page"
      contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
      shellStyle={{ background: C.cream100 }}
    >
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-2">
          <div className="flex-grow-1">
            <OrderStepHeader
              stepIndex={6}
              title="Admin Approval"
              subtitle="An Admin or Supervisor verifies stock and approves your order before payment."
            />
          </div>
          {order && (
            <button
              type="button"
              className="btn px-4 py-2 d-flex align-items-center gap-2 fw-bold cc-pill-cta"
              style={{
                background: `linear-gradient(45deg, ${C.plum700}, ${C.mauve500})`,
                color: "white",
                borderRadius: "25px",
                border: "none",
                boxShadow: "0 8px 20px rgba(82,43,91,0.3)",
                flexShrink: 0,
                marginTop: 4,
              }}
              onClick={handlePlaceNewOrder}
            >
              <IconPlus size={17} stroke={2} /> Place New Order
            </button>
          )}
        </div>

        {error && (
          <div
            className="d-flex align-items-center gap-2 mb-4 p-3"
            style={{ background: "rgba(179,38,30,0.06)", border: "1px solid rgba(179,38,30,0.2)", borderRadius: 12, color: "#b3261e", fontSize: 13.5, fontWeight: 600 }}
            role="alert"
          >
            <IconAlertTriangle size={18} stroke={2.5} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {loading && !order ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" style={{ color: C.mauve500 }} />
            <p className="mt-3" style={{ color: C.mauve500 }}>Loading your order…</p>
          </div>
        ) : order ? (
          <div className="row">
            <div className="col-lg-7">
              <ApprovalStatusCard order={order} />

              {isRejected && (
                <div className="d-flex gap-2 mt-3">
                  <button
                    type="button"
                    className="btn order-nav-next"
                    disabled={resubmitting}
                    onClick={handleResubmit}
                  >
                    {resubmitting ? "Resubmitting…" : "Resubmit for Approval"}
                  </button>
                </div>
              )}

              {!isApproved && !isRejected && (
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2 mt-3 cc-outline-btn"
                  style={{ color: C.plum700, border: `1.5px solid ${C.mauve500}`, borderRadius: 20, padding: "8px 18px", fontWeight: 600, fontSize: 13, background: "transparent" }}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <IconRefresh size={14} stroke={2} /> {loading ? "Refreshing…" : "Refresh Status"}
                </button>
              )}
            </div>

            <div className="col-lg-5">
              <div
                className="card border-0"
                style={{ borderRadius: 20, boxShadow: "0 10px 40px rgba(25,0,25,0.08)", background: "#fff" }}
              >
                <div className="card-body p-4">
                  <small className="fw-bold d-block mb-3" style={{ color: C.mauve500, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
                    Approval Progress
                  </small>
                  <ApprovalTimeline approvalStatus={order.approval?.status} />
                </div>
              </div>
            </div>
          </div>
        ) : getUser()?.role === "admin" ? (
          <div className="text-center py-5" style={{ color: C.mauve500 }}>
            No saved orders exist yet to preview. Pick one from "Admin Test Navigation" above, or place a real order as a Shop Owner first.
          </div>
        ) : null}

        <OrderNavButtons
          nextLabel="Continue to Payment"
          nextDisabled={!isApproved}
          onBack={() => navigate("/order-delivery")}
          onNext={() => navigate("/step5")}
        />
      </div>
    </ShopOwnerLayout>
  );
}

export default OrderApproval;
