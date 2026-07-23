import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import {
  Wallet2,
  Clipboard,
  CheckCircle,
  Box,
  ExclamationTriangle,
  Boxes,
} from "react-bootstrap-icons";
import AdminLayout from "../../components/AdminLayout";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const REPORTS_API_URL = "http://localhost:5000/api/reports";
const PRODUCTION_STATS_URL = "http://localhost:5000/api/production/stats";
const INVENTORY_STATS_URL = "http://localhost:5000/api/inventory/stats";

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

function AdminReports() {
  const [range, setRange] = useState(defaultRange());
  const [sales, setSales] = useState(null);
  const [production, setProduction] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [salesRes, productionRes, inventoryRes] = await Promise.all([
        axios.get(REPORTS_API_URL + "/sales", { params: { from: range.from, to: range.to } }),
        axios.get(PRODUCTION_STATS_URL),
        axios.get(INVENTORY_STATS_URL),
      ]);

      setSales(salesRes.data);
      setProduction(productionRes.data);
      setInventory(inventoryRes.data);
    } catch (err) {
      console.error("Load Reports Error:", err);
      setError(err.response?.data?.message || "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getStatusBadge = (status) => {
    const map = {
      Pending: "admin-badge-warning",
      Approved: "admin-badge-info",
      Production: "admin-badge-accent",
      Delivered: "admin-badge-success",
      Cancelled: "admin-badge-danger",
    };
    return map[status] || "admin-badge-warning";
  };

  const chartData = sales
    ? {
        labels: sales.dailyRevenue.map((d) =>
          new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        ),
        datasets: [
          {
            label: "Revenue (LKR)",
            data: sales.dailyRevenue.map((d) => d.revenue),
            borderColor: "#dfb6b2",
            backgroundColor: "rgba(133,79,108,0.22)",
            fill: true,
            tension: 0.35,
            pointBackgroundColor: "#dfb6b2",
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#cdbdca" }, grid: { color: "rgba(255,255,255,0.06)" } },
      y: {
        beginAtZero: true,
        ticks: { color: "#cdbdca", callback: (v) => `LKR ${v.toLocaleString()}` },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  return (
    <AdminLayout>
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Reports</h2>
                <p className="admin-page-subtitle">
                  Sales, production and inventory reporting across the whole system.
                </p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <input
                  type="date"
                  className="form-control admin-select"
                  value={range.from}
                  max={range.to}
                  onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                  style={{ width: "160px" }}
                />
                <span style={{ color: "var(--clothcore-text-soft)" }}>to</span>
                <input
                  type="date"
                  className="form-control admin-select"
                  value={range.to}
                  min={range.from}
                  max={toDateInputValue(new Date())}
                  onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                  style={{ width: "160px" }}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
              </div>
            ) : error ? (
              <div className="card admin-content-card">
                <div className="card-body text-center py-5" style={{ color: "var(--clothcore-danger)" }}>{error}</div>
              </div>
            ) : (
              <>
                {/* Sales summary */}
                <div className="row g-3 mb-4">
                  <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card admin-stat-card">
                      <div className="card-body">
                        <div className="admin-stat-icon mb-2" style={{ background: "var(--clothcore-success-bg)", width: "40px", height: "40px" }}>
                          <Wallet2 size={18} style={{ color: "var(--clothcore-success)" }} />
                        </div>
                        <div className="admin-stat-label">Revenue (Paid)</div>
                        <div className="admin-stat-value" style={{ fontSize: "22px" }}>LKR {sales.summary.totalRevenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card admin-stat-card">
                      <div className="card-body">
                        <div className="admin-stat-icon mb-2" style={{ background: "rgba(82,43,91,0.1)", width: "40px", height: "40px" }}>
                          <Clipboard size={18} style={{ color: "var(--clothcore-blush)" }} />
                        </div>
                        <div className="admin-stat-label">Orders Placed</div>
                        <div className="admin-stat-value" style={{ fontSize: "22px" }}>{sales.summary.totalOrders}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card admin-stat-card">
                      <div className="card-body">
                        <div className="admin-stat-icon mb-2" style={{ background: "var(--clothcore-success-bg)", width: "40px", height: "40px" }}>
                          <CheckCircle size={18} style={{ color: "var(--clothcore-success)" }} />
                        </div>
                        <div className="admin-stat-label">Paid Orders</div>
                        <div className="admin-stat-value" style={{ fontSize: "22px" }}>{sales.summary.paidOrdersCount}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card admin-stat-card">
                      <div className="card-body">
                        <div className="admin-stat-icon mb-2" style={{ background: "rgba(133,79,108,0.12)", width: "40px", height: "40px" }}>
                          <Wallet2 size={18} style={{ color: "var(--clothcore-mauve)" }} />
                        </div>
                        <div className="admin-stat-label">Avg. Order Value</div>
                        <div className="admin-stat-value" style={{ fontSize: "22px" }}>LKR {sales.summary.averageOrderValue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-lg-7">
                    <div className="card admin-content-card h-100">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-blush)" }}>Revenue Trend</h5>
                        <div style={{ height: "260px" }}>
                          {chartData && <Line data={chartData} options={chartOptions} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="card admin-content-card h-100">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-blush)" }}>Orders by Status</h5>
                        <div className="table-responsive">
                          <table className="table admin-table mb-0" style={{ fontSize: "13px" }}>
                            <thead><tr><th>Status</th><th>Count</th><th>Value</th></tr></thead>
                            <tbody>
                              {sales.statusBreakdown.length === 0 ? (
                                <tr><td colSpan={3} className="text-center py-3 text-muted">No orders in this range.</td></tr>
                              ) : (
                                sales.statusBreakdown.map((s) => (
                                  <tr key={s.status}>
                                    <td><span className={`admin-badge ${getStatusBadge(s.status)}`}>{s.status}</span></td>
                                    <td>{s.count}</td>
                                    <td>LKR {Number(s.value || 0).toLocaleString()}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card admin-content-card mb-4">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-blush)" }}>Top Items (by revenue)</h5>
                    <div className="table-responsive">
                      <table className="table admin-table mb-0" style={{ fontSize: "13px" }}>
                        <thead><tr><th>Item</th><th>Quantity Sold</th><th>Revenue</th></tr></thead>
                        <tbody>
                          {sales.topItems.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-3 text-muted">No orders in this range.</td></tr>
                          ) : (
                            sales.topItems.map((item) => (
                              <tr key={item.name}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>LKR {Number(item.revenue || 0).toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Production report */}
                <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-text)" }}>Production</h5>
                <div className="row g-3 mb-4">
                  {[
                    { label: "Total Production Orders", value: production.totalOrders, icon: Box, color: "var(--clothcore-blush)", bg: "rgba(82,43,91,0.1)" },
                    { label: "In Production", value: production.inProduction, icon: Clipboard, color: "var(--clothcore-mauve)", bg: "rgba(133,79,108,0.12)" },
                    { label: "Completed", value: production.completed, icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" },
                    { label: "Avg. Progress", value: `${production.averageProgress}%`, icon: ExclamationTriangle, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
                  ].map((stat) => (
                    <div key={stat.label} className="col-xl-3 col-lg-6 col-md-6">
                      <div className="card admin-stat-card">
                        <div className="card-body">
                          <div className="admin-stat-icon mb-2" style={{ background: stat.bg, width: "40px", height: "40px" }}>
                            <stat.icon size={18} style={{ color: stat.color }} />
                          </div>
                          <div className="admin-stat-label">{stat.label}</div>
                          <div className="admin-stat-value" style={{ fontSize: "22px" }}>{stat.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inventory report */}
                <h5 className="fw-bold mb-3" style={{ color: "var(--clothcore-text)" }}>Inventory Valuation</h5>
                <div className="row g-3">
                  {[
                    { label: "Total Stock Value", value: `LKR ${Number(inventory.totalValue || 0).toLocaleString()}`, icon: Wallet2, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" },
                    { label: "In Stock (units)", value: inventory.inStock, icon: Boxes, color: "var(--clothcore-blush)", bg: "rgba(82,43,91,0.1)" },
                    { label: "Low Stock (units)", value: inventory.lowStock, icon: ExclamationTriangle, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
                    { label: "Out of Stock (items)", value: inventory.outOfStock, icon: ExclamationTriangle, color: "var(--clothcore-danger)", bg: "var(--clothcore-danger-bg)" },
                  ].map((stat) => (
                    <div key={stat.label} className="col-xl-3 col-lg-6 col-md-6">
                      <div className="card admin-stat-card">
                        <div className="card-body">
                          <div className="admin-stat-icon mb-2" style={{ background: stat.bg, width: "40px", height: "40px" }}>
                            <stat.icon size={18} style={{ color: stat.color }} />
                          </div>
                          <div className="admin-stat-label">{stat.label}</div>
                          <div className="admin-stat-value" style={{ fontSize: "22px" }}>{stat.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
    </AdminLayout>
  );
}

export default AdminReports;
