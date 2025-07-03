import React, { useEffect, useState, useCallback } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@refinedev/core";
import { authProvider } from "../../authProvider";
import { CircularProgress, Box } from "@mui/material";
import { UserRole } from "../../types/auth.types";
import { logger } from "../../utils/logger";

interface AuthCheckResponse {
  authenticated: boolean;
  redirectTo?: string;
  roles: UserRole[];
}

const PrivateRoute: React.FC<{ requiredRole?: UserRole }> = ({ requiredRole }) => {
  const { isLoading, data: isAuthenticated } = useIsAuthenticated();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [checkingRole, setCheckingRole] = useState(true);

  const checkUserRole = useCallback(async () => {
    if (!isAuthenticated) {
      logger.debug("User is not authenticated");
      setCheckingRole(false);
      return;
    }

    try {
      logger.debug("User is authenticated, checking roles...");
      const response = (await authProvider.check()) as AuthCheckResponse;
      logger.debug("Auth check response received", { response });

      // Only update state if component is still mounted
      setUserRoles(response.roles);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error checking roles", err);
      setUserRoles([]);
    } finally {
      setCheckingRole(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    const runCheck = async () => {
      if (isMounted) {
        await checkUserRole();
      }
    };

    void runCheck();

    return () => {
      isMounted = false;
    };
  }, [checkUserRole]);

  logger.debug("PrivateRoute state", {
    isLoading,
    isAuthenticated,
    userRoles,
    checkingRole,
    requiredRole,
  });

  if (isLoading || checkingRole) {
    logger.debug("Loading or checking roles...");
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    logger.debug("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Check role-specific access if requiredRole is provided
  if (requiredRole && !userRoles.includes(requiredRole)) {
    logger.debug("Role mismatch", {
      required: requiredRole,
      current: userRoles,
    });
    // Redirect to login on role mismatch to enforce explicit re-authentication
    return <Navigate to="/login" />;
  }

  logger.debug("Access granted to protected route");
  return <Outlet />;
};

export default PrivateRoute;
