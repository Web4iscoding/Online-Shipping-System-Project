/**
 * PrivateRoute Component
 * Protects routes that require authentication
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, userType } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
