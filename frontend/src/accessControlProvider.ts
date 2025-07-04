import type { AccessControlProvider } from "@refinedev/core";
import { UserRole } from "./types/auth.types";

export const accessControlProvider: AccessControlProvider = {
  can: ({ resource, action, params }) => {
    // Get user data from localStorage (same as authProvider does)
    const userData = localStorage.getItem("user");
    if (!userData) {
      return Promise.resolve({ can: false });
    }

    let user: { roles: UserRole[] };
    try {
      user = JSON.parse(userData) as { roles: UserRole[] };
    } catch {
      return Promise.resolve({ can: false });
    }

    const userRoles = user.roles;

    // Define permissions based on roles and resources
    const permissions: Record<UserRole, Record<string, string[]>> = {
      // Admin permissions - full access to everything
      [UserRole.ADMIN]: {
        dashboard: ["list", "show", "create", "edit", "delete"],
        bookings: ["list", "show", "create", "edit", "delete", "clone"],
        "check-ins": ["list", "show", "create", "edit", "delete"],
        users: ["list", "show", "create", "edit", "delete"],
        // Admin can also access user-specific resources
        "user-bookings": ["list", "show", "create", "edit", "delete"],
        profile: ["list", "show", "edit"],
      },
      // User permissions - limited access
      [UserRole.USER]: {
        "user-bookings": ["list", "show", "create", "edit", "delete"],
        profile: ["list", "show", "edit"],
        dashboard: ["list", "show"], // Users can view their own dashboard
        // Users cannot access admin resources
        bookings: [],
        "check-ins": [],
        users: [],
      },
    };

    // Check if user has any role that allows the action on the resource
    if (!resource) {
      return Promise.resolve({ can: false });
    }

    const hasPermission = userRoles.some((role) => {
      const rolePermissions = permissions[role];
      const resourcePermissions = rolePermissions[resource];
      if (resourcePermissions.length === 0) {
        return false;
      }
      return resourcePermissions.includes(action);
    });

    // Handle ID-based permissions for user-specific resources
    if (resource === "user-bookings" || resource === "profile") {
      // Users can only access their own resources
      if (params?.id && userRoles.includes(UserRole.USER) && !userRoles.includes(UserRole.ADMIN)) {
        // In a real app, you'd verify the resource belongs to the user
        // For now, we'll assume proper backend validation
        return Promise.resolve({ can: hasPermission });
      }
    }

    return Promise.resolve({ can: hasPermission });
  },
};
