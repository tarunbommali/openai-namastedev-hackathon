import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { ROLE_PATHS } from "../constants/routes";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
  </div>
);

/**
 * ProtectedRoute — guards routes by auth state and optional role check.
 * @param {string|string[]} [requiredRole] - one or more roles allowed
 * @param {string} [redirectTo="/"] - where to send unauthenticated users
 */
export const ProtectedRoute = ({ children, requiredRole, redirectTo = "/" }) => {
  const { isAuthenticated, user, isInitialized } = useAuth();

  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(user?.role)) {
      // Redirect to the user's own portal home
      return <Navigate to={ROLE_PATHS[user?.role] || "/"} replace />;
    }
  }

  return children;
};
