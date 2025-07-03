import React from "react";
import { Navigate } from "react-router-dom";
import { UserRole } from "../../types/auth.types";

/**
 * DashboardRoot detects the user's role and redirects to the correct dashboard.
 * This route is wrapped by <PrivateRoute />, so we can safely assume the user is authenticated.
 */
const DashboardRoot: React.FC = () => {
  // Retrieve user roles from localStorage (they are stored after login)
  const storedUser = localStorage.getItem("user");
  let roles: UserRole[] = [];
  try {
    roles = storedUser ? (JSON.parse(storedUser) as { roles?: UserRole[] }).roles ?? [] : [];
  } catch {
    roles = [];
  }

  // Prioritize admin dashboard if user has ADMIN role
  if (roles.includes(UserRole.ADMIN)) {
    return <Navigate to="/dashboard/admin" replace />;
  }

  // Otherwise, default to user dashboard
  return <Navigate to="/dashboard/user" replace />;
};

export default DashboardRoot;
