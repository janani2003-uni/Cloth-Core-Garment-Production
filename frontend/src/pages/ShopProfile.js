// src/pages/ShopProfile.js
// Replaces the old "My Shop" registration-only page with a full profile:
// create (if none exists), view, and edit — plus a real Approval Details
// panel. Reuses the existing /api/shops/my-shop + /api/shops (POST) routes
// and the new /api/shops/me (PUT) owner-edit route.
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Shop as ShopIcon,
  CheckCircle,
  Clock,
  XCircle,
  ClipboardCheck,
  Person,
  Telephone,
  Envelope,
  GeoAlt,
  Building,
  Tag,
  CashCoin,
  Truck,
} from "react-bootstrap-icons";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import { getUser } from "../utils/auth";
import { goToPlaceOrder } from "../utils/orderStatus";

const SHOP_API_URL = "http://localhost:5000/api/shops";
const ME_API_URL = "http://localhost:5000/api/auth/me";
const UPLOAD_BASE_URL = "http://localhost:5000";

const LOGO_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const LOGO_MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Shop.approvalStatus still exists and is still shown here for Admin
// visibility/record-keeping (Shop Owner Management, credit limit,
// suspension) — but it is no longer a gate on placing orders. Eligibility
// to order is
// ONLY: role === "shopOwner" AND the required Shop Profile fields below are
// complete (enforced by ShopProfileGuard.js / GET /api/shops/profile-status,
// not by this status).
const STATUS_META = {
  Pending: { label: "Under Admin Review", icon: Clock, badgeClass: "admin-badge-warning" },
  Approved: { label: "Reviewed", icon: CheckCircle, badgeClass: "admin-badge-success" },
  Rejected: { label: "Changes Requested", icon: XCircle, badgeClass: "admin-badge-danger" },
};

const PROFILE_FIELDS = [
  "shopName", "shopAddress", "phone", "email", "city", "district", "postalCode",
  "businessType", "businessRegistrationNumber", "garmentCategories",
  "estimatedMonthlyVolume", "preferredPaymentMethod", "deliveryInstructions", "businessDescription",
];

// Distinguishes error types instead of collapsing everything into one
// generic string — the backend now always sends a specific, safe .message
// (see shopRoutes.js's upsertShopProfile), so this mainly covers the case
// where the request never got a response at all (network/CORS failure).
function describeError(err, fallback) {
  if (!err.response) {
    return "Could not reach the server. Please check your connection and try again.";
  }

  if (err.response.data?.message) return err.response.data.message;

  switch (err.response.status) {
    case 401: return "Your session has expired. Please log in again.";
    case 403: return "You do not have permission to do that.";
    case 404: return "Profile not found.";
    case 409: return "This information conflicts with an existing record.";
    default: return fallback;
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "N/A";
  }
}

function calcCompletion(shop, owner) {
  const fields = [
    owner?.firstName, owner?.lastName, owner?.phone,
    shop?.shopName, shop?.shopAddress, shop?.phone, shop?.email, shop?.city,
    shop?.businessType, shop?.garmentCategories, shop?.businessDescription,
  ];
  const filled = fields.filter((v) => v && String(v).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function Field({ label, name, value, editing, onChange, type = "text", textarea, disabled, icon: Icon }) {
  return (
    <div>
      <label style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--clothcore-text-muted)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
        {Icon && <Icon size={12} />} {label}
      </label>
      {editing && !disabled ? (
        textarea ? (
          <textarea className="form-control admin-select" rows={3} value={value || ""} onChange={(e) => onChange(name, e.target.value)} />
        ) : (
          <input type={type} className="form-control admin-select" value={value || ""} onChange={(e) => onChange(name, e.target.value)} />
        )
      ) : (
        <div style={{ fontSize: "14.5px", fontWeight: 500, color: "var(--clothcore-text)", padding: "9px 12px", background: "rgba(82,43,91,0.035)", borderRadius: "10px", minHeight: "38px", display: "flex", alignItems: "center" }}>
          {value || <span style={{ color: "var(--clothcore-text-muted)" }}>—</span>}
        </div>
      )}
    </div>
  );
}

function ShopProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  // Set by ShopProfileGuard.js when it redirected here because Place Order
  // was blocked — lets us offer "Continue to Place Order" once they've
  // saved, instead of leaving them to find their own way back to Step 1.
  const fromOrderGuard = Boolean(location.state?.fromOrderGuard);
  const [owner, setOwner] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [meRes, shopRes] = await Promise.allSettled([
        axios.get(ME_API_URL),
        axios.get(`${SHOP_API_URL}/my-shop`),
      ]);

      if (meRes.status === "fulfilled") setOwner(meRes.value.data);

      if (shopRes.status === "fulfilled") {
        setShop(shopRes.value.data);
        const initialForm = {};
        PROFILE_FIELDS.forEach((f) => { initialForm[f] = shopRes.value.data[f] || ""; });
        initialForm.ownerFirstName = meRes.value?.data?.firstName || "";
        initialForm.ownerLastName = meRes.value?.data?.lastName || "";
        initialForm.ownerPhone = meRes.value?.data?.phone || "";
        setForm(initialForm);
      } else {
        setShop(null);
        // Owner fields must still be populated here (from /api/auth/me,
        // which succeeds independently of whether a shop exists yet) —
        // handleSaveProfile always PUTs both the shop and the owner record
        // together, and axios silently drops `undefined` values from the
        // JSON body, which turned the owner update into an empty {} and
        // backend into "No valid fields were provided for update".
        setForm({
          shopName: "",
          shopAddress: "",
          phone: "",
          ownerFirstName: meRes.value?.data?.firstName || "",
          ownerLastName: meRes.value?.data?.lastName || "",
          ownerPhone: meRes.value?.data?.phone || "",
        });
      }
    } catch (err) {
      console.error("Load Shop Profile Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Real upload — a multipart POST to /api/shops/logo (see
  // backend/middleware/upload.js), not a base64 string kept in React state.
  // Validated client-side for a fast error message, then again on the
  // backend (the authoritative check) for MIME type, size, and ownership.
  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after replacing it
    if (!file) return;

    setLogoError("");

    if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
      setLogoError("Unsupported file type. Please use JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      setLogoError("File is too large. Maximum size is 5MB.");
      return;
    }

    try {
      setLogoUploading(true);
      const formData = new FormData();
      formData.append("logo", file);
      const res = await axios.post(`${SHOP_API_URL}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShop(res.data.shop);
    } catch (err) {
      setLogoError(describeError(err, "Could not upload logo. Please try again."));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setLogoUploading(true);
      setLogoError("");
      const res = await axios.delete(`${SHOP_API_URL}/logo`);
      setShop(res.data.shop);
    } catch (err) {
      setLogoError(describeError(err, "Could not remove logo. Please try again."));
    } finally {
      setLogoUploading(false);
    }
  };

  // Single submit handler for both "no profile yet" and "editing an
  // existing profile" — both cases hit the same PUT /api/shops/me upsert
  // endpoint. Previously these were two separate handlers (handleCreate
  // calling POST /, handleSave calling PUT /me), each with its own
  // validation and its own fallback error message — that split was the
  // actual root cause of the generic "Could not submit shop profile."
  // error masking whatever the real problem was.
  const handleSaveProfile = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setMessage("");

    if (!form.shopName?.trim() || !form.shopAddress?.trim() || !form.phone?.trim()) {
      setMessage("Shop name, address and phone are required.");
      setMessageIsError(true);
      return;
    }

    const wasApproved = shop?.approvalStatus === "Approved";

    try {
      setSaving(true);

      const shopPayload = {};
      PROFILE_FIELDS.forEach((f) => { shopPayload[f] = form[f] ?? ""; });
      const shopRes = await axios.put(`${SHOP_API_URL}/me`, shopPayload);
      setShop(shopRes.data.shop);

      // Owner's own name/phone are edited on this same page once a profile
      // exists — harmless no-op resave of the same values on first-time
      // creation, since the create form doesn't expose these fields itself.
      // Kept in its own try/catch: the Shop Profile save above already
      // succeeded, so a problem here must never surface as if nothing
      // saved at all.
      if (form.ownerFirstName?.trim() && form.ownerLastName?.trim()) {
        try {
          const ownerPayload = {
            firstName: form.ownerFirstName,
            lastName: form.ownerLastName,
            phone: form.ownerPhone,
          };
          const ownerRes = await axios.put(ME_API_URL, ownerPayload);

          const currentUser = getUser();
          const mergedUser = { ...currentUser, ...ownerRes.data.user };
          if (localStorage.getItem("user")) localStorage.setItem("user", JSON.stringify(mergedUser));
          else if (sessionStorage.getItem("user")) sessionStorage.setItem("user", JSON.stringify(mergedUser));

          setOwner(ownerRes.data.user);
        } catch (ownerErr) {
          console.error("Update owner info error:", ownerErr.response?.data?.message || ownerErr.message);
        }
      }

      setEditing(false);
      setMessage(
        wasApproved && shopRes.data.shop.approvalStatus === "Pending"
          ? "Shop Profile updated successfully — your shop name change requires re-approval."
          : "Shop Profile updated successfully."
      );
      setMessageIsError(false);
    } catch (err) {
      setMessage(describeError(err, "Unable to update profile. Please try again."));
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ShopOwnerLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} />
        </div>
      </ShopOwnerLayout>
    );
  }

  // No shop yet — creation form
  if (!shop) {
    return (
      <ShopOwnerLayout>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "18px", margin: "0 auto 16px",
              background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
            }}>
              <ShopIcon size={28} color="#fff" />
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "6px" }}>Set Up Your Shop Profile</h2>
            <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)" }}>Tell us about your shop. Once Shop Name, Address and Phone are saved, you can place orders right away — no Admin approval required.</p>
          </div>

          <div className="admin-content-card" style={{ padding: "32px" }}>
            <form onSubmit={handleSaveProfile}>
              <div className="row g-3">
                <div className="col-12"><Field label="Shop Name" name="shopName" value={form.shopName} editing onChange={handleChange} icon={Building} /></div>
                <div className="col-12"><Field label="Shop Address" name="shopAddress" value={form.shopAddress} editing onChange={handleChange} icon={GeoAlt} /></div>
                <div className="col-md-6"><Field label="Shop Phone" name="phone" value={form.phone} editing onChange={handleChange} icon={Telephone} /></div>
                <div className="col-md-6"><Field label="Shop Email (optional)" name="email" value={form.email} editing onChange={handleChange} icon={Envelope} /></div>
                <div className="col-md-6"><Field label="Main Garment Categories (optional)" name="garmentCategories" value={form.garmentCategories} editing onChange={handleChange} icon={Tag} /></div>
                <div className="col-md-6"><Field label="Preferred Payment Method (optional)" name="preferredPaymentMethod" value={form.preferredPaymentMethod} editing onChange={handleChange} icon={CashCoin} /></div>
                <div className="col-12"><Field label="Short Business Description (optional)" name="businessDescription" value={form.businessDescription} editing onChange={handleChange} textarea /></div>
              </div>

              {message && (
                <div style={{ marginTop: "14px", fontSize: "13px", color: messageIsError ? "var(--clothcore-danger)" : "var(--clothcore-success)" }}>{message}</div>
              )}

              <button type="submit" className="admin-btn-primary" disabled={saving} style={{ marginTop: "20px", width: "100%", justifyContent: "center" }}>
                {saving ? "Saving..." : "Update Shop Profile"}
              </button>

              {fromOrderGuard && !messageIsError && message && (
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => goToPlaceOrder(navigate)}
                  style={{ marginTop: "10px", width: "100%", justifyContent: "center" }}
                >
                  Continue to Place Order →
                </button>
              )}
            </form>
          </div>
        </div>
      </ShopOwnerLayout>
    );
  }

  const meta = STATUS_META[shop.approvalStatus] || STATUS_META.Pending;
  const StatusIcon = meta.icon;
  const completion = calcCompletion(shop, owner);

  return (
    <ShopOwnerLayout>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "4px" }}>Shop Profile</h2>
          <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>Manage your shop information and approval status.</p>
        </div>
        {editing ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="admin-btn-secondary" onClick={() => { setEditing(false); loadAll(); }} disabled={saving}>Cancel</button>
            <button className="admin-btn-primary" onClick={handleSaveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        ) : (
          <button className="admin-btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {message && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", background: messageIsError ? "var(--clothcore-danger-bg)" : "var(--clothcore-success-bg)", color: messageIsError ? "var(--clothcore-danger)" : "var(--clothcore-success)", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <span>{message}</span>
          {fromOrderGuard && !messageIsError && (
            <button
              type="button"
              onClick={() => goToPlaceOrder(navigate)}
              style={{ background: "var(--clothcore-success)", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Continue to Place Order →
            </button>
          )}
        </div>
      )}

      {/* Status Summary Hero */}
      <div className="clothcore-fade-in" style={{
        borderRadius: "var(--clothcore-radius-lg)",
        marginBottom: "20px",
        padding: "28px",
        background: "linear-gradient(135deg, var(--clothcore-darkest), var(--clothcore-purple) 60%, var(--clothcore-mauve))",
        boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {shop.logoPath ? (
              <img
                src={`${UPLOAD_BASE_URL}${shop.logoPath}`}
                alt={`${shop.shopName} logo`}
                style={{ width: "64px", height: "64px", borderRadius: "18px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.28)", flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "22px", flexShrink: 0 }}>
                {shop.shopName?.[0]?.toUpperCase() || "S"}
              </div>
            )}
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{shop.shopName}</div>
              <span className={`admin-badge ${meta.badgeClass}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                <StatusIcon size={12} /> {meta.label}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/orders")}
            style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "12px", padding: "10px 18px", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "background-color var(--clothcore-transition-smooth)" }}
          >
            View My Orders →
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px", position: "relative", zIndex: 1 }}>
          {[
            { label: "Shop ID", value: shop.shopCode || "Not yet assigned" },
            { label: "Account Status", value: shop.isActive ? "Active" : "Suspended" },
            { label: "Profile Completion", value: `${completion}%` },
            { label: "Registered", value: formatDate(shop.createdAt) },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "12px", padding: "10px 16px", minWidth: "140px" }}>
              <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</div>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", zIndex: 0 }} />
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          {/* Owner Information */}
          <div className="admin-content-card" style={{ padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Owner Information</h3>
            <div className="row g-3">
              <div className="col-md-6"><Field label="First Name" name="ownerFirstName" value={form.ownerFirstName} editing={editing} onChange={handleChange} icon={Person} /></div>
              <div className="col-md-6"><Field label="Last Name" name="ownerLastName" value={form.ownerLastName} editing={editing} onChange={handleChange} icon={Person} /></div>
              <div className="col-md-6"><Field label="Email Address" name="email" value={owner?.email} editing={false} disabled onChange={() => {}} icon={Envelope} /></div>
              <div className="col-md-6"><Field label="Phone Number" name="ownerPhone" value={form.ownerPhone} editing={editing} onChange={handleChange} icon={Telephone} /></div>
            </div>
          </div>

          {/* Shop Information */}
          <div className="admin-content-card" style={{ padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Shop Information</h3>
            <div className="row g-3">
              <div className="col-md-6"><Field label="Shop Name" name="shopName" value={form.shopName} editing={editing} onChange={handleChange} icon={Building} /></div>
              <div className="col-md-6"><Field label="Business Type (optional)" name="businessType" value={form.businessType} editing={editing} onChange={handleChange} icon={Tag} /></div>
              <div className="col-md-6"><Field label="Business Registration Number (optional)" name="businessRegistrationNumber" value={form.businessRegistrationNumber} editing={editing} onChange={handleChange} /></div>
              <div className="col-md-6"><Field label="Shop Email (optional)" name="email" value={form.email} editing={editing} onChange={handleChange} icon={Envelope} /></div>
              <div className="col-md-6"><Field label="Shop Phone" name="phone" value={form.phone} editing={editing} onChange={handleChange} icon={Telephone} /></div>
              <div className="col-md-6"><Field label="Postal Code (optional)" name="postalCode" value={form.postalCode} editing={editing} onChange={handleChange} /></div>
              <div className="col-12"><Field label="Shop Address" name="shopAddress" value={form.shopAddress} editing={editing} onChange={handleChange} icon={GeoAlt} /></div>
              <div className="col-md-6"><Field label="City (optional)" name="city" value={form.city} editing={editing} onChange={handleChange} icon={GeoAlt} /></div>
              <div className="col-md-6"><Field label="District (optional)" name="district" value={form.district} editing={editing} onChange={handleChange} /></div>
            </div>
          </div>

          {/* Business Details */}
          <div className="admin-content-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Business Details</h3>
            <div className="row g-3">
              <div className="col-md-6"><Field label="Main Garment Categories (optional)" name="garmentCategories" value={form.garmentCategories} editing={editing} onChange={handleChange} icon={Tag} /></div>
              <div className="col-md-6"><Field label="Est. Monthly Bulk Order Quantity (optional)" name="estimatedMonthlyVolume" value={form.estimatedMonthlyVolume} editing={editing} onChange={handleChange} icon={Truck} /></div>
              <div className="col-md-6"><Field label="Preferred Payment Method (optional)" name="preferredPaymentMethod" value={form.preferredPaymentMethod} editing={editing} onChange={handleChange} icon={CashCoin} /></div>
              <div className="col-12"><Field label="Delivery Instructions (optional)" name="deliveryInstructions" value={form.deliveryInstructions} editing={editing} onChange={handleChange} textarea /></div>
              <div className="col-12"><Field label="Short Business Description (optional)" name="businessDescription" value={form.businessDescription} editing={editing} onChange={handleChange} textarea /></div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Approval Details Panel */}
          <div className="admin-content-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ClipboardCheck size={16} /> Approval Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div><div style={{ color: "var(--clothcore-text-muted)", fontSize: "11px" }}>Status</div><span className={`admin-badge ${meta.badgeClass}`}>{meta.label}</span></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", fontSize: "11px" }}>Submitted</div><div style={{ color: "var(--clothcore-text)" }}>{formatDate(shop.createdAt)}</div></div>
              <div><div style={{ color: "var(--clothcore-text-muted)", fontSize: "11px" }}>Reviewed</div><div style={{ color: "var(--clothcore-text)" }}>{formatDate(shop.reviewedAt)}</div></div>

              {shop.approvalStatus === "Rejected" && shop.rejectionReason && (
                <div>
                  <div style={{ color: "var(--clothcore-text-muted)", fontSize: "11px" }}>Admin Feedback</div>
                  <div style={{ color: "var(--clothcore-danger)", background: "var(--clothcore-danger-bg)", padding: "10px", borderRadius: "8px", marginTop: "4px" }}>{shop.rejectionReason}</div>
                </div>
              )}

              {shop.approvalStatus === "Approved" && (
                <>
                  <div><div style={{ color: "var(--clothcore-text-muted)", fontSize: "11px" }}>Shop ID</div><div style={{ color: "var(--clothcore-text)", fontWeight: 600 }}>{shop.shopCode}</div></div>
                  <div><div style={{ color: "var(--clothcore-text-muted)", fontSize: "11px" }}>Credit Limit</div><div style={{ color: "var(--clothcore-text)" }}>LKR {Number(shop.creditLimit || 0).toLocaleString()}</div></div>
                  <div><div style={{ color: "var(--clothcore-text-muted)", fontSize: "11px" }}>Ordering Permission</div><div style={{ color: shop.isActive ? "var(--clothcore-success)" : "var(--clothcore-danger)", fontWeight: 600 }}>{shop.isActive ? "Active" : "Suspended"}</div></div>
                </>
              )}

              {shop.approvalStatus === "Pending" && (
                <div style={{ fontSize: "12.5px", color: "var(--clothcore-text-soft)", background: "rgba(82,43,91,0.045)", padding: "10px", borderRadius: "8px" }}>
                  Your profile is complete and you can place orders now. An administrator may still review it for verification and to assign a Shop ID / credit limit — this does not block ordering.
                </div>
              )}
            </div>
          </div>

          {/* Shop Logo — a real disk-backed upload (POST /api/shops/logo),
              stored as a file path + metadata on the Shop document, never a
              base64 string. Persists across refresh and logout/login since
              it's read straight from `shop.logoPath` like every other
              profile field. */}
          <div className="admin-content-card" style={{ padding: "24px", marginTop: "20px", textAlign: "center" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Shop Logo</h3>

            {shop.logoPath ? (
              <img
                src={`${UPLOAD_BASE_URL}${shop.logoPath}`}
                alt={`${shop.shopName} logo`}
                style={{ width: "96px", height: "96px", borderRadius: "18px", objectFit: "cover", margin: "0 auto 14px", display: "block", border: "1px solid var(--clothcore-border-strong)", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
              />
            ) : (
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(133,79,108,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--clothcore-purple)", fontWeight: 700, fontSize: "22px" }}>
                <ShopIcon size={28} />
              </div>
            )}

            <div style={{ fontSize: "12px", color: "var(--clothcore-text-muted)", marginBottom: "14px" }}>
              JPG, JPEG, PNG or WEBP · Max 5MB
            </div>

            {logoError && (
              <div style={{ fontSize: "12.5px", color: "var(--clothcore-danger)", marginBottom: "10px" }}>{logoError}</div>
            )}

            {/* Only actionable once "Edit Profile" has actually been
                clicked — matches every other field on this page instead of
                letting the logo be changed independently of edit mode. */}
            {editing ? (
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <label
                  className="admin-btn-secondary"
                  style={{ cursor: logoUploading ? "not-allowed" : "pointer", opacity: logoUploading ? 0.6 : 1, marginBottom: 0 }}
                >
                  {logoUploading ? "Uploading..." : shop.logoPath ? "Replace Logo" : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoFileChange}
                    disabled={logoUploading}
                    style={{ display: "none" }}
                  />
                </label>
                {shop.logoPath && (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleRemoveLogo}
                    disabled={logoUploading}
                    style={{ color: "var(--clothcore-danger)" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <button type="button" className="admin-btn-secondary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                  {shop.logoPath ? "Replace Logo" : "Upload Logo"}
                </button>
                {shop.logoPath && (
                  <button type="button" className="admin-btn-secondary" disabled style={{ opacity: 0.5, cursor: "not-allowed", color: "var(--clothcore-danger)" }}>
                    Remove
                  </button>
                )}
                <div style={{ width: "100%", fontSize: "11.5px", color: "var(--clothcore-text-muted)", marginTop: "4px" }}>
                  Click "Edit Profile" above to change your logo.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ShopOwnerLayout>
  );
}

export default ShopProfile;
