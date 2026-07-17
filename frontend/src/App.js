import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import PasswordResetSuccess from "./pages/PasswordResetSuccess";
import Dashboard from "./pages/Dashboard.js";
import Orders from "./pages/Orders";
import Quantities from "./pages/Quantities";
import ReviewSubmit from "./pages/ReviewSubmit";
import OrderSuccess from "./pages/OrderSuccess";
import Settings from "./pages/Settings";
import SecuritySettings from "./pages/SecuritySettings";


import OrderStep1 from "./pages/OrderStep1";

import OrderStep2 from "./pages/OrderStep2";
import OrderStep3 from "./pages/OrderStep3";

import OrderStep4 from "./pages/OrderStep4";
import OrderDelivery from "./pages/OrderDelivery";
import OrderStep5 from "./pages/OrderStep5";
import OrderStep6 from "./pages/OrderStep6";
import Sidebar from "./components/Sidebar";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUserManagement from "./pages/Admin/AdminUserManagement";
import Adminsidebar from "./components/Adminsidebar";
import AdminStaffManagement from "./pages/Admin/AdminStaffManagement";
import Inventory from "./pages/Admin/Inventory";
import AdminAddStaff from "./pages/Admin/AdminAddStaff";
import AdminProduction from "./pages/Admin/AdminProduction";
import AdminOrders from "./pages/Admin/AdminOrders";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>



<Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/production" element={<AdminProduction />} />
<Route path="/inventory" element={<Inventory />} />
<Route path="/staff/add" element={<AdminAddStaff />} />


        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/password-reset-success" element={<PasswordResetSuccess />}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/quantities" element={<Quantities />} />
        <Route path="/review-submit" element={<ReviewSubmit />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/security-settings" element={<SecuritySettings />} />


        <Route path="/step1" element={<OrderStep1 />} />

     <Route path="/step2" element={<OrderStep2 />} />
       <Route path="/step3" element={<OrderStep3 />} />
        <Route path="/step4" element={<OrderStep4 />} />
        <Route path="/order-delivery" element={<OrderDelivery />} />
        <Route path="/step5" element={<OrderStep5 />} />
        <Route path="/step6" element={<OrderStep6 />} />
        <Route path="/users" element={<AdminUserManagement />} />
        <Route path="/staff" element={<AdminStaffManagement />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
     
      </Routes>
    </BrowserRouter>
  );
}

export default App;