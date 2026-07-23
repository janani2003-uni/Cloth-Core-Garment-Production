import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import PasswordResetSuccess from "./pages/PasswordResetSuccess";
import Dashboard from "./pages/Dashboard.js";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorOrders from "./pages/SupervisorOrders";
import SupervisorStaffManagement from "./pages/SupervisorStaffManagement";
import SupervisorShopOwners from "./pages/SupervisorShopOwners";
import SupervisorDeliveries from "./pages/SupervisorDeliveries";
import SupervisorPayments from "./pages/SupervisorPayments";
import SupervisorNotifications from "./pages/SupervisorNotifications";
import SupervisorSettings from "./pages/SupervisorSettings";
import SupervisorAccount from "./pages/SupervisorAccount";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

import OrderStep1 from "./pages/OrderStep1";
import OrderStep2 from "./pages/OrderStep2";
import OrderStep3 from "./pages/OrderStep3";
import OrderStep4 from "./pages/OrderStep4";
import OrderDelivery from "./pages/OrderDelivery";
import OrderStep5 from "./pages/OrderStep5";
import OrderStep6 from "./pages/OrderStep6";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUserManagement from "./pages/Admin/AdminUserManagement";
import AdminStaffManagement from "./pages/Admin/AdminStaffManagement";
import Inventory from "./pages/Admin/Inventory";
import AdminAddStaff from "./pages/Admin/AdminAddStaff";
import AdminProduction from "./pages/Admin/AdminProduction";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminOrderDetails from "./pages/Admin/AdminOrderDetails";
import AdminShops from "./pages/Admin/AdminShops";
import AdminPayments from "./pages/Admin/AdminPayments";
import AdminDeliveries from "./pages/Admin/AdminDeliveries";
import AdminReports from "./pages/Admin/AdminReports";
import AdminActivityLogs from "./pages/Admin/AdminActivityLogs";
import AdminSupportTickets from "./pages/Admin/AdminSupportTickets";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminAccessCodes from "./pages/Admin/AdminAccessCodes";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import ShopProfile from "./pages/ShopProfile";
import Payments from "./pages/Payments";
import Deliveries from "./pages/Deliveries";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/password-reset-success"
          element={<PasswordResetSuccess />}
        />

        {/* Admin-only routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProduction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAddStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shops"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminShops />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/order-details/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deliveries"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDeliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminActivityLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support-tickets"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSupportTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/access-codes"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAccessCodes />
            </ProtectedRoute>
          }
        />

        {/* Supervisor-only routes */}
        <Route
          path="/supervisor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/orders"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/staff"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorStaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/shop-owners"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorShopOwners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/deliveries"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorDeliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/payments"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/notifications"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/settings"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/account"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorAccount />
            </ProtectedRoute>
          }
        />

        {/* Logged-in routes (any authenticated role) */}
        <Route
          path="/shop-profile"
          element={
            <ProtectedRoute>
              <ShopProfile />
            </ProtectedRoute>
          }
        />
        {/* Old path kept as a redirect so existing bookmarks/links still work */}
        <Route path="/shop-registration" element={<Navigate to="/shop-profile" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deliveries"
          element={
            <ProtectedRoute>
              <Deliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step1"
          element={
            <ProtectedRoute>
              <OrderStep1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step2"
          element={
            <ProtectedRoute>
              <OrderStep2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step3"
          element={
            <ProtectedRoute>
              <OrderStep3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step4"
          element={
            <ProtectedRoute>
              <OrderStep4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-delivery"
          element={
            <ProtectedRoute>
              <OrderDelivery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step5"
          element={
            <ProtectedRoute>
              <OrderStep5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step6"
          element={
            <ProtectedRoute>
              <OrderStep6 />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
