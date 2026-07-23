import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import AdminLayout from "../../components/AdminLayout";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ThreeDotsVertical,
  Eye,
  Check,
  Send,
  CreditCard,
  Printer,
  Trash,
  Filter,
  Clipboard,
  HourglassSplit,
  Truck,
  CheckCircle,
  XCircle,
  Image,
  TruckFront
} from 'react-bootstrap-icons';

function AdminOrders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPayment, setSelectedPayment] = useState('All Payment');
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Load Orders Error:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/stats");
      setOrderStats(res.data);
    } catch (err) {
      console.error("Load Order Stats Error:", err);
    }
  };

  const formatOrderDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Stat cards are built here from the real counts returned by the backend,
  // the same pattern used on AdminDashboard.js.
  const stats = [
    {
      label: "Total Orders",
      value: orderStats.totalOrders.toLocaleString(),
      icon: Clipboard,
      color: "var(--clothcore-blush)",
      bg: "rgba(82,43,91,0.1)",
    },
    {
      label: "Pending",
      value: orderStats.pending.toLocaleString(),
      icon: HourglassSplit,
      color: "var(--clothcore-warning)",
      bg: "var(--clothcore-warning-bg)",
    },
    {
      label: "In Production",
      value: orderStats.inProduction.toLocaleString(),
      icon: Truck,
      color: "var(--clothcore-mauve)",
      bg: "rgba(133,79,108,0.12)",
    },
    {
      label: "Delivered",
      value: orderStats.delivered.toLocaleString(),
      icon: CheckCircle,
      color: "var(--clothcore-success)",
      bg: "var(--clothcore-success-bg)",
    },
    {
      label: "Cancelled",
      value: orderStats.cancelled.toLocaleString(),
      icon: XCircle,
      color: "var(--clothcore-danger)",
      bg: "var(--clothcore-danger-bg)",
    },
  ];

  // Filter orders based on search. Field names match the real Order schema
  // (customerName / paymentStatus / quantity / createdAt) — there is no
  // "shop" field on the Order model yet (no Shop model exists), so shop
  // search/columns were removed rather than referencing data that doesn't
  // exist.
  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch =
      (order.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || order.status === selectedStatus;
    const matchesPayment = selectedPayment === 'All Payment' || order.paymentStatus === selectedPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Status/payment values match the real Order model enums exactly.
  const getStatusBadgeClass = (status) => {
    const classes = {
      Pending: 'admin-badge-warning',
      Approved: 'admin-badge-info',
      Production: 'admin-badge-accent',
      Delivered: 'admin-badge-success',
      Cancelled: 'admin-badge-danger',
    };
    return classes[status] || 'admin-badge-warning';
  };

  const getPaymentBadgeClass = (payment) => {
    const classes = {
      Paid: 'admin-badge-success',
      Partial: 'admin-badge-accent',
      Pending: 'admin-badge-warning',
    };
    return classes[payment] || 'admin-badge-warning';
  };

  const statuses = ['All Status', 'Pending', 'Approved', 'Production', 'Delivered', 'Cancelled'];
  const payments = ['All Payment', 'Pending', 'Partial', 'Paid'];
  const DELIVERY_STATUSES = ['Not Scheduled', 'Scheduled', 'Dispatched', 'In Transit', 'Delivered', 'Delivery Failed'];

  const approveOrder = async (order) => {
    if (!window.confirm(`Approve order ${order.orderId}?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/orders/${order._id}`, { status: 'Approved' });
      await loadOrders();
      await loadStats();
      alert(`Order ${order.orderId} has been approved.`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve order.');
    }
  };

  const sendToProduction = async (order) => {
    if (!window.confirm(`Send order ${order.orderId} to production?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/orders/${order._id}`, { status: 'Production' });
      await loadOrders();
      await loadStats();
      alert(`Order ${order.orderId} has been sent to production.`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send order to production.');
    }
  };

  const cancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order ${order.orderId}? This action cannot be undone.`)) return;
    try {
      await axios.put(`http://localhost:5000/api/orders/${order._id}`, { status: 'Cancelled' });
      await loadOrders();
      await loadStats();
      alert(`Order ${order.orderId} has been cancelled.`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const handlePaymentDetails = async (order) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/payments/order/${order._id}`);
      const paymentsList = res.data || [];

      if (!paymentsList.length) {
        alert('No payments recorded for this order yet.');
        return;
      }

      const summary = paymentsList
        .map((p, i) => {
          const line = `${i + 1}. ${p.paymentType || 'Payment'} via ${p.paymentMethod || 'N/A'} - Rs. ${p.amount} - ${p.status}`;
          const ref = p.transactionReference ? ` (Ref: ${p.transactionReference})` : '';
          const rejection = p.status === 'Rejected' && p.rejectionReason ? ` - Reason: ${p.rejectionReason}` : '';
          return line + ref + rejection;
        })
        .join('\n');
      alert(`Payments for Order ${order.orderId}:\n\n${summary}`);

      const submitted = paymentsList.filter((p) => p.status === 'Submitted');
      for (const payment of submitted) {
        const shouldVerify = window.confirm(
          `Payment of Rs. ${payment.amount} (${payment.paymentMethod || payment.paymentType}) is awaiting verification.\n\nClick OK to VERIFY this payment, or Cancel to skip.`
        );
        if (shouldVerify) {
          await axios.put(`http://localhost:5000/api/payments/${payment._id}/verify`);
          alert('Payment verified.');
        } else if (window.confirm('Reject this payment instead?')) {
          const reason = window.prompt('Reason for rejection:') || 'Rejected by admin';
          await axios.put(`http://localhost:5000/api/payments/${payment._id}/reject`, { reason });
          alert('Payment rejected.');
        }
      }

      await loadOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to load payment details.');
    }
  };

  const printInvoice = async (order) => {
    let invoiceData;
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${order._id}/invoice`);
      invoiceData = res.data;
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to generate invoice.');
      return;
    }

    const invoiceWindow = window.open('', '_blank', 'width=800,height=900');
    if (!invoiceWindow) {
      alert('Please allow pop-ups for this site to print the invoice.');
      return;
    }

    const { order: o, amountPaid, balanceDue, invoiceNumber } = invoiceData;
    const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-';
    const html = `
      <html>
        <head>
          <title>Invoice - ${o.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #221033; }
            h1 { color: #522b5b; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e0d5dd; }
            .total { font-weight: bold; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>ClothCore</h1>
          <p>${invoiceNumber} — Order ${o.orderId}</p>
          <p>Date: ${orderDate}</p>
          <hr />
          <p><strong>Customer:</strong> ${o.customerName || '-'}</p>
          <table>
            <thead>
              <tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${o.item || '-'}</td>
                <td>${o.quantity ?? '-'}</td>
                <td>Rs. ${o.unitPrice ?? '-'}</td>
                <td>Rs. ${o.totalAmount ?? '-'}</td>
              </tr>
            </tbody>
          </table>
          <p class="total">Total Amount: Rs. ${o.totalAmount ?? '-'}</p>
          <p>Amount Paid (Verified): Rs. ${amountPaid.toLocaleString()}</p>
          <p class="total">Balance Due: Rs. ${balanceDue.toLocaleString()}</p>
          <p><strong>Status:</strong> ${o.status || '-'}</p>
        </body>
      </html>
    `;
    invoiceWindow.document.open();
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    setTimeout(() => {
      try { invoiceWindow.print(); } catch (e) { /* ignore */ }
    }, 300);
  };

  const handleManageSample = async (order) => {
    try {
      let existing = null;
      try {
        const res = await axios.get(`http://localhost:5000/api/samples/order/${order._id}`);
        existing = res.data;
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }

      if (!existing) {
        if (!window.confirm(`No sample exists yet for order ${order.orderId}. Create one now?`)) return;
        const imageUrl = window.prompt('Sample image URL (optional):') || '';
        const notes = window.prompt('Sample notes:') || '';
        await axios.post('http://localhost:5000/api/samples', {
          orderId: order._id,
          imageUrl,
          notes
        });
        alert('Sample created and awaiting shop approval.');
      } else {
        alert(`Current sample status: ${existing.status}\nNotes: ${existing.notes || '(none)'}`);
        if (!window.confirm('Update this sample?')) return;
        const notes = window.prompt('Updated notes:', existing.notes || '');
        const status = window.prompt('Updated status (e.g. Awaiting Shop Approval / Approved / Rejected):', existing.status || '');
        const payload = {};
        if (notes !== null) payload.notes = notes;
        if (status !== null && status.trim()) payload.status = status.trim();
        if (Object.keys(payload).length === 0) return;
        await axios.put(`http://localhost:5000/api/samples/${existing._id}`, payload);
        alert('Sample updated.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to manage sample.');
    }
  };

  const handleManageDelivery = async (order) => {
    try {
      let existing = null;
      try {
        const res = await axios.get(`http://localhost:5000/api/deliveries/order/${order._id}`);
        existing = res.data;
      } catch (err) {
        if (err.response && err.response.status !== 404) throw err;
      }

      if (!existing) {
        if (!window.confirm(`No delivery record exists yet for order ${order.orderId}. Create one now?`)) return;
        const deliveryStaffName = window.prompt('Delivery staff name:') || '';
        const trackingNumber = window.prompt('Tracking number:') || '';
        const scheduledDate = window.prompt('Scheduled date (YYYY-MM-DD):') || '';
        const notes = window.prompt('Notes (optional):') || '';
        await axios.post('http://localhost:5000/api/deliveries', {
          orderId: order._id,
          deliveryStaffName,
          trackingNumber,
          scheduledDate,
          notes
        });
        alert('Delivery record created.');
      } else {
        alert(`Current delivery status: ${existing.status}\nTracking: ${existing.trackingNumber || '(none)'}\nStaff: ${existing.deliveryStaffName || '(none)'}`);
        if (!window.confirm('Update delivery status?')) return;
        let status = window.prompt(`New status (one of: ${DELIVERY_STATUSES.join(', ')}):`, existing.status || '');
        if (status === null) return;
        status = status.trim();
        if (!DELIVERY_STATUSES.includes(status)) {
          alert(`Invalid status. Must be one of: ${DELIVERY_STATUSES.join(', ')}`);
          return;
        }
        await axios.put(`http://localhost:5000/api/deliveries/${existing._id}`, { status });
        alert('Delivery updated.');
        await loadOrders();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to manage delivery.');
    }
  };

  const handleActionClick = (action, order) => {
    setOpenDropdown(null);

    if (action === 'View Details') {
      navigate(`/admin/order-details/${order._id}`);
      return;
    }
    if (action === 'Approve Order') return approveOrder(order);
    if (action === 'Send to Production') return sendToProduction(order);
    if (action === 'Cancel Order') return cancelOrder(order);
    if (action === 'Payment Details') return handlePaymentDetails(order);
    if (action === 'Print Invoice') return printInvoice(order);
    if (action === 'Manage Sample') return handleManageSample(order);
    if (action === 'Manage Delivery') return handleManageDelivery(order);
  };

  const toggleDropdown = (orderId) => {
    setOpenDropdown((current) => (current === orderId ? null : orderId));
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
                          background: "rgba(255,255,255,0.055)",
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
                      ) : currentOrders.map((order, index) => {
                        const isOpen = openDropdown === order._id;
                        return (
                          <tr key={order._id}>
                            <td style={{ color: "var(--clothcore-text-soft)" }}>
                              {indexOfFirstOrder + index + 1}
                            </td>
                            <td style={{ fontWeight: "600", color: "var(--clothcore-blush)" }}>
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
                              <div style={{ position: 'relative', display: 'inline-block' }} ref={isOpen ? dropdownRef : null}>
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    color: "var(--clothcore-text-soft)",
                                    cursor: "pointer"
                                  }}
                                  onClick={() => toggleDropdown(order._id)}
                                >
                                  <ThreeDotsVertical size={18} />
                                </button>
                                {isOpen && (
                                  <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '4px',
                                    background: 'rgba(255,255,255,0.055)',
                                    borderRadius: '12px',
                                    padding: '6px',
                                    minWidth: '200px',
                                    boxShadow: 'var(--clothcore-shadow-hover)',
                                    zIndex: 1000,
                                    border: '1px solid var(--clothcore-border)'
                                  }}>
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-text)' }}
                                      onClick={() => handleActionClick('View Details', order)}
                                    >
                                      <Eye size={14} color="var(--clothcore-purple)" /> View Details
                                    </button>
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-text)' }}
                                      onClick={() => handleActionClick('Approve Order', order)}
                                    >
                                      <Check size={14} color="var(--clothcore-success)" /> Approve Order
                                    </button>
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-text)' }}
                                      onClick={() => handleActionClick('Send to Production', order)}
                                    >
                                      <Send size={14} color="var(--clothcore-mauve)" /> Send to Production
                                    </button>
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-text)' }}
                                      onClick={() => handleActionClick('Payment Details', order)}
                                    >
                                      <CreditCard size={14} color="var(--clothcore-deep)" /> Payment Details
                                    </button>
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-text)' }}
                                      onClick={() => handleActionClick('Manage Sample', order)}
                                    >
                                      <Image size={14} color="var(--clothcore-mauve)" /> Manage Sample
                                    </button>
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-text)' }}
                                      onClick={() => handleActionClick('Manage Delivery', order)}
                                    >
                                      <TruckFront size={14} color="var(--clothcore-deep)" /> Manage Delivery
                                    </button>
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-text)' }}
                                      onClick={() => handleActionClick('Print Invoice', order)}
                                    >
                                      <Printer size={14} color="var(--clothcore-purple)" /> Print Invoice
                                    </button>
                                    <hr style={{ margin: "4px 0" }} />
                                    <button
                                      className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                      style={{ borderRadius: "8px", fontSize: "13px", padding: "8px 12px", width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--clothcore-danger)' }}
                                      onClick={() => handleActionClick('Cancel Order', order)}
                                    >
                                      <Trash size={14} color="var(--clothcore-danger)" /> Cancel Order
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
                          background: "rgba(255,255,255,0.055)",
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
                            background: currentPage === page ? "var(--clothcore-purple)" : "rgba(255,255,255,0.055)",
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
                          background: "rgba(255,255,255,0.055)",
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

    </AdminLayout>
  );
}

export default AdminOrders;
