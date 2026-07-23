// src/components/roleNav.js
// Sidebar nav items for Supervisor — defined once so every page for the
// role (Dashboard, Orders, Deliveries, ...) shows the same sidebar instead
// of redefining this array in each page file.
import {
  House,
  Clipboard,
  TruckFront,
  CreditCard,
  Bell,
  Gear,
  Person,
  PersonBadge,
  People,
} from "react-bootstrap-icons";

export const SUPERVISOR_NAV_ITEMS = [
  { path: "/supervisor-dashboard", icon: House, label: "Dashboard" },
  { path: "/supervisor/orders", icon: Clipboard, label: "Orders" },
  { path: "/supervisor/staff", icon: PersonBadge, label: "Staff Management" },
  { path: "/supervisor/shop-owners", icon: People, label: "Shop Owners" },
  { path: "/supervisor/deliveries", icon: TruckFront, label: "Deliveries" },
  { path: "/supervisor/payments", icon: CreditCard, label: "Payments" },
  { path: "/supervisor/notifications", icon: Bell, label: "Notifications" },
  { path: "/supervisor/settings", icon: Gear, label: "Settings" },
  { path: "/supervisor/account", icon: Person, label: "My Account" },
];
