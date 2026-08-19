// src/components/roleNav.js
// Sidebar nav items for Supervisor — defined once so every page for the
// role (Dashboard, Orders, Deliveries, ...) shows the same sidebar instead
// of redefining this array in each page file.
import {
  House,
  TruckFront,
  CreditCard,
  Gear,
  Person,
  People,
  ClipboardCheck,
} from "react-bootstrap-icons";

// Orders and Production are no longer separate pages — both were fully
// consolidated into the Supervisor Dashboard (ProductionOverviewDashboard,
// which already covers stage/progress/status updates, staff assignment and
// order viewing) once confirmed redundant, per the Admin/Supervisor
// interface revision. Sample management (the one thing the old Orders page
// had that Production didn't) is out of scope of the current spec and was
// deliberately left unported rather than blocking this consolidation.
export const SUPERVISOR_NAV_ITEMS = [
  { path: "/supervisor-dashboard", icon: House, label: "Dashboard" },
  { path: "/supervisor/order-approvals", icon: ClipboardCheck, label: "Order Approvals" },
  { path: "/supervisor/shop-owners", icon: People, label: "Shop Owners" },
  { path: "/supervisor/deliveries", icon: TruckFront, label: "Deliveries" },
  { path: "/supervisor/payments", icon: CreditCard, label: "Payments" },
  { path: "/supervisor/settings", icon: Gear, label: "Settings" },
  { path: "/supervisor/account", icon: Person, label: "My Account" },
];
