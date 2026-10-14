import React, { useState, useEffect } from 'react';
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import ActionMenu from "../../components/ActionMenu";
import OrderDetailsModal from "../../components/OrderDetailsModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import {
  Search,
  Eye,
  Printer,
  XCircle as XCircleIcon,
  Filter,
  Clipboard,
  HourglassSplit,
  Truck,
  CheckCircle,
} from 'react-bootstrap-icons';
import { API_BASE_URL } from "../../utils/apiConfig";

const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;

function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPayment, setSelectedPayment] = useState('All Payment');
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pending: 0,
    approved: 0,
    inProduction: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  const [viewingOrderId, setViewingOrderId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingInvoiceFor, setDownloadingInvoiceFor] = useState(null);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axios.get(ORDERS_API_URL);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Load Orders Error:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${ORDERS_API_URL}/stats`);
      setOrderStats(res.data);
    } catch (err) {
      console.error("Load Order Stats Error:", err);
    }
  };

  const formatOrderDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const stats = [
    { label: "Total Orders", value: orderStats.totalOrders.toLocaleString(), icon: Clipboard, color: "var(--clothcore-purple)", bg: "rgba(82,43,91,0.1)" },
    { label: "Pending", value: orderStats.pending.toLocaleString(), icon: HourglassSplit, color: "var(--clothcore-warning)", bg: "var(--clothcore-warning-bg)" },
    { label: "In Production", value: orderStats.inProduction.toLocaleString(), icon: Truck, color: "var(--clothcore-mauve)", bg: "rgba(133,79,108,0.12)" },
    { label: "Delivered", value: orderStats.delivered.toLocaleString(), icon: CheckCircle, color: "var(--clothcore-success)", bg: "var(--clothcore-success-bg)" },
    { label: "Cancelled", value: orderStats.cancelled.toLocaleString(), icon: XCircleIcon, color: "var(--clothcore-danger)", bg: "var(--clothcore-danger-bg)" },
  ];

  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch =
      (order.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || order.status === selectedStatus;
    const matchesPayment = selectedPayment === 'All Payment' || order.paymentStatus === selectedPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // All filtered orders render at once now — the table scrolls internally
  // (see the fitScreen card below) instead of paginating.
  const currentOrders = filteredOrders;

  const getStatusBadgeClass = (status) => {
    const classes = {
      Pending: 'admin-badge-warning',
      Approved: 'admin-badge-info',
      Production: 'admin-badge-accent',
      'In Delivery': 'admin-badge-accent',
      Delivered: 'admin-badge-success',
      Cancelled: 'admin-badge-danger',
    };
    return classes[status] || 'admin-badge-warning';
  };

  const getPaymentBadgeClass = (payment) => {
    const classes = {
      'Full Paid': 'admin-badge-success',
      'Advance Paid': 'admin-badge-accent',
      Pending: 'admin-badge-warning',
    };
    return classes[payment] || 'admin-badge-warning';
  };

  const statuses = ['All Status', 'Pending', 'Approved', 'Production', 'In Delivery', 'Delivered', 'Cancelled'];
  const payments = ['All Payment', 'Pending', 'Advance Paid', 'Full Paid'];

  // Kept for the "Send to Production" contextual button inside View
  // Details — this is the one real entry point for the transition
  // (Admin Production has no separate "create from approved order" flow).
  const sendToProduction = async (order) => {
    try {
      await axios.put(`${ORDERS_API_URL}/${order._id}`, { status: 'Production' });
      await loadOrders();
      await loadStats();
      setViewingOrderId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send order to production.');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await axios.put(`${ORDERS_API_URL}/${cancelTarget._id}`, { status: 'Cancelled' });
      await loadOrders();
      await loadStats();
      setCancelTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  // Real PDF download (reuses the same order-receipt PDF generator the
  // Shop Owner's Order Confirmation page uses — Admin already has access to
  // any order's receipt) rather than window.print().
  const printInvoice = async (order) => {
    setDownloadingInvoiceFor(order._id);
    try {
      const res = await axios.get(`${ORDERS_API_URL}/${order._id}/receipt.pdf`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `ClothCore-Invoice-${order.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice PDF.');
    } finally {
      setDownloadingInvoiceFor(null);
    }
  };

  return (
    <AdminLayout fitScreen>

            {/* Page Header — kept compact (page-local override, not a
                change to the shared .admin-page-header class other pages
                also use) so the order table below gets most of the screen. */}
            <div className="admin-page-header" style={{ flexShrink: 0, padding: "14px 22px", marginBottom: "8px" }}>
              <div>
                <h2 className="admin-page-title" style={{ fontSize: '18px' }}>Orders Management</h2>
                <p className="admin-page-subtitle" style={{ fontSize: "12px" }}>
                  Manage customer orders and track their status
                </p>
              </div>
            </div>

            {/* Stats Cards — compact strip */}
            <div className="row g-2 mb-2" style={{ flexShrink: 0 }}>
              {stats.map((stat, index) => (
                <div key={index} className="col-xl-2 col-lg-3 col-md-6 col-sm-12">
                  <div className="card admin-stat-card">
                    <div className="card-body px-3 py-2">
                      <div className="admin-stat-icon mb-1" style={{ background: stat.bg, width: "28px", height: "28px" }}>
                        <stat.icon size={14} style={{ color: stat.color }} />
                      </div>
                      <div className="admin-stat-label" style={{ fontSize: "11px" }}>{stat.label}</div>
                      <div className="admin-stat-value" style={{ fontSize: "16px" }}>{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Orders Table Card — fills the remaining screen space; only
                the table body scrolls internally once it overflows. */}
            <div className="card admin-content-card d-flex flex-column" style={{ flex: 1, minHeight: 0 }}>
              <div className="card-body" style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Search and Filters */}
                <div style={{ marginBottom: "16px", flexShrink: 0 }}>
                  <div className="row g-2">
                    <div className="col-md-5">
                      <div className="position-relative">
                        <Search
                          size={16}
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--clothcore-text-soft)"
                          }}
                        />
                        <input
                          type="text"
                          className="form-control admin-select"
                          placeholder="Search by Order ID or Customer..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                          }}
                          style={{ paddingLeft: "36px", height: "38px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select admin-select"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                        }}
                        style={{ height: "38px" }}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select admin-select"
                        value={selectedPayment}
                        onChange={(e) => {
                          setSelectedPayment(e.target.value);
                        }}
                        style={{ height: "38px" }}
                      >
                        {payments.map(payment => (
                          <option key={payment} value={payment}>{payment}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn w-100 admin-select"
                        style={{
                          background: "rgba(82,43,91,0.06)",
                          color: "var(--clothcore-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          height: "38px"
                        }}
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('All Status');
                          setSelectedPayment('All Payment');
                        }}
                      >
                        <Filter size={14} />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px", minWidth: "900px" }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>QUANTITY</th>
                        <th>ORDER DATE</th>
                        <th>PAYMENT</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: "center" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-5" style={{ color: "var(--clothcore-text-soft)" }}>
                            <Clipboard size={40} style={{ opacity: 0.3, marginBottom: "10px" }} />
                            <div style={{ fontWeight: 600 }}>No orders found</div>
                            <div style={{ fontSize: "13px", marginTop: "4px" }}>
                              {searchTerm || selectedStatus !== 'All Status' || selectedPayment !== 'All Payment'
                                ? "Try adjusting your search or filters."
                                : "Orders placed by shop owners will appear here."}
                            </div>
                          </td>
                        </tr>
                      ) : currentOrders.map((order, index) => (
                          <tr key={order._id}>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>
                              {index + 1}
                            </td>
                            <td style={{ fontWeight: "600", color: "var(--clothcore-purple)" }}>
                              {order.orderId}
                            </td>
                            <td>{order.customerName || <span style={{ fontStyle: "italic", color: "var(--clothcore-text-soft)" }}>Legacy order data incomplete</span>}</td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>{order.quantity}</td>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>{formatOrderDate(order.createdAt)}</td>
                            <td>
                              <span className={`admin-badge ${getPaymentBadgeClass(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <span className={`admin-badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <ActionMenu
                                ariaLabel={`Actions for order ${order.orderId}`}
                                items={[
                                  {
                                    label: "View Details",
                                    icon: <Eye size={14} color="var(--clothcore-purple)" />,
                                    onClick: () => setViewingOrderId(order._id),
                                  },
                                  {
                                    label: downloadingInvoiceFor === order._id ? "Preparing PDF…" : "Print Invoice",
                                    icon: <Printer size={14} color="var(--clothcore-purple)" />,
                                    onClick: () => printInvoice(order),
                                  },
                                  {
                                    label: "Cancel Order",
                                    icon: <XCircleIcon size={14} color="var(--clothcore-danger)" />,
                                    danger: true,
                                    onClick: () => setCancelTarget(order),
                                  },
                                ]}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

      <OrderDetailsModal
        orderId={viewingOrderId}
        onClose={() => setViewingOrderId(null)}
        onSendToProduction={sendToProduction}
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Order?"
        message={cancelTarget ? `Are you sure you want to cancel order ${cancelTarget.orderId}? This action cannot be undone.` : ""}
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        danger
        submitting={cancelling}
      />

    </AdminLayout>
  );
}

export default AdminOrders;
