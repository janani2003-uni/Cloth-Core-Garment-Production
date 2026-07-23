// src/pages/Admin/AdminDashboard.js
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import {
  People,
  Clipboard,
  Wallet2,
  Box,
  ExclamationTriangle,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  CreditCard,
  GraphUp,
} from 'react-bootstrap-icons';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import "./AdminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DASHBOARD_URL = "http://localhost:5000/api/dashboard";
const NOTIFICATIONS_URL = "http://localhost:5000/api/notifications";
const ORDER_STATS_URL = "http://localhost:5000/api/orders/stats";
const PRODUCTION_STATS_URL = "http://localhost:5000/api/production/stats";
const INVENTORY_URL = "http://localhost:5000/api/inventory";
const SALES_REPORT_URL = "http://localhost:5000/api/reports/sales";

const ROLE_COLORS = [
  'var(--clothcore-purple)',
  'var(--clothcore-mauve)',
  'var(--clothcore-success)',
  'var(--clothcore-deep)',
  'var(--clothcore-warning)',
  'var(--clothcore-danger)',
];

const NOTIFICATION_ICONS = {
  user: { icon: '👤', color: '#522b5b' },
  staff: { icon: '🧑‍🔧', color: '#854f6c' },
  inventory: { icon: '📦', color: '#2b124c' },
  production: { icon: '🏭', color: '#854f6c' },
  order: { icon: '🧾', color: '#d98324' },
  payment: { icon: '💳', color: '#1a9c5f' },
  ticket: { icon: '💬', color: '#be185d' },
  system: { icon: '⚙️', color: '#6b5b73' },
};

const CHART_RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
];

function formatRelativeTime(dateString) {
  if (!dateString) return "";

  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function rangeToDates(days) {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      products: 0,
      lowStockItems: 0,
    },
    trends: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      lowStockItems: 0,
    },
    paymentTotals: { verified: 0, submitted: 0, rejected: 0 },
    recentOrders: [],
    topProducts: [],
    roleDistribution: [],
  });
  const [orderStats, setOrderStats] = useState({ pending: 0, inProduction: 0 });
  const [productionStats, setProductionStats] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activities, setActivities] = useState([]);

  const [chartRange, setChartRange] = useState('7d');
  const [salesReport, setSalesReport] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(DASHBOARD_URL);

      setDashboardData({
        stats: response.data.stats,
        trends: response.data.trends,
        paymentTotals: response.data.paymentTotals,
        recentOrders: response.data.recentOrders || [],
        topProducts: response.data.topProducts || [],
        roleDistribution: response.data.roleDistribution || [],
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.response?.data?.message || "Could not load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSupplementaryData = useCallback(async () => {
    const [ordersRes, productionRes, inventoryRes] = await Promise.allSettled([
      axios.get(ORDER_STATS_URL),
      axios.get(PRODUCTION_STATS_URL),
      axios.get(INVENTORY_URL),
    ]);

    if (ordersRes.status === "fulfilled") {
      setOrderStats({
        pending: ordersRes.value.data.pending || 0,
        inProduction: ordersRes.value.data.inProduction || 0,
      });
    }

    if (productionRes.status === "fulfilled") {
      setProductionStats(productionRes.value.data);
    }

    if (inventoryRes.status === "fulfilled") {
      setInventoryItems(Array.isArray(inventoryRes.value.data) ? inventoryRes.value.data : []);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const response = await axios.get(NOTIFICATIONS_URL);
      const recent = (response.data || []).slice(0, 5);

      setActivities(
        recent.map((notification) => {
          const iconInfo = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;

          return {
            icon: iconInfo.icon,
            color: iconInfo.color,
            text: notification.title,
            time: formatRelativeTime(notification.createdAt),
          };
        })
      );
    } catch (err) {
      console.error("Activity Fetch Error:", err);
    }
  }, []);

  const fetchSalesReport = useCallback(async (rangeKey) => {
    try {
      setChartLoading(true);
      const rangeDef = CHART_RANGES.find((r) => r.key === rangeKey) || CHART_RANGES[0];
      const { from, to } = rangeToDates(rangeDef.days);

      const response = await axios.get(SALES_REPORT_URL, { params: { from, to } });
      setSalesReport(response.data);
    } catch (err) {
      console.error("Sales Report Fetch Error:", err);
      setSalesReport(null);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchSupplementaryData();
    fetchActivity();
  }, [fetchDashboardData, fetchSupplementaryData, fetchActivity]);

  useEffect(() => {
    fetchSalesReport(chartRange);
  }, [chartRange, fetchSalesReport]);

  const trendLabel = (value) => `${value >= 0 ? '+' : ''}${value}%`;

  const stats = [
    {
      label: "Total Users",
      value: dashboardData.stats.totalUsers.toLocaleString(),
      change: trendLabel(dashboardData.trends.totalUsers),
      trend: dashboardData.trends.totalUsers >= 0 ? "up" : "down",
      icon: People,
      color: "var(--clothcore-mauve)",
      bg: "rgba(133,79,108,0.1)",
    },
    {
      label: "Total Orders",
      value: dashboardData.stats.totalOrders.toLocaleString(),
      change: trendLabel(dashboardData.trends.totalOrders),
      trend: dashboardData.trends.totalOrders >= 0 ? "up" : "down",
      icon: Clipboard,
      color: "var(--clothcore-blush)",
      bg: "rgba(223,182,178,0.32)",
    },
    {
      label: "Total Revenue",
      value: `LKR ${dashboardData.stats.totalRevenue.toLocaleString()}`,
      change: trendLabel(dashboardData.trends.totalRevenue),
      trend: dashboardData.trends.totalRevenue >= 0 ? "up" : "down",
      icon: Wallet2,
      color: "var(--clothcore-success)",
      bg: "var(--clothcore-success-bg)",
    },
    {
      label: "Products",
      value: dashboardData.stats.products.toLocaleString(),
      secondaryLabel: "Active products",
      icon: Box,
      color: "var(--clothcore-blush)",
      bg: "rgba(82,43,91,0.08)",
    },
    {
      label: "Low Stock Items",
      value: dashboardData.stats.lowStockItems.toLocaleString(),
      change: trendLabel(dashboardData.trends.lowStockItems),
      trend: dashboardData.trends.lowStockItems <= 0 ? "up" : "down",
      icon: ExclamationTriangle,
      color: "var(--clothcore-warning)",
      bg: "var(--clothcore-warning-bg)",
    },
    {
      label: "Pending Payment Verification",
      value: `LKR ${dashboardData.paymentTotals.submitted.toLocaleString()}`,
      secondaryLabel: "Awaiting review",
      icon: CreditCard,
      color: "var(--clothcore-mauve)",
      bg: "rgba(133,79,108,0.16)",
    },
  ];

  const getOrderStatusColor = (status) => {
    // Literal hex (not CSS vars) because these get an alpha suffix appended
    // below (e.g. `${statusColor}20`) to build translucent badge backgrounds.
    // Brightened for readability as text on a dark card background.
    const colors = {
      Pending: "#ffc07a",
      Approved: "#dfb6b2",
      Production: "#e4b6d1",
      Delivered: "#8eddb3",
      Cancelled: "#ff9ba5",
    };

    return colors[status] || "#cdbdca";
  };

  const formatOrderDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const recentOrders = dashboardData.recentOrders.map((order) => ({
    id: order.orderId || "N/A",
    customer: order.customerName || "Unknown Customer",
    amount: `LKR ${Number(order.totalAmount || 0).toLocaleString()}`,
    status: order.status || "Pending",
    statusColor: getOrderStatusColor(order.status),
    date: formatOrderDate(order.createdAt),
  }));

  const topProducts = dashboardData.topProducts.map((product) => ({
    name: product.name,
    sold: product.sold,
    revenue: `LKR ${Number(product.revenue || 0).toLocaleString()}`,
  }));

  const roles = dashboardData.roleDistribution.map((role, index) => ({
    name: role.name,
    count: role.count,
    percentage: role.percentage,
    color: ROLE_COLORS[index % ROLE_COLORS.length],
  }));

  const lowStockList = inventoryItems
    .filter((item) => item.status === "Low Stock" || item.status === "Out of Stock")
    .sort((a, b) => Number(a.stockQuantity || 0) - Number(b.stockQuantity || 0))
    .slice(0, 5);

  const productionStages = (productionStats?.progressDistribution || [])
    .filter((stage) => !stage.label.startsWith("Not Started"))
    .map((stage) => ({
      ...stage,
      percentage:
        productionStats.totalOrders > 0
          ? Math.round((stage.count / productionStats.totalOrders) * 100)
          : 0,
    }));

  const chartData = salesReport
    ? {
        labels: salesReport.dailyRevenue.map((d) =>
          new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        ),
        datasets: [
          {
            label: "Revenue (LKR)",
            data: salesReport.dailyRevenue.map((d) => d.revenue),
            borderColor: "#dfb6b2",
            backgroundColor: "rgba(133,79,108,0.22)",
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: "#dfb6b2",
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#3a2141",
        titleColor: "#fbe4d8",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => `LKR ${Number(ctx.parsed.y).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#cdbdca", font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "#cdbdca",
          font: { size: 11 },
          callback: (v) => (v >= 1000 ? `${v / 1000}k` : v),
        },
      },
    },
  };

  const hasRevenue = salesReport && salesReport.dailyRevenue.some((d) => d.revenue > 0);
  const activeRangeLabel = CHART_RANGES.find((r) => r.key === chartRange)?.label || "7D";

  return (
    <AdminLayout contentClassName="dashboard-page">
            {/* Page Header */}
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title">Dashboard</h2>
                <p className="admin-page-subtitle">
                  Monitor your garment production, orders and inventory performance.
                </p>
              </div>
            </div>

            {error && (
              <div className="dashboard-error-banner mb-4">
                <ExclamationTriangle size={16} />
                <span>{error}</span>
                <button className="admin-link-btn ms-auto" onClick={fetchDashboardData}>Retry</button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="col-xl-2 col-lg-4 col-md-6 col-sm-12">
                      <div className="card admin-stat-card dashboard-stat-skeleton">
                        <div className="card-body p-4">
                          <div className="skeleton-line skeleton-line-sm" />
                          <div className="skeleton-line skeleton-line-lg" />
                        </div>
                      </div>
                    </div>
                  ))
                : stats.map((stat, index) => (
                    <div key={index} className="col-xl-2 col-lg-4 col-md-6 col-sm-12">
                      <div className="card admin-stat-card">
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="admin-stat-label">
                                {stat.label}
                              </div>
                              <div className="admin-stat-value">
                                {stat.value}
                              </div>
                            </div>
                            <div className="admin-stat-icon" style={{ background: stat.bg }}>
                              <stat.icon size={20} style={{ color: stat.color }} />
                            </div>
                          </div>
                          {stat.change ? (
                            <div className="d-flex align-items-center mt-1">
                              {stat.trend === 'up' ? (
                                <ArrowUp size={13} color="var(--clothcore-success)" />
                              ) : (
                                <ArrowDown size={13} color="var(--clothcore-danger)" />
                              )}
                              <span className="dashboard-trend-value" style={{
                                color: stat.trend === 'up' ? "var(--clothcore-success)" : "var(--clothcore-danger)",
                              }}>
                                {stat.change}
                              </span>
                              <span className="dashboard-trend-caption">vs last 30 days</span>
                            </div>
                          ) : (
                            <div className="dashboard-trend-caption mt-1">{stat.secondaryLabel}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            <div className="row g-3">
              {/* Chart Section */}
              <div className="col-lg-8">
                <div className="card admin-content-card" style={{ height: "100%" }}>
                  <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h5 className="admin-content-card-title">Sales Overview</h5>
                      <span className="dashboard-card-subtitle">Paid revenue over time</span>
                    </div>
                    <div className="dashboard-range-toggle">
                      {CHART_RANGES.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          className={`dashboard-range-btn ${chartRange === r.key ? "is-active" : ""}`}
                          onClick={() => setChartRange(r.key)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div style={{ height: "280px" }}>
                      {chartLoading ? (
                        <div className="dashboard-chart-empty">
                          <div className="spinner-border" style={{ color: "var(--clothcore-blush)" }} role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : hasRevenue ? (
                        <Line data={chartData} options={chartOptions} />
                      ) : (
                        <div className="dashboard-chart-empty">
                          <GraphUp size={30} />
                          <p className="mb-0 mt-2 fw-semibold">No paid revenue recorded for this period.</p>
                          <p className="mb-0 dashboard-card-subtitle">Try a wider date range or check back once payments are verified.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* This Range Summary */}
              <div className="col-lg-4">
                <div className="card admin-content-card" style={{ height: "100%" }}>
                  <div className="card-header">
                    <h5 className="admin-content-card-title">Last {activeRangeLabel} Summary</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="dashboard-summary-hero">
                      <div className="dashboard-card-subtitle">Revenue</div>
                      <div className="dashboard-summary-value">
                        LKR {(salesReport?.summary.totalRevenue || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="dashboard-summary-list">
                      <div className="dashboard-summary-row">
                        <span>Total Orders</span>
                        <strong>{salesReport?.summary.totalOrders || 0}</strong>
                      </div>
                      <div className="dashboard-summary-row">
                        <span>Avg. Order Value</span>
                        <strong>LKR {(salesReport?.summary.averageOrderValue || 0).toLocaleString()}</strong>
                      </div>
                      <div className="dashboard-summary-row">
                        <span>Pending Approvals</span>
                        <strong style={{ color: "var(--clothcore-warning)" }}>{orderStats.pending}</strong>
                      </div>
                      <div className="dashboard-summary-row">
                        <span>Orders In Production</span>
                        <strong style={{ color: "var(--clothcore-mauve)" }}>{orderStats.inProduction}</strong>
                      </div>
                      <div className="dashboard-summary-row">
                        <span>Low Stock Items</span>
                        <strong style={{ color: "var(--clothcore-warning)" }}>
                          {dashboardData.stats.lowStockItems}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders & Production Status */}
            <div className="row g-3 mt-3">
              <div className="col-lg-8">
                <div className="card admin-content-card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="admin-content-card-title">Recent Orders</h5>
                    <button
                      className="btn btn-sm admin-link-btn"
                      onClick={() => navigate('/admin/orders')}
                    >
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover admin-table mb-0">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-4" style={{ color: "var(--clothcore-text-soft)" }}>
                                No orders yet.
                              </td>
                            </tr>
                          ) : recentOrders.map((order, index) => (
                            <tr key={index}>
                              <td>
                                <span className="fw-bold" style={{ color: "var(--clothcore-blush)", fontSize: "13px" }}>
                                  {order.id}
                                </span>
                              </td>
                              <td>{order.customer}</td>
                              <td className="fw-bold">{order.amount}</td>
                              <td>
                                <span className="admin-badge" style={{
                                  background: `${order.statusColor}20`,
                                  color: order.statusColor,
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="text-muted" style={{ fontSize: "13px" }}>{order.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card admin-content-card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="admin-content-card-title">Production Status</h5>
                    <button className="btn btn-sm admin-link-btn" onClick={() => navigate('/production')}>
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="card-body p-4">
                    {productionStages.length === 0 ? (
                      <p className="dashboard-card-subtitle mb-0">No production orders yet.</p>
                    ) : productionStages.map((stage) => (
                      <div key={stage.label} className="dashboard-progress-row">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="dashboard-progress-label">{stage.label.replace(/\s*\(.*\)/, "")}</span>
                          <span className="dashboard-progress-count">{stage.count}</span>
                        </div>
                        <div className="dashboard-progress-track">
                          <div
                            className="dashboard-progress-fill"
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock, Top Products & Role Distribution */}
            <div className="row g-3 mt-3">
              <div className="col-lg-4">
                <div className="card admin-content-card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="admin-content-card-title">Low Stock Summary</h5>
                    <button className="btn btn-sm admin-link-btn" onClick={() => navigate('/inventory')}>
                      View Inventory
                    </button>
                  </div>
                  <div className="card-body p-4">
                    {lowStockList.length === 0 ? (
                      <p className="dashboard-card-subtitle mb-0">All items are sufficiently stocked.</p>
                    ) : lowStockList.map((item) => (
                      <div key={item._id} className="dashboard-lowstock-row">
                        <div>
                          <div className="dashboard-lowstock-name">{item.itemName}</div>
                          <div className="dashboard-card-subtitle">
                            {item.stockQuantity} / {item.minimumStock} {item.unit}
                          </div>
                        </div>
                        <span className={`admin-badge ${item.status === "Out of Stock" ? "admin-badge-danger" : "admin-badge-warning"}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card admin-content-card">
                  <div className="card-header">
                    <h5 className="admin-content-card-title">Top Items by Quantity Sold</h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table admin-table mb-0">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th className="text-center">Sold</th>
                            <th className="text-end">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="text-center py-4" style={{ color: "var(--clothcore-text-soft)" }}>
                                No orders yet.
                              </td>
                            </tr>
                          ) : topProducts.map((product, index) => (
                            <tr key={index}>
                              <td>
                                <span className="fw-medium">{product.name}</span>
                              </td>
                              <td className="text-center fw-bold">{product.sold}</td>
                              <td className="text-end fw-bold" style={{ color: "var(--clothcore-success)" }}>
                                {product.revenue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card admin-content-card">
                  <div className="card-header">
                    <h5 className="admin-content-card-title">User Role Distribution</h5>
                  </div>
                  <div className="card-body p-4">
                    {roles.length === 0 ? (
                      <p className="dashboard-card-subtitle mb-0">No users yet.</p>
                    ) : roles.map((role, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>{role.name}</span>
                          <span className="fw-bold" style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>
                            {role.count} <span className="dashboard-card-subtitle">({role.percentage}%)</span>
                          </span>
                        </div>
                        <div className="dashboard-progress-track">
                          <div
                            className="dashboard-progress-fill"
                            style={{ width: `${role.percentage}%`, background: role.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* System Activity */}
            <div className="row g-3 mt-3">
              <div className="col-12">
                <div className="card admin-content-card">
                  <div className="card-header">
                    <h5 className="admin-content-card-title">System Activity</h5>
                  </div>
                  <div className="card-body p-4">
                    {activities.length === 0 ? (
                      <p className="dashboard-card-subtitle mb-0">No recent activity.</p>
                    ) : (
                      <div className="row g-3">
                        {activities.map((activity, index) => (
                          <div key={index} className="col-md-6 col-lg-4 col-xl">
                            <div className="d-flex align-items-start">
                              <div className="dashboard-activity-icon" style={{ background: `${activity.color}15` }}>
                                {activity.icon}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "13px", color: "var(--clothcore-text)" }}>
                                  {activity.text}
                                </div>
                                <div className="dashboard-card-subtitle">{activity.time}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

    </AdminLayout>
  );
}

export default AdminDashboard;
