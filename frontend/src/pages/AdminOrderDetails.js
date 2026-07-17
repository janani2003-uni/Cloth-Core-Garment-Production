import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Adminsidebar from "../components/Adminsidebar";
import Admintopbar from "../components/Admintopbar";
import { 
  ArrowLeft,
  Check,
  Send,
  Trash,
  Printer,
  CreditCard,
  Person,
  Shop,
  Telephone,
  Envelope,
  GeoAlt,
  Calendar,
  Flag,
  Bank,
  X,
  Box,
  Hash,
  Calendar as CalendarIcon,
  People,
  PersonGear
} from 'react-bootstrap-icons';

function AdminOrderDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-001';
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [modalNote, setModalNote] = useState('');
  const [productionLine, setProductionLine] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  // Mock order data
  const orderData = {
    orderId: 'ORD-001',
    status: 'Pending Approval',
    customerName: 'Saman Perera',
    shopName: 'Saman Fashion',
    phone: '071 234 5678',
    email: 'saman@gmail.com',
    address: '123, Main Street, Colombo 10',
    orderDate: '12 Jul 2026',
    requiredDate: '05 Aug 2026',
    priority: 'High',
    paymentMethod: 'Bank Deposit',
    paymentStatus: 'Paid',
    items: [
      {
        id: 1,
        product: 'Polo T-Shirt',
        description: 'Cotton, Navy Blue With Logo',
        sizeBreakdown: 'S - 100\nM - 200\nL - 300\nXL - 400\nXXL - 200',
        qty: 1200,
        unitPrice: 550.00,
        total: 660000.00
      }
    ],
    totalAmount: 660000.00,
    paidAmount: 300000.00,
    balanceAmount: 360000.00,
    notes: 'Please ensure the logo is printed on the left side of the chest.'
  };

  // Modal data
  const modalData = {
    orderId: orderData.orderId,
    customer: orderData.customerName,
    shop: orderData.shopName,
    totalQty: '1,200 Pcs',
    totalAmount: orderData.totalAmount,
    product: orderData.items[0].product,
    requiredDate: orderData.requiredDate
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Pending Approval': { bg: '#fef3c7', color: '#d97706' },
      'Approved': { bg: '#e0e7ff', color: '#6366f1' },
      'Waiting Payment': { bg: '#fef3c7', color: '#d97706' },
      'In Production': { bg: '#d1fae5', color: '#059669' },
      'Completed': { bg: '#f5f3ff', color: '#8b5cf6' },
      'Cancelled': { bg: '#fee2e2', color: '#dc2626' }
    };
    return styles[status] || styles['Pending Approval'];
  };

  // Approve Modal functions
  const openApproveModal = () => {
    setModalNote('');
    setShowApproveModal(true);
  };
  const closeApproveModal = () => setShowApproveModal(false);

  // Send to Production Modal functions
  const openSendModal = () => {
    setModalNote('');
    setProductionLine('');
    setSupervisor('');
    setCharacterCount(0);
    setShowSendModal(true);
  };
  const closeSendModal = () => setShowSendModal(false);

  // Cancel Modal functions
  const openCancelModal = () => {
    setModalNote('');
    setShowCancelModal(true);
  };
  const closeCancelModal = () => setShowCancelModal(false);

  // Action Handlers - Fixed alert messages (no emojis)
  const handleApprove = () => {
    alert('Order ' + orderData.orderId + ' has been approved!\nNote: ' + (modalNote || 'No note provided'));
    closeApproveModal();
  };

  const handleSendToProduction = () => {
    alert('Order ' + orderData.orderId + ' has been sent to production!\nLine: ' + (productionLine || 'Not assigned') + '\nSupervisor: ' + (supervisor || 'Not assigned') + '\nNote: ' + (modalNote || 'No note provided'));
    closeSendModal();
  };

  const handleCancelOrder = () => {
    alert('Order ' + orderData.orderId + ' has been cancelled!\nNote: ' + (modalNote || 'No note provided'));
    closeCancelModal();
  };

  const handleNoteChange = (e) => {
    const text = e.target.value;
    if (text.length <= 200) {
      setModalNote(text);
      setCharacterCount(text.length);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Adminsidebar />
      
      <div className="flex-grow-1">
        <Admintopbar />
        
        <div style={{ padding: "24px" }}>
          <div className="container-fluid px-0">
            
            {/* Breadcrumb */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Dashboard</span>
              <span style={{ color: '#6c757d', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Orders Management</span>
              <span style={{ color: '#6c757d', margin: '0 8px' }}>&gt;</span>
              <span style={{ color: '#0b3aa0', fontWeight: '600', fontSize: '14px' }}>Order Details</span>
            </div>

            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => navigate('/admin/orders')}
                    style={{
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: '#1a1a2e'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                    Order Details
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
                    {orderData.orderId}
                  </span>
                  <span style={{
                    padding: "4px 14px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: getStatusStyle(orderData.status).bg,
                    color: getStatusStyle(orderData.status).color
                  }}>
                    {orderData.status}
                  </span>
                </div>
              </div>
              <button 
                className="btn"
                style={{
                  background: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#1a1a2e'
                }}
                onClick={() => alert('Printing invoice...')}
              >
                <Printer size={16} /> Print Invoice
              </button>
            </div>

            <div className="row">
              {/* Left Column */}
              <div className="col-lg-8">
                
                {/* Customer Information */}
                <div className="card border-0 mb-4" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>
                      Customer Information
                    </h6>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                          <Person size={14} style={{ marginRight: "4px" }} /> Customer Name
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                          {orderData.customerName}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                          <Shop size={14} style={{ marginRight: "4px" }} /> Shop Name
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                          {orderData.shopName}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                          <Telephone size={14} style={{ marginRight: "4px" }} /> Phone Number
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                          {orderData.phone}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                          <Envelope size={14} style={{ marginRight: "4px" }} /> Email
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                          {orderData.email}
                        </div>
                      </div>
                      <div className="col-12">
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                          <GeoAlt size={14} style={{ marginRight: "4px" }} /> Address
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                          {orderData.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="card border-0 mb-4" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>
                      Order Items
                    </h6>
                    
                    <div className="table-responsive">
                      <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                        <thead style={{ background: "#f8f9fa" }}>
                          <tr>
                            <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>#</th>
                            <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>PRODUCT</th>
                            <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>DESCRIPTION</th>
                            <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d" }}>SIZE BREAKDOWN</th>
                            <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d", textAlign: "center" }}>QTY (PCS)</th>
                            <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d", textAlign: "center" }}>UNIT PRICE</th>
                            <th style={{ padding: "8px 10px", fontWeight: "600", color: "#6c757d", textAlign: "center" }}>TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderData.items.map((item, index) => (
                            <tr key={item.id}>
                              <td style={{ padding: "8px 10px", color: "#94a3b8" }}>{index + 1}</td>
                              <td style={{ padding: "8px 10px", fontWeight: "500" }}>{item.product}</td>
                              <td style={{ padding: "8px 10px", color: "#64748b" }}>{item.description}</td>
                              <td style={{ padding: "8px 10px", color: "#64748b", fontSize: "12px", whiteSpace: "pre-line" }}>
                                {item.sizeBreakdown}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500" }}>
                                {item.qty.toLocaleString()}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center", color: "#64748b" }}>
                                Rs. {item.unitPrice.toFixed(2)}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "600", color: "#6366f1" }}>
                                Rs. {item.total.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="card border-0" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
                      Order Notes
                    </h6>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                      {orderData.notes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                
                {/* Order Information */}
                <div className="card border-0 mb-4" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>
                      Order Information
                    </h6>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                        <Calendar size={14} style={{ marginRight: "4px" }} /> Order Date
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                        {orderData.orderDate}
                      </div>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                        <Calendar size={14} style={{ marginRight: "4px" }} /> Required Date
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                        {orderData.requiredDate}
                      </div>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                        <Flag size={14} style={{ marginRight: "4px" }} /> Priority
                      </div>
                      <div>
                        <span style={{
                          padding: "2px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: '#fef3c7',
                          color: '#d97706'
                        }}>
                          {orderData.priority}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                        <Bank size={14} style={{ marginRight: "4px" }} /> Payment Method
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a1a2e" }}>
                        {orderData.paymentMethod}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>
                        <CreditCard size={14} style={{ marginRight: "4px" }} /> Payment Status
                      </div>
                      <span style={{
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: '#d1fae5',
                        color: '#059669'
                      }}>
                        {orderData.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="card border-0 mb-4" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="card-body">
                    <h6 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>
                      Payment Summary
                    </h6>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: "13px", color: "#6c757d" }}>Total Amount</span>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                          Rs. {orderData.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: "13px", color: "#6c757d" }}>Paid Amount</span>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#10b981" }}>
                          Rs. {orderData.paidAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ paddingTop: "12px", borderTop: "1px solid #e9ecef" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>Balance Amount</span>
                        <span style={{ fontSize: "16px", fontWeight: "700", color: "#ef4444" }}>
                          Rs. {orderData.balanceAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    className="btn w-100 py-2 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      borderRadius: "10px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                    onClick={openApproveModal}
                  >
                    <Check size={18} /> Approve Order
                  </button>

                  <button
                    className="btn w-100 py-2 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "white",
                      borderRadius: "10px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                    onClick={openSendModal}
                  >
                    <Send size={18} /> Send to Production
                  </button>

                  <button
                    className="btn w-100 py-2 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white",
                      borderRadius: "10px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                    onClick={openCancelModal}
                  >
                    <Trash size={18} /> Cancel Order
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Approve Order Modal */}
      {showApproveModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={closeApproveModal}
          />
          <div 
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflow: 'auto',
              zIndex: 9999,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              <button
                onClick={closeApproveModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: 0, marginBottom: '8px' }}>
                Approve This Order?
              </h4>
              <p style={{ fontSize: '14px', color: '#6c757d', margin: 0, marginBottom: '24px' }}>
                This order will be approved and can be sent to production.
              </p>
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Order ID</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>{modalData.orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Customer</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>{modalData.customer} ({modalData.shop})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Total Quantity</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>{modalData.totalQty}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Total Amount</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>Rs. {modalData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e', display: 'block', marginBottom: '6px' }}>
                  Add a note (optional)
                </label>
                <textarea
                  placeholder="Enter any note..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                />
              </div>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={closeApproveModal}
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  background: 'white',
                  color: '#1a1a2e',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Check size={16} /> Approve Order
              </button>
            </div>
          </div>
        </>
      )}

      {/* Send to Production Modal */}
      {showSendModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={closeSendModal}
          />
          <div 
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflow: 'auto',
              zIndex: 9999,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }}>
                Send to Production
              </h4>
              <button
                onClick={closeSendModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {/* Status Badges */}
              <div style={{ 
                display: 'flex', 
                gap: '10px',
                marginBottom: '20px',
                padding: '12px 16px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#d1fae5',
                  color: '#059669'
                }}>
                  Order Approved
                </span>
                <span style={{
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#fef3c7',
                  color: '#d97706'
                }}>
                  Production
                </span>
                <span style={{
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#e0e7ff',
                  color: '#6366f1'
                }}>
                  In Production
                </span>
              </div>

              {/* Description */}
              <div style={{
                padding: '12px 16px',
                background: '#fef3c7',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: '4px solid #f59e0b'
              }}>
                <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                  Send this order to production? Once sent, this order will be moved to the production queue and cannot be edited.
                </p>
              </div>

              {/* Order Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                    <Hash size={14} style={{ marginRight: '4px' }} /> Order ID
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>
                    {modalData.orderId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                    <Box size={14} style={{ marginRight: '4px' }} /> Product
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                    {modalData.product}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                    <Hash size={14} style={{ marginRight: '4px' }} /> Total Quantity
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                    {modalData.totalQty}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                    <CalendarIcon size={14} style={{ marginRight: '4px' }} /> Required Date
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                    {modalData.requiredDate}
                  </div>
                </div>
              </div>

              {/* Assign Production Line */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1a1a2e', 
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  <People size={14} style={{ marginRight: '4px' }} /> Assign Production Line
                </label>
                <select
                  value={productionLine}
                  onChange={(e) => setProductionLine(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '14px',
                    background: 'white',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                >
                  <option value="">Select Production Line</option>
                  <option value="Line 1 - Garment Production">Line 1 - Garment Production</option>
                  <option value="Line 2 - Cutting">Line 2 - Cutting</option>
                  <option value="Line 3 - Sewing">Line 3 - Sewing</option>
                  <option value="Line 4 - Finishing">Line 4 - Finishing</option>
                </select>
              </div>

              {/* Assign Supervisor */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1a1a2e', 
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  <PersonGear size={14} style={{ marginRight: '4px' }} /> Assign Supervisor
                </label>
                <select
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '14px',
                    background: 'white',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                >
                  <option value="">Select Supervisor</option>
                  <option value="Nimal Perera">Nimal Perera</option>
                  <option value="Sachini Fernando">Sachini Fernando</option>
                  <option value="Chamara Silva">Chamara Silva</option>
                  <option value="Rashmi Jayawardena">Rashmi Jayawardena</option>
                </select>
              </div>

              {/* Note Input with Character Count */}
              <div>
                <label style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1a1a2e', 
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Add Note (Optional)
                </label>
                <textarea
                  placeholder="Enter note for production team..."
                  value={modalNote}
                  onChange={handleNoteChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: characterCount >= 200 ? '#ef4444' : '#6c757d',
                  textAlign: 'right',
                  marginTop: '4px'
                }}>
                  {characterCount} / 200
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={closeSendModal}
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  background: 'white',
                  color: '#1a1a2e',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={handleSendToProduction}
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Send size={16} /> Send to Production
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={closeCancelModal}
          />
          <div 
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflow: 'auto',
              zIndex: 9999,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
                Cancel Order
              </h4>
              <button
                onClick={closeCancelModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div style={{ background: '#fee2e2', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Order ID</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>{modalData.orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Customer</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>{modalData.customer}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Total Amount</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>Rs. {modalData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e', display: 'block', marginBottom: '6px' }}>
                  Reason for cancellation (optional)
                </label>
                <textarea
                  placeholder="Enter reason for cancellation..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
                />
              </div>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={closeCancelModal}
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  background: 'white',
                  color: '#1a1a2e',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Trash size={16} /> Cancel Order
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to { 
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </div>
  );
}

export default AdminOrderDetails;