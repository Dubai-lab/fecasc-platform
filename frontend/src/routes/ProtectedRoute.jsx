import { Navigate } from "react-router-dom";
import { isLoggedIn, getUserType } from "../api/auth";

export default function ProtectedRoute({ children, requiredRole = null }) {
  if (!isLoggedIn()) return <Navigate to="/admin/login" replace />;
  
  // If a specific role is required, check it
  if (requiredRole) {
    const userType = getUserType();
    if (userType !== requiredRole) {
      return <Navigate to="/admin/login" replace />;
    }
  }
  
  return children;
}
