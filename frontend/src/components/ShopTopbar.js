// src/components/ShopTopbar.js
// Shared topbar for every Shop Owner-facing page — replaces the header
// markup that used to be duplicated (with drifting styles) in Dashboard.js,
// Orders.js, Payments.js, Deliveries.js, Support.js, ShopRegistration.js and
// every order-step page.
import React from "react";
import logo from "../assets/logo-new.png.jpeg";
import NotificationBell from "./NotificationBell";
import UserAccountMenu from "./UserAccountMenu";

function ShopTopbar({ title }) {
  return (
    <div className="shop-topbar">
      <div className="shop-topbar-brand">
        <img src={logo} alt="ClothCore" className="shop-topbar-logo" />
        <div>
          <div className="shop-topbar-title">ClothCore</div>
          <div className="shop-topbar-subtitle">{title || "Garment Productions"}</div>
        </div>
      </div>

      <div className="shop-topbar-actions">
        <NotificationBell />
        <UserAccountMenu />
      </div>
    </div>
  );
}

export default ShopTopbar;
