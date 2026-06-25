import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import PasswordResetSuccess from "./pages/PasswordResetSuccess";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import PlaceBulkOrder from "./pages/PlaceBulkOrder";
import Quantities from "./pages/Quantities";
import ReviewSubmit from "./pages/ReviewSubmit";
import OrderSuccess from "./pages/OrderSuccess";
import Settings from "./pages/Settings";
import SecuritySettings from "./pages/SecuritySettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/password-reset-success" element={<PasswordResetSuccess />}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/place-order" element={<PlaceBulkOrder />} />
        <Route path="/quantities" element={<Quantities />} />
        <Route path="/review-submit" element={<ReviewSubmit />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/security-settings" element={<SecuritySettings />} />

       
      </Routes>
    </BrowserRouter>
  );
}

export default App;