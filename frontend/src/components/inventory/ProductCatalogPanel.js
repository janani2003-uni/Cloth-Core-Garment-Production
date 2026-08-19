// src/components/inventory/ProductCatalogPanel.js
// Product Catalog management — garment types, their fabrics, colors and
// base pricing (backend/routes/productRoutes.js). Order Step 1 reads
// GET /api/products; this is where Admin edits what it sees.
//
// Formerly its own sidebar page (AdminProductCatalog.js) — folded into the
// Inventory page as a tab so garment-type catalog, size-level stock and raw
// materials all live in one place. The API it talks to is unchanged.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Bag,
  PlusCircle,
  Pencil,
  Trash,
  Fire,
  CheckCircle,
  XCircle,
  PlusLg,
  Dash,
} from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/products";

const IMAGE_KEY_OPTIONS = [
  { value: "", label: "None (generic icon)" },
  { value: "denim", label: "Denim photo" },
  { value: "shirt", label: "Shirt photo" },
  { value: "tshirt", label: "T-Shirt photo" },
  { value: "hoodie", label: "Hoodie photo" },
];

const emptyFabric = () => ({ id: "", label: "", tag: "", delta: 0 });
const emptyColor = () => ({ id: "", label: "", hex: "#000000" });

const TYPE_OPTIONS = ["Top Wear", "Bottom Wear"];

const emptyForm = {
  name: "",
  category: "",
  type: "Top Wear",
  imageKey: "",
  basePrice: "",
  popular: false,
  isActive: true,
  displayOrder: 0,
  fabrics: [emptyFabric()],
  colors: [emptyColor()],
};

function ProductCatalogPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_URL}/all`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Fetch Products Error:", err);
      setError(err.response?.data?.message || "Could not load the product catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category || "",
      type: product.type || "Top Wear",
      imageKey: product.imageKey || "",
      basePrice: product.basePrice ?? "",
      popular: Boolean(product.popular),
      isActive: product.isActive !== false,
      displayOrder: product.displayOrder ?? 0,
      fabrics: product.fabrics?.length ? product.fabrics.map((f) => ({ ...f })) : [emptyFabric()],
      colors: product.colors?.length ? product.colors.map((c) => ({ ...c })) : [emptyColor()],
    });
    setFormError("");
    setShowModal(true);
  };

  const updateFabric = (index, field, value) => {
    setForm((f) => ({
      ...f,
      fabrics: f.fabrics.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  const updateColor = (index, field, value) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (form.basePrice === "" || Number(form.basePrice) < 0) {
      setFormError("A valid base price is required.");
      return;
    }

    const fabrics = form.fabrics
      .filter((f) => f.id.trim() && f.label.trim())
      .map((f) => ({ id: f.id.trim(), label: f.label.trim(), tag: f.tag?.trim() || "", delta: Number(f.delta) || 0 }));

    const colors = form.colors
      .filter((c) => c.id.trim() && c.label.trim() && c.hex.trim())
      .map((c) => ({ id: c.id.trim(), label: c.label.trim(), hex: c.hex.trim() }));

    if (fabrics.length === 0) {
      setFormError("At least one fabric option is required.");
      return;
    }
    if (colors.length === 0) {
      setFormError("At least one color option is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      type: form.type,
      imageKey: form.imageKey,
      basePrice: Number(form.basePrice),
      popular: form.popular,
      isActive: form.isActive,
      displayOrder: Number(form.displayOrder) || 0,
      fabrics,
      colors,
    };

    try {
      setSaving(true);
      setFormError("");
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      setShowModal(false);
      await fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save this product.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      setBusyId(product._id);
      await axios.put(`${API_URL}/${product._id}`, { isActive: !product.isActive });
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update the product.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}" from the catalog? This cannot be undone.`)) return;
    try {
      setBusyId(product._id);
      await axios.delete(`${API_URL}/${product._id}`);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete this product.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Bag size={22} /> Product Catalog
          </h2>
          <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>
            The garment types, fabrics, colors and base pricing shop owners choose from in Step 1 of placing an order.
          </p>
        </div>
        <button className="admin-btn-primary" onClick={openCreate}>
          <PlusCircle size={16} /> New Product
        </button>
      </div>

      <div className="admin-content-card">
        <div className="table-responsive">
          <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>Garment</th>
                <th>Category</th>
                <th>Type</th>
                <th>Base Price</th>
                <th>Fabrics</th>
                <th>Colors</th>
                <th>Popular</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-5"><div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} /></td></tr>
              ) : error ? (
                <tr><td colSpan={9} className="text-center py-5">
                  <div style={{ color: "var(--clothcore-danger)", marginBottom: "10px" }}>{error}</div>
                  <button className="admin-btn-secondary" onClick={fetchProducts}>Retry</button>
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="p-0">
                  <div className="admin-empty-state" style={{ border: "none", borderRadius: 0 }}>
                    <Bag size={36} className="admin-empty-state-icon" />
                    <div className="admin-empty-state-title">No garment types yet</div>
                    <div className="admin-empty-state-message">Add one so shop owners have something to choose from at Step 1.</div>
                  </div>
                </td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} style={{ opacity: p.isActive === false ? 0.6 : 1 }}>
                    <td style={{ fontWeight: 700, color: "var(--clothcore-text)" }}>{p.name}</td>
                    <td style={{ color: "var(--clothcore-text-soft)" }}>{p.category || "—"}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px", fontWeight: 700,
                          color: p.type === "Bottom Wear" ? "#854f6c" : "#522b5b",
                          background: p.type === "Bottom Wear" ? "rgba(133,79,108,0.12)" : "rgba(82,43,91,0.1)",
                          borderRadius: "20px", padding: "3px 10px", whiteSpace: "nowrap",
                        }}
                      >
                        {p.type || "Top Wear"}
                      </span>
                    </td>
                    <td>Rs. {Number(p.basePrice || 0).toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "220px" }}>
                        {(p.fabrics || []).map((f) => (
                          <span
                            key={f.id}
                            title={f.tag || f.label}
                            style={{
                              fontSize: "10.5px", fontWeight: 600, color: "var(--clothcore-purple)",
                              background: "rgba(82,43,91,0.08)", borderRadius: "20px", padding: "2px 8px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {f.label}
                          </span>
                        ))}
                        {(!p.fabrics || p.fabrics.length === 0) && <span style={{ color: "var(--clothcore-text-muted)", fontSize: "12px" }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {(p.colors || []).slice(0, 6).map((c) => (
                          <span
                            key={c.id}
                            title={c.label}
                            style={{
                              width: "14px", height: "14px", borderRadius: "50%",
                              background: c.hex, border: "1px solid rgba(0,0,0,0.15)",
                            }}
                          />
                        ))}
                        {p.colors?.length > 6 && <span style={{ fontSize: "11px", color: "var(--clothcore-text-soft)" }}>+{p.colors.length - 6}</span>}
                      </div>
                    </td>
                    <td>{p.popular ? <Fire size={16} color="#d98324" /> : <Fire size={16} color="var(--clothcore-text-muted)" style={{ opacity: 0.3 }} />}</td>
                    <td>
                      <span className={`admin-badge ${p.isActive === false ? "admin-badge-danger" : "admin-badge-success"}`}>
                        {p.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="admin-link-btn" onClick={() => openEdit(p)}><Pencil size={13} /></button>
                        <button
                          className="admin-link-btn"
                          disabled={busyId === p._id}
                          onClick={() => handleToggleActive(p)}
                          title={p.isActive === false ? "Activate" : "Deactivate"}
                        >
                          {p.isActive === false ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        </button>
                        <button
                          className="admin-link-btn"
                          style={{ color: "var(--clothcore-danger)" }}
                          disabled={busyId === p._id}
                          onClick={() => handleDelete(p)}
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, overflowY: "auto" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-purple)" }}>
                  {editingId ? "Edit Product" : "New Product"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body" style={{ padding: "20px 24px" }}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Name *</label>
                      <input className="form-control admin-select" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Jacket" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Category</label>
                      <input className="form-control admin-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Casual" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Type *</label>
                      <select className="form-select admin-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                        {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Base Price (Rs.) *</label>
                      <input type="number" min="0" className="form-control admin-select" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Photo</label>
                      <select className="form-select admin-select" value={form.imageKey} onChange={(e) => setForm((f) => ({ ...f, imageKey: e.target.value }))}>
                        {IMAGE_KEY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Display Order</label>
                      <input type="number" className="form-control admin-select" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} />
                    </div>
                    <div className="col-md-6 d-flex align-items-center gap-2 pt-2">
                      <input type="checkbox" id="popular-check" checked={form.popular} onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))} />
                      <label htmlFor="popular-check" style={{ fontSize: "13px", marginBottom: 0 }}>Show "POPULAR" badge</label>
                    </div>
                    <div className="col-md-6 d-flex align-items-center gap-2 pt-2">
                      <input type="checkbox" id="active-check" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                      <label htmlFor="active-check" style={{ fontSize: "13px", marginBottom: 0 }}>Active (visible to shop owners)</label>
                    </div>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0" style={{ fontSize: "13px" }}>Fabrics *</label>
                    <button type="button" className="admin-link-btn" onClick={() => setForm((f) => ({ ...f, fabrics: [...f.fabrics, emptyFabric()] }))}>
                      <PlusLg size={12} /> Add fabric
                    </button>
                  </div>
                  {form.fabrics.map((row, i) => (
                    <div className="row g-2 mb-2 align-items-center" key={i}>
                      <div className="col-3">
                        <input className="form-control admin-select" placeholder="id (e.g. cotton)" value={row.id} onChange={(e) => updateFabric(i, "id", e.target.value)} style={{ fontSize: "12px" }} />
                      </div>
                      <div className="col-3">
                        <input className="form-control admin-select" placeholder="Label" value={row.label} onChange={(e) => updateFabric(i, "label", e.target.value)} style={{ fontSize: "12px" }} />
                      </div>
                      <div className="col-3">
                        <input className="form-control admin-select" placeholder="Tag (optional)" value={row.tag} onChange={(e) => updateFabric(i, "tag", e.target.value)} style={{ fontSize: "12px" }} />
                      </div>
                      <div className="col-2">
                        <input type="number" className="form-control admin-select" placeholder="+Rs." value={row.delta} onChange={(e) => updateFabric(i, "delta", e.target.value)} style={{ fontSize: "12px" }} />
                      </div>
                      <div className="col-1">
                        <button type="button" className="admin-link-btn" style={{ color: "var(--clothcore-danger)" }} onClick={() => setForm((f) => ({ ...f, fabrics: f.fabrics.filter((_, idx) => idx !== i) }))}>
                          <Dash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <hr />

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0" style={{ fontSize: "13px" }}>Colors *</label>
                    <button type="button" className="admin-link-btn" onClick={() => setForm((f) => ({ ...f, colors: [...f.colors, emptyColor()] }))}>
                      <PlusLg size={12} /> Add color
                    </button>
                  </div>
                  {form.colors.map((row, i) => (
                    <div className="row g-2 mb-2 align-items-center" key={i}>
                      <div className="col-3">
                        <input className="form-control admin-select" placeholder="id (e.g. navy)" value={row.id} onChange={(e) => updateColor(i, "id", e.target.value)} style={{ fontSize: "12px" }} />
                      </div>
                      <div className="col-4">
                        <input className="form-control admin-select" placeholder="Label" value={row.label} onChange={(e) => updateColor(i, "label", e.target.value)} style={{ fontSize: "12px" }} />
                      </div>
                      <div className="col-3 d-flex align-items-center gap-2">
                        <input type="color" value={row.hex} onChange={(e) => updateColor(i, "hex", e.target.value)} style={{ width: "36px", height: "32px", padding: 0, border: "1px solid var(--clothcore-border)", borderRadius: "6px" }} />
                        <input className="form-control admin-select" value={row.hex} onChange={(e) => updateColor(i, "hex", e.target.value)} style={{ fontSize: "12px" }} />
                      </div>
                      <div className="col-2">
                        <button type="button" className="admin-link-btn" style={{ color: "var(--clothcore-danger)" }} onClick={() => setForm((f) => ({ ...f, colors: f.colors.filter((_, idx) => idx !== i) }))}>
                          <Dash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formError && <div className="mt-3" style={{ color: "var(--clothcore-danger)", fontSize: "13px" }}>{formError}</div>}
                </div>
                <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                  <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                  <button type="submit" className="admin-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCatalogPanel;
