// src/components/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  House,
  Box,
  Clipboard,
  Gear,
  Bell,
  BoxArrowRight,
  Shop,
  CreditCard,
  Truck,
  ChatDots
} from 'react-bootstrap-icons';
import logo from '../assets/logo-new.png.jpeg';
import { clearSession } from '../utils/auth';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: House, label: 'Dashboard' },
    { path: '/orders', icon: Clipboard, label: 'Orders' },
    { path: '/step1', icon: Box, label: 'Place Order' },
    { path: '/shop-profile', icon: Shop, label: 'Shop Profile' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/deliveries', icon: Truck, label: 'Deliveries' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/support', icon: ChatDots, label: 'Support' },
    { path: '/settings', icon: Gear, label: 'Settings' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      clearSession();
      navigate('/login');
    }
  };

  // Handle My Account click - navigate to settings with profile tab
  const handleMyAccount = () => {
    navigate('/settings', { state: { activeTab: 'profile' } });
  };

  return (
    <div className="admin-sidebar">
      {/* Logo Section */}
      <div className="text-center mb-4 px-3">
        <div
          style={{
            width: "68px",
            height: "68px",
            margin: "0 auto 10px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.28)",
            overflow: "hidden",
          }}
        >
          <img
            src={logo}
            alt="ClothCore"
            style={{
              width: "48px",
              height: "48px",
              objectFit: "contain",
            }}
          />
        </div>
        <h5 className="fw-bold mb-0" style={{ color: "white", fontSize: "18px" }}>
          ClothCore
        </h5>
        <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>
          Garment Production
        </small>
      </div>

      {/* Menu Items */}
      <div className="flex-grow-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
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
                    background: "var(--clothcore-blush)"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="px-3 mt-auto">

        {/* My Account - Navigates to Settings Profile */}
        <div
          onClick={handleMyAccount}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 15px",
            marginBottom: "8px",
            borderRadius: "12px",
            cursor: "pointer",
            background: location.pathname === '/settings' ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
            transition: "all 0.3s ease",
            border: location.pathname === '/settings' ? "1px solid rgba(223,182,178,0.35)" : "1px solid transparent"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.borderColor = "rgba(223,182,178,0.35)";
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/settings') {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--clothcore-blush), var(--clothcore-mauve))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              marginRight: "12px"
            }}
          >
            SF
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600" }}>My Account</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
              Saman Fashions
            </div>
          </div>
          {location.pathname === '/settings' && (
            <span
              style={{
                marginLeft: "auto",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--clothcore-blush)"
              }}
            />
          )}
        </div>

        {/* Log Out Button */}
        <div
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 15px",
            margin: "0",
            borderRadius: "12px",
            cursor: "pointer",
            background: "rgba(220, 53, 69, 0.15)",
            transition: "all 0.3s ease",
            border: "1px solid rgba(220, 53, 69, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220, 53, 69, 0.25)";
            e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.4)";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(220, 53, 69, 0.15)";
            e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.2)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <BoxArrowRight size={20} style={{ marginRight: "12px", color: "#ff6b6b" }} />
          <span style={{ 
            fontSize: "14px", 
            fontWeight: "500",
            color: "#ff6b6b"
          }}>
            Logout
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "rgba(255,255,255,0.4)"
            }}
          >
            ↵
          </span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;