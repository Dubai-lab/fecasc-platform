import { Navigate } from "react-router-dom";
import { isLoggedIn, getUserType } from "../api/auth";

export default function ProtectedRoute({ children, requiredRole = null, allowedRoles = null }) {
  if (!isLoggedIn()) return <Navigate to="/admin/login" replace />;
  
  const userType = getUserType();
  
  // Check against single required role (backward compatibility)
  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check against multiple allowed roles
  if (allowedRoles && !allowedRoles.includes(userType)) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}
