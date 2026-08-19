// src/components/Adminsidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  House,
  People,
  PersonGear,
  Box,
  Clipboard,
  Truck,
  BoxArrowRight,
  CreditCard,
  TruckFront,
  BarChart,
  ClockHistory,
  ShieldLock,
  ClipboardCheck,
} from 'react-bootstrap-icons';
import logo from '../assets/logo-new.png.jpeg';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
import { clearSession } from '../utils/auth';

function Adminsidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);

  const menuItems = [
    { path: '/admin-dashboard', icon: House, label: 'Dashboard' },
    { path: '/users', icon: People, label: 'Shop Owner Management' },
    { path: '/staff', icon: PersonGear, label: 'Staff Management' },
    { path: '/production', icon: Box, label: 'Production' },
    { path: '/admin/orders', icon: Clipboard, label: 'Orders' },
    { path: '/admin/order-approvals', icon: ClipboardCheck, label: 'Order Approvals' },
    { path: '/inventory', icon: Truck, label: 'Inventory' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/deliveries', icon: TruckFront, label: 'Deliveries' },
    { path: '/admin/reports', icon: BarChart, label: 'Reports' },
    { path: '/admin/activity-logs', icon: ClockHistory, label: 'Activity Logs' },
    { path: '/admin/access-codes', icon: ShieldLock, label: 'Admin Access Codes' },
  ];

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    clearSession();
    navigate('/login');
  };

  const handleMyAccount = () => {
    navigate('/settings', { state: { activeTab: 'profile' } });
  };

  // Check if a path is active
  const isPathActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-sidebar">
      {/* Logo Section — sized up and given a soft accent-colored halo so it
          reads as part of the sidebar instead of a small sticker pasted on
          top of the dark purple background. The logo asset itself (a JPEG
          with a baked-in white background) is untouched. */}
      <div className="text-center mb-4 px-3">
        <div
          className="cc-sidebar-logo"
          style={{
            width: "92px",
            height: "92px",
            margin: "0 auto 12px",
            borderRadius: "26px",
            background: "linear-gradient(160deg, #ffffff, #f6ecf1)",
            border: "1px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={logo}
            alt="ClothCore"
            style={{
              width: "66px",
              height: "66px",
              objectFit: "contain",
            }}
          />
        </div>
        <h5 className="fw-bold mb-0" style={{ color: "var(--sidebar-text)", fontSize: "18px" }}>
          ClothCore
        </h5>
        <small style={{ color: "var(--sidebar-text-soft)", fontSize: "11px" }}>
          Garment Production
        </small>
      </div>

      {/* Menu Items */}
      <div className="flex-grow-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.path);
          
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`admin-sidebar-link${isActive ? " is-active" : ""}`}
            >
              <Icon size={20} style={{ marginRight: "12px" }} />
              <span style={{ fontSize: "14px" }}>{item.label}</span>
              {isActive && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--sidebar-accent)"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="px-3 mt-auto">
        {/* My Account */}
        <div
          onClick={handleMyAccount}
          className={`cc-account-row${location.pathname === '/settings' ? ' is-active' : ''}`}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 15px",
            marginBottom: "8px",
            borderRadius: "12px",
            cursor: "pointer",
            background: "var(--sidebar-bg-secondary)",
            border: "1px solid var(--sidebar-border)"
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--sidebar-accent), var(--sidebar-accent-strong))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              marginRight: "12px"
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--sidebar-text)" }}>Settings</div>
            <div style={{ fontSize: "10px", color: "var(--sidebar-text-soft)" }}>
              Manage your account
            </div>
          </div>
          {location.pathname === '/settings' && (
            <span
              style={{
                marginLeft: "auto",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--sidebar-accent)"
              }}
            />
          )}
        </div>

        {/* Log Out Button */}
        <div
          onClick={handleLogout}
          className="cc-logout-row"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 15px",
            margin: "0",
            borderRadius: "12px",
            cursor: "pointer",
            background: "var(--sidebar-danger-bg)",
            border: "1px solid var(--sidebar-danger-border)",
          }}
        >
          <BoxArrowRight size={20} style={{ marginRight: "12px", color: "var(--sidebar-danger-text)" }} />
          <span style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--sidebar-danger-text)"
          }}>
            Logout
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "var(--sidebar-text-faint)"
            }}
          >
            ↵
          </span>
        </div>
      </div>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

export default Adminsidebar;