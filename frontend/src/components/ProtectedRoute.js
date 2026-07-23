import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

// Admin is treated as a global allowed role everywhere — it's the only role
// permitted to view every other role's dashboard (see UserAccountMenu's
// "View As" switcher). Normal roles stay restricted to their own routes.
function hasAccess(userRole, allowedRoles) {
  if (userRole === "admin") return true;
  return allowedRoles.includes(userRole);
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasAccess(user.role, allowedRoles)) {
    // Already authenticated, just not authorized for this page — send them
    // to their own home instead of bouncing back to the login screen.
    const fallbackByRole = {
      admin: "/admin-dashboard",
      supervisor: "/supervisor-dashboard",
    };
    const fallbackPath = fallbackByRole[user.role] || "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
