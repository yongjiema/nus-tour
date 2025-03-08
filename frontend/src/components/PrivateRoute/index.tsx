import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@refinedev/core";
import { authProvider } from "../../authProvider";
import { CircularProgress, Box } from "@mui/material";
import { UserRole } from "../../types/auth.types";

interface AuthCheckResponse {
  authenticated: boolean;
  redirectTo?: string;
  role?: UserRole;
}

const PrivateRoute: React.FC<{ requiredRole?: UserRole }> = ({
  requiredRole
}) => {
  const { isLoading, data: isAuthenticated } = useIsAuthenticated();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        console.log("Checking user role...");
        const response = await authProvider.check() as AuthCheckResponse;
        console.log("Auth check response:", response);
        setUserRole(response.role || null);
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setCheckingRole(false);
      }
    };

    if (isAuthenticated) {
      console.log("User is authenticated, checking role...");
      checkUserRole();
    } else {
      console.log("User is not authenticated");
      setCheckingRole(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log("PrivateRoute state:", {
      isLoading,
      isAuthenticated,
      userRole,
      checkingRole,
      requiredRole
    });
  }, [isLoading, isAuthenticated, userRole, checkingRole, requiredRole]);

  if (isLoading || checkingRole) {
    console.log("Loading or checking role...");
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Check role-specific access if requiredRole is provided
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch - Required: ${requiredRole}, Current: ${userRole}`);
    return userRole === UserRole.ADMIN
      ? <Navigate to="/admin" />
      : <Navigate to="/user-dashboard" />;
  }

  console.log("Access granted to protected route");
  return <Outlet />;
};

export default PrivateRoute;
