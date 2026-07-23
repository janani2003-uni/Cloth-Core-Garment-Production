// src/pages/SupervisorShopOwners.js
// Read-only shop owner directory for Supervisor — "user management" scoped
// to shop owner accounts specifically. Deliberately view-only: role changes,
// account edits and deletion stay Admin-only (via /api/auth/users), this
// page only reads /api/auth/shop-owners.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Search, People, Shop as ShopIcon } from "react-bootstrap-icons";
import RoleLayout from "../components/RoleLayout";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

const API_URL = "http://localhost:5000/api/auth/shop-owners";

function shopBadgeClass(shop) {
  if (!shop) return "admin-badge-warning";
  if (shop.approvalStatus === "Approved") return shop.isActive ? "admin-badge-success" : "admin-badge-danger";
  if (shop.approvalStatus === "Rejected") return "admin-badge-danger";
  return "admin-badge-warning";
}

function shopStatusLabel(shop) {
  if (!shop) return "No shop profile yet";
  if (shop.approvalStatus === "Approved") return shop.isActive ? "Approved · Active" : "Approved · Suspended";
  return shop.approvalStatus;
}

function SupervisorShopOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewing, setViewing] = useState(null);

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_URL);
      setOwners(res.data.data || []);
    } catch (err) {
      console.error("Fetch Shop Owners Error:", err);
      setError(err.response?.data?.message || "Could not load shop owners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const filtered = owners.filter((o) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(term) ||
      o.email?.toLowerCase().includes(term) ||
      o.factoryName?.toLowerCase().includes(term) ||
      o.shop?.shopName?.toLowerCase().includes(term)
    );
  });

  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "4px" }}>Shop Owners</h2>
        <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>Directory of shop owner accounts and their shop approval status. View-only — role and account changes are managed by an Admin.</p>
      </div>

      <div className="admin-content-card">
        <div style={{ padding: "20px 20px 0" }}>
          <div className="position-relative" style={{ maxWidth: "360px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--clothcore-text-soft)" }} />
            <input
              type="text"
              className="form-control admin-select"
              placeholder="Search by name, email, factory, shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>

        <div className="table-responsive" style={{ marginTop: "16px" }}>
          <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Factory</th>
                <th>Shop</th>
                <th>Shop Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-5"><div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} /></td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="text-center py-5">
                  <div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div>
                  <button className="admin-btn-secondary" onClick={fetchOwners}>Retry</button>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-0">
                  <div className="admin-empty-state" style={{ border: "none", borderRadius: 0 }}>
                    <People size={36} className="admin-empty-state-icon" />
                    <div className="admin-empty-state-title">No shop owners found</div>
                    <div className="admin-empty-state-message">{owners.length === 0 ? "No shop owner accounts exist yet." : "Try a different search."}</div>
                  </div>
                </td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600, color: "var(--clothcore-text)" }}>{o.firstName} {o.lastName}</td>
                    <td>{o.email}</td>
                    <td>{o.factoryName || "—"}</td>
                    <td>{o.shop?.shopName || "—"}</td>
                    <td><span className={`admin-badge ${shopBadgeClass(o.shop)}`}>{shopStatusLabel(o.shop)}</span></td>
                    <td style={{ color: "var(--clothcore-text-soft)" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td><button className="admin-link-btn" onClick={() => setViewing(o)}>View</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }} onClick={() => setViewing(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-blush)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShopIcon size={16} /> {viewing.firstName} {viewing.lastName}
                </h5>
                <button type="button" className="btn-close" onClick={() => setViewing(null)} />
              </div>
              <div className="modal-body" style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Email</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.email}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Factory Name</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.factoryName || "—"}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Shop Name</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop?.shopName || "No shop profile yet"}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Shop Code</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop?.shopCode || "Not assigned"}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Account Status</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.status}</div></div>
                <div><div style={{ color: "var(--clothcore-text-muted)" }}>Joined</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.createdAt ? new Date(viewing.createdAt).toLocaleDateString() : "N/A"}</div></div>
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setViewing(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}

export default SupervisorShopOwners;
