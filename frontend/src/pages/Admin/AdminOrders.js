import React, { useState, useEffect } from 'react';
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import ActionMenu from "../../components/ActionMenu";
import OrderDetailsModal from "../../components/OrderDetailsModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  XCircle as XCircleIcon,
  Filter,
  Clipboard,
  HourglassSplit,
  Truck,
  CheckCircle,
} from 'react-bootstrap-icons';

const ORDERS_API_URL = "http://localhost:5000/api/orders";

function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPayment, setSelectedPayment] = useState('All Payment');
  const ordersPerPage = 6;
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

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
    <AdminLayout>

            {/* Breadcrumb */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: 'var(--clothcore-text-soft)', fontSize: '14px' }}>Dashboard</span>
              <span style={{ color: 'var(--clothcore-text-soft)', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: 'var(--clothcore-purple)', fontWeight: '600', fontSize: '14px' }}>Orders Management</span>
            </div>

            {/* Page Header */}
            <div className="admin-page-header">
              <div>
                <h2 className="admin-page-title" style={{ fontSize: '24px' }}>Orders Management</h2>
                <p className="admin-page-subtitle">
                  Manage customer orders and track their status
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className="col-xl-2 col-lg-3 col-md-6 col-sm-12">
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

            {/* Orders Table Card */}
            <div className="card admin-content-card">
              <div className="card-body">
                {/* Search and Filters */}
                <div style={{ marginBottom: "16px" }}>
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
                            setCurrentPage(1);
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
                          setCurrentPage(1);
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
                          setCurrentPage(1);
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
                          setCurrentPage(1);
                        }}
                      >
                        <Filter size={14} />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px" }}>
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
                              {indexOfFirstOrder + index + 1}
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

                {/* Pagination — reflects the real number of pages, no fake page numbers */}
                {filteredOrders.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--clothcore-border)" }}>
                    <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>
                      Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: "4px 10px",
                          border: "1px solid var(--clothcore-border)",
                          borderRadius: "6px",
                          background: "rgba(82,43,91,0.06)",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          color: currentPage === 1 ? "#ccc" : "var(--clothcore-text)",
                          fontSize: "13px"
                        }}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: "4px 12px",
                            border: currentPage === page ? "none" : "1px solid var(--clothcore-border)",
                            borderRadius: "6px",
                            background: currentPage === page ? "var(--clothcore-purple)" : "rgba(82,43,91,0.06)",
                            color: currentPage === page ? "white" : "var(--clothcore-text)",
                            fontWeight: currentPage === page ? "600" : "400",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "4px 10px",
                          border: "1px solid var(--clothcore-border)",
                          borderRadius: "6px",
                          background: "rgba(82,43,91,0.06)",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          color: currentPage === totalPages ? "#ccc" : "var(--clothcore-text)",
                          fontSize: "13px"
                        }}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
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
