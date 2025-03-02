import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@refinedev/core";
import { authProvider } from "../../authProvider";
import { CircularProgress, Box } from "@mui/material";

const PrivateRoute: React.FC<{ requiredRole?: "admin" | "user" }> = ({
  requiredRole
}) => {
  const { isLoading, data: isAuthenticated } = useIsAuthenticated();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { role } = await authProvider.check();
        setUserRole(role);
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setCheckingRole(false);
      }
    };

    if (isAuthenticated) {
      checkUserRole();
    } else {
      setCheckingRole(false);
    }
  }, [isAuthenticated]);

  if (isLoading || checkingRole) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role-specific access if requiredRole is provided
  if (requiredRole && userRole !== requiredRole) {
    return userRole === "admin"
      ? <Navigate to="/admin" />
      : <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
