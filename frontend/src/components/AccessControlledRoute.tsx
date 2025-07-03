import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { CanAccess, useIsAuthenticated } from "@refinedev/core";
import { Box, CircularProgress, Alert } from "@mui/material";

interface AccessControlledRouteProps {
  /**
   * Resource that this route protects
   */
  resource?: string;
  /**
   * Action required on the resource
   */
  action?: string;
  /**
   * Additional parameters for permission checking
   */
  params?: Record<string, unknown>;
  /**
   * Where to redirect if access is denied
   */
  fallbackTo?: string;
  /**
   * Custom fallback component to show when access is denied
   */
  fallback?: React.ReactNode;
}

/**
 * AccessControlledRoute replaces the custom PrivateRoute component
 * Uses Refine's built-in access control instead of manual role checking
 */
export const AccessControlledRoute: React.FC<AccessControlledRouteProps> = ({
  resource,
  action = "list",
  params,
  fallbackTo = "/login",
  fallback,
}) => {
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackTo} replace />;
  }

  // If no specific resource/action is required, just check authentication
  if (!resource) {
    return <Outlet />;
  }

  // Use Refine's CanAccess for resource-based access control
  return (
    <CanAccess
      resource={resource}
      action={action}
      params={params}
      fallback={
        fallback ?? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Alert severity="error" sx={{ maxWidth: 600, mx: "auto" }}>
              You don't have permission to access this resource.
              <br />
              Required: {action} access on "{resource}"
            </Alert>
          </Box>
        )
      }
    >
      <Outlet />
    </CanAccess>
  );
};

/**
 * Convenience components for common access patterns
 */

/**
 * Route that requires admin access
 */
export const AdminRoute: React.FC = () => (
  <AccessControlledRoute
    resource="dashboard"
    action="create" // Admins typically have create permissions
    fallback={
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="warning" sx={{ maxWidth: 600, mx: "auto" }}>
          This area is restricted to administrators only.
        </Alert>
      </Box>
    }
  />
);

/**
 * Route that requires user access (less restrictive)
 */
export const UserRoute: React.FC = () => (
  <AccessControlledRoute
    resource="user-bookings"
    action="list"
    fallback={
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
          Please log in to access your user dashboard.
        </Alert>
      </Box>
    }
  />
);

/**
 * Route that only requires authentication (no specific permissions)
 */
export const AuthenticatedRoute: React.FC = () => <AccessControlledRoute />;
