// src/components/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  House, 
  Box, 
  Clipboard, 
  Gear, 
  People,
  BarChart,
  Truck,
  Bell,
  Person,
  BoxArrowRight,
  PersonGear
} from 'react-bootstrap-icons';
import logo from '../assets/logo.png';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: House, label: 'Dashboard' },
    { path: '/orders', icon: Clipboard, label: 'Orders' },
    { path: '/place-order', icon: Box, label: 'Place Order' },
    { path: '/inventory', icon: Truck, label: 'Inventory' },
    { path: '/analytics', icon: BarChart, label: 'Analytics' },
    { path: '/customers', icon: People, label: 'Customers' },
    { path: '/settings', icon: Gear, label: 'Settings' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      sessionStorage.clear();
      navigate('/login');
    }
  };

  // Handle My Account click - navigate to settings with profile tab
  const handleMyAccount = () => {
    navigate('/settings', { state: { activeTab: 'profile' } });
  };

  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0b1a3a 0%, #0b3aa0 100%)",
        color: "white",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Logo Section */}
      <div className="text-center mb-4 px-3">
        <img
          src={logo}
          alt="ClothCore"
          style={{
            width: "60px",
            height: "60px",
            objectFit: "contain",
            marginBottom: "8px"
          }}
        />
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
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 24px",
                margin: "4px 12px",
                borderRadius: "12px",
                cursor: "pointer",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                borderLeft: isActive ? "4px solid #ffc107" : "4px solid transparent",
                transition: "all 0.3s ease",
                color: isActive ? "white" : "rgba(255,255,255,0.7)",
                fontWeight: isActive ? "600" : "400"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }
              }}
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
                    background: "#ffc107"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="px-3 mt-auto">
        {/* Notifications */}
        <div
          style={{
            padding: "15px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "12px",
            marginBottom: "10px"
          }}
        >
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px"
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600" }}>Notifications</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                3 new updates
              </div>
            </div>
          </div>
        </div>

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
            border: location.pathname === '/settings' ? "1px solid rgba(255,193,7,0.3)" : "1px solid transparent"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.borderColor = "rgba(255,193,7,0.3)";
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
              background: "linear-gradient(135deg, #ffc107, #ff6f00)",
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
                background: "#ffc107"
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