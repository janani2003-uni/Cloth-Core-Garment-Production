import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, X, Shop } from "react-bootstrap-icons";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/shops";

function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setShops(response.data || []);
    } catch (err) {
      console.error("Fetch Shops Error:", err);
      setError(err.response?.data?.message || "Could not load shops.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (shop) => {
    try {
      await axios.put(`${API_URL}/${shop._id}/approve`);
      fetchShops();
    } catch (err) {
      alert(err.response?.data?.message || "Could not approve shop.");
    }
  };

  const handleReject = async (shop) => {
    const reason = window.prompt(`Reason for rejecting "${shop.shopName}" (required):`);
    if (reason === null) return;

    if (!reason.trim()) {
      alert("A rejection reason is required so the shop owner knows what to fix.");
      return;
    }

    try {
      await axios.put(`${API_URL}/${shop._id}/reject`, { reason });
      fetchShops();
    } catch (err) {
      alert(err.response?.data?.message || "Could not reject shop.");
    }
  };

  const handleSetCreditLimit = async (shop) => {
    const value = window.prompt(`Set credit limit for "${shop.shopName}" (LKR):`, shop.creditLimit || 0);
    if (value === null) return;

    const creditLimit = Number(value);
    if (Number.isNaN(creditLimit) || creditLimit < 0) {
      alert("Enter a valid, non-negative number.");
      return;
    }

    try {
      await axios.patch(`${API_URL}/${shop._id}/credit-limit`, { creditLimit });
      fetchShops();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update credit limit.");
    }
  };

  const handleToggleStatus = async (shop) => {
    const action = shop.isActive ? "suspend" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} "${shop.shopName}"?`)) return;

    try {
      await axios.patch(`${API_URL}/${shop._id}/status`, { isActive: !shop.isActive });
      fetchShops();
    } catch (err) {
      alert(err.response?.data?.message || `Could not ${action} shop.`);
    }
  };

  const getBadgeClass = (status) => {
    if (status === "Approved") return "admin-badge-success";
    if (status === "Rejected") return "admin-badge-danger";
    return "admin-badge-warning";
  };

  return (
    <AdminLayout>
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Shop Approvals</h2>
                <p className="admin-page-subtitle">
                  Review and approve shop-owner registrations before they can place orders.
                </p>
              </div>
            </div>

            <div className="card admin-content-card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0">
                    <thead>
                      <tr>
                        <th>Shop</th>
                        <th>Shop ID</th>
                        <th>Owner</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4" style={{ color: "var(--clothcore-danger)" }}>
                            {error}
                          </td>
                        </tr>
                      ) : shops.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5" style={{ color: "var(--clothcore-text-soft)" }}>
                            <Shop size={40} className="mb-2" style={{ opacity: 0.3 }} />
                            <div>No shop registrations yet.</div>
                          </td>
                        </tr>
                      ) : (
                        shops.map((shop) => (
                          <tr key={shop._id}>
                            <td className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>
                              {shop.shopName}
                            </td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>{shop.shopCode || "—"}</td>
                            <td>
                              {shop.ownerId
                                ? `${shop.ownerId.firstName} ${shop.ownerId.lastName}`
                                : "Unknown"}
                              <div style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>
                                {shop.ownerId?.email}
                              </div>
                            </td>
                            <td>{shop.shopAddress}</td>
                            <td>{shop.phone}</td>
                            <td>
                              <span className={`admin-badge ${getBadgeClass(shop.approvalStatus)}`}>
                                {shop.approvalStatus}
                              </span>
                              {shop.approvalStatus === "Approved" && !shop.isActive && (
                                <span className="admin-badge admin-badge-danger" style={{ marginLeft: "6px" }}>Suspended</span>
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {shop.approvalStatus === "Pending" ? (
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "linear-gradient(135deg, #1a9c5f, #158a52)", color: "white", borderRadius: "8px", border: "none", fontWeight: 600 }}
                                    onClick={() => handleApprove(shop)}
                                  >
                                    <Check size={14} /> Approve
                                  </button>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "linear-gradient(135deg, #d1495b, #b83d4d)", color: "white", borderRadius: "8px", border: "none", fontWeight: 600 }}
                                    onClick={() => handleReject(shop)}
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </div>
                              ) : shop.approvalStatus === "Approved" ? (
                                <div className="d-flex gap-2 justify-content-center">
                                  <button className="admin-link-btn" onClick={() => handleSetCreditLimit(shop)}>
                                    Credit Limit
                                  </button>
                                  <button
                                    className="admin-link-btn"
                                    style={{ color: shop.isActive ? "var(--clothcore-danger)" : "var(--clothcore-success)" }}
                                    onClick={() => handleToggleStatus(shop)}
                                  >
                                    {shop.isActive ? "Suspend" : "Reactivate"}
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }}>Rejected</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
    </AdminLayout>
  );
}

export default AdminShops;
