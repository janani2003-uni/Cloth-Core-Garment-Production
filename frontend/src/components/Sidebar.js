// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  House,
  Box,
  Clipboard,
  Gear,
  BoxArrowRight,
  Shop,
  CreditCard,
  Truck,
} from 'react-bootstrap-icons';
import logo from '../assets/logo-new.png.jpeg';
import { clearSession, getUser } from '../utils/auth';
import { goToPlaceOrder } from '../utils/orderStatus';
import LogoutConfirmModal from './modals/LogoutConfirmModal';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // "My Account" card below shows the real saved Shop Profile — never a
  // placeholder business name. If the Shop Owner hasn't registered a shop
  // yet, it says so instead of a fake name. Refetches on every mount, which
  // covers the normal case (each page wraps itself in ShopOwnerLayout, so
  // this remounts on navigation) — including right after saving changes on
  // the Shop Profile page and navigating away.
  const [shop, setShop] = useState(null);
  const [shopChecked, setShopChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios.get('http://localhost:5000/api/shops/my-shop')
      .then((res) => { if (!cancelled) setShop(res.data); })
      .catch(() => { if (!cancelled) setShop(null); })
      .finally(() => { if (!cancelled) setShopChecked(true); });
    return () => { cancelled = true; };
  }, []);

  const user = getUser();
  const accountLabel = shop?.shopName || (shopChecked ? 'No Shop Registered' : 'Loading…');
  const accountInitial =
    (shop?.shopName?.[0] || user?.firstName?.[0] || 'S').toUpperCase();

  const menuItems = [
    { path: '/dashboard', icon: House, label: 'Dashboard' },
    { path: '/orders', icon: Clipboard, label: 'Orders' },
    { path: '/step1', icon: Box, label: 'Place Order' },
    { path: '/shop-profile', icon: Shop, label: 'Shop Profile' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/deliveries', icon: Truck, label: 'Deliveries' },
    { path: '/settings', icon: Gear, label: 'Settings' },
  ];

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    clearSession();
    navigate('/login');
  };

  // Handle My Account click - navigate to settings with profile tab
  const handleMyAccount = () => {
    navigate('/settings', { state: { activeTab: 'profile' } });
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
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <div
              key={item.path}
              onClick={() => (item.path === '/step1' ? goToPlaceOrder(navigate) : navigate(item.path))}
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

        {/* My Account - Navigates to Settings Profile */}
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
          {shop?.logoPath ? (
            <img
              src={`http://localhost:5000${shop.logoPath}`}
              alt={`${shop.shopName || "Shop"} logo`}
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", marginRight: "12px", flexShrink: 0 }}
            />
          ) : (
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
              {accountInitial}
            </div>
          )}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--sidebar-text)" }}>My Account</div>
            <div style={{ fontSize: "10px", color: "var(--sidebar-text-soft)" }}>
              {accountLabel}
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

export default Sidebar;