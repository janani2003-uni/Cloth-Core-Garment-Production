// src/pages/ShopProfile.js
// Replaces the old "My Shop" registration-only page with a full profile:
// create (if none exists), view, and edit — plus a real Approval Details
// panel. Reuses the existing /api/shops/my-shop + /api/shops (POST) routes
// and the new /api/shops/me (PUT) owner-edit route.
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const SHOP_API_URL = "http://localhost:5000/api/shops";
const ME_API_URL = "http://localhost:5000/api/auth/me";

const STATUS_META = {
  Pending: { label: "Approval Pending", icon: Clock, badgeClass: "admin-badge-warning" },
  Approved: { label: "Approved", icon: CheckCircle, badgeClass: "admin-badge-success" },
  Rejected: { label: "Changes Required", icon: XCircle, badgeClass: "admin-badge-danger" },
};

const CREATE_FIELDS_REQUIRED = ["shopName", "shopAddress", "phone"];
const PROFILE_FIELDS = [
  "shopName", "shopAddress", "phone", "email", "city", "district", "postalCode",
  "businessType", "businessRegistrationNumber", "garmentCategories",
  "estimatedMonthlyVolume", "preferredPaymentMethod", "deliveryInstructions", "businessDescription",
];

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
        <div style={{ fontSize: "14.5px", fontWeight: 500, color: "var(--clothcore-text)", padding: "9px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", minHeight: "38px", display: "flex", alignItems: "center" }}>
          {value || <span style={{ color: "var(--clothcore-text-muted)" }}>—</span>}
        </div>
      )}
    </div>
  );
}

function ShopProfile() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

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
        setForm({ shopName: "", shopAddress: "", phone: "" });
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");

    for (const field of CREATE_FIELDS_REQUIRED) {
      if (!form[field] || !String(form[field]).trim()) {
        setMessage("Shop name, address and phone are required.");
        setMessageIsError(true);
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {};
      PROFILE_FIELDS.forEach((f) => { if (form[f]) payload[f] = form[f]; });
      await axios.post(SHOP_API_URL, payload);
      setMessage("Shop profile submitted for approval.");
      setMessageIsError(false);
      await loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not submit shop profile.");
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setMessage("");
    if (!form.shopName?.trim() || !form.shopAddress?.trim() || !form.phone?.trim()) {
      setMessage("Shop name, address and phone are required.");
      setMessageIsError(true);
      return;
    }

    try {
      setSaving(true);

      const shopPayload = {};
      PROFILE_FIELDS.forEach((f) => { shopPayload[f] = form[f]; });
      const shopRes = await axios.put(`${SHOP_API_URL}/me`, shopPayload);

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

      setShop(shopRes.data.shop);
      setOwner(ownerRes.data.user);
      setEditing(false);
      setMessage(
        shopRes.data.shop.approvalStatus === "Pending" && shop?.approvalStatus === "Approved"
          ? "Profile updated — your shop name change requires re-approval."
          : "Profile updated successfully."
      );
      setMessageIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save changes.");
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
            <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)" }}>Tell us about your shop — this needs Admin approval before you can place bulk orders.</p>
          </div>

          <div className="admin-content-card" style={{ padding: "32px" }}>
            <form onSubmit={handleCreate}>
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
                {saving ? "Submitting..." : "Create Shop Profile"}
              </button>
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
            <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        ) : (
          <button className="admin-btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {message && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", background: messageIsError ? "var(--clothcore-danger-bg)" : "var(--clothcore-success-bg)", color: messageIsError ? "var(--clothcore-danger)" : "var(--clothcore-success)", fontSize: "13px" }}>
          {message}
        </div>
      )}

      {/* Status Summary Hero */}
      <div className="clothcore-fade-in" style={{
        borderRadius: "var(--clothcore-radius-lg)",
        marginBottom: "20px",
        padding: "28px",
        background: "linear-gradient(135deg, var(--clothcore-deep), var(--clothcore-purple) 60%, var(--clothcore-mauve))",
        boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "22px", flexShrink: 0 }}>
              {shop.shopName?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{shop.shopName}</div>
              <span className={`admin-badge ${meta.badgeClass}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                <StatusIcon size={12} /> {meta.label}
              </span>
            </div>
          </div>

          {shop.approvalStatus === "Approved" && (
            <button
              onClick={() => navigate("/orders")}
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "12px", padding: "10px 18px", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "background-color var(--clothcore-transition-smooth)" }}
            >
              View My Orders →
            </button>
          )}
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
                <div style={{ fontSize: "12.5px", color: "var(--clothcore-text-soft)", background: "rgba(255,255,255,0.04)", padding: "10px", borderRadius: "8px" }}>
                  What happens next? An administrator will review your profile. You'll be notified once it's approved or if changes are needed.
                </div>
              )}
            </div>
          </div>

          {/* Shop Logo — deferred, no upload backend yet */}
          <div className="admin-content-card" style={{ padding: "24px", marginTop: "20px", textAlign: "center" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Shop Logo</h3>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(133,79,108,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: "var(--clothcore-blush)", fontWeight: 700, fontSize: "22px" }}>
              <ShopIcon size={28} />
            </div>
            <div style={{ fontSize: "12px", color: "var(--clothcore-text-muted)" }}>
              Logo upload isn't available yet — this needs backend file-storage support to enable.
            </div>
          </div>
        </div>
      </div>
      </div>
    </ShopOwnerLayout>
  );
}

export default ShopProfile;
