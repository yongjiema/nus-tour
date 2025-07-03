import axiosInstance from "./axiosConfig";
import type { HttpError } from "@refinedev/core";
import { UserRole } from "./types/auth.types";
import type { LoginResponse } from "./types/auth.types";
import { refreshToken } from "./services/authService";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  roles: UserRole[];
  [key: string]: unknown;
}

interface ApiError extends HttpError {
  message: string;
  statusCode: number;
  response?: {
    status: number;
    data?: unknown;
  };
}

export const authProvider = {
  login: async ({ email, password }: LoginCredentials) => {
    try {
      const response = await axiosInstance.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      if (response.data.access_token) {
        // Normalize the roles to uppercase to match enum values
        const normalizedRoles = response.data.user.roles.map((r: string) => r.toUpperCase()) as UserRole[];

        // Persist auth info
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify({ ...response.data.user, roles: normalizedRoles }));
        localStorage.setItem("token_issued_at", Date.now().toString());

        // Check for redirect after login
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          return {
            success: true,
            redirectTo: redirectPath,
          };
        }

        // Default redirect based on role
        if (normalizedRoles.includes(UserRole.ADMIN)) {
          return {
            success: true,
            redirectTo: "/admin",
          };
        }
        return {
          success: true,
          redirectTo: "/u",
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid email or password",
        },
      };
    } catch (err) {
      let message = "Invalid email or password";
      if (typeof err === "object" && err !== null && "response" in err) {
        const safeErr = err as { response?: { data?: { message?: string } } };
        message = safeErr.response?.data?.message ?? message;
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message,
        },
      };
    }
  },

  logout: async () => {
    // Clear local storage immediately
    const token = localStorage.getItem("access_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_issued_at");

    // Call backend logout endpoint (with token in header if it existed)
    if (token) {
      try {
        await axiosInstance.post(
          "/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (error) {
        console.warn("Backend logout failed:", error);
      }
    }

    return Promise.resolve({
      success: true,
      redirectTo: "/login",
    });
  },

  check: async () => {
    const pathname = window.location.pathname;
    const token = localStorage.getItem("access_token");

    // Quick exit: if no token, treat as unauthenticated immediately
    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
        roles: [],
      } as const;
    }

    // Check if we have cached user data and if the token was recently issued
    const cachedUser = localStorage.getItem("user");
    const tokenIssuedAt = localStorage.getItem("token_issued_at");
    const now = Date.now();

    // If token was issued less than 30 seconds ago and we have cached user data, trust it
    // This prevents unnecessary API calls immediately after login
    if (cachedUser && tokenIssuedAt) {
      const issuedTime = parseInt(tokenIssuedAt, 10);
      const timeSinceIssued = now - issuedTime;

      if (timeSinceIssued < 30000) {
        try {
          const user = JSON.parse(cachedUser) as UserData;
          if (Array.isArray(user.roles)) {
            const roles = user.roles;
            const id = user.id;

            // Continue with role-based routing logic using cached data
            // Public routes - still return auth data if available
            if (
              pathname === "/" ||
              pathname === "/login" ||
              pathname === "/register" ||
              pathname.startsWith("/information") ||
              pathname === "/u" ||
              pathname.startsWith("/u?tab=") ||
              pathname === "/u/profile" ||
              pathname === "/testimonials"
            ) {
              return {
                authenticated: true,
                roles,
                id,
              } as const;
            }

            // Check if user is trying to access admin routes without admin role
            if (pathname.startsWith("/admin") && !roles.includes(UserRole.ADMIN)) {
              return {
                authenticated: true,
                redirectTo: "/u",
                roles,
                id,
              } as const;
            }

            // Check if user is trying to access user routes with only admin role
            if (pathname.startsWith("/u") && roles.includes(UserRole.ADMIN) && !roles.includes(UserRole.USER)) {
              return {
                authenticated: true,
                redirectTo: "/admin",
                roles,
                id,
              } as const;
            }

            // For all other authenticated routes, return full auth data
            return {
              authenticated: true,
              roles,
              id,
            } as const;
          }
        } catch {
          // If cached data is corrupted, fall through to API validation
        }
      }
    }

    // Validate token by calling backend profile endpoint
    let user: UserData | null = null;
    try {
      const response = await axiosInstance.get<UserData>("/auth/profile");
      user = response.data;
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      // Token invalid or server unreachable – treat as unauthenticated
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("token_issued_at");
      return {
        authenticated: false,
        redirectTo: "/login",
        roles: [],
      } as const;
    }

    const roles = user.roles;
    const id = user.id;

    // Public routes - still return auth data if available
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/information") ||
      pathname === "/u" ||
      pathname.startsWith("/u?tab=") ||
      pathname === "/u/profile" ||
      pathname === "/testimonials"
    ) {
      return {
        authenticated: true,
        roles,
        id,
      } as const;
    }

    // Check if user is trying to access admin routes without admin role
    if (pathname.startsWith("/admin") && !roles.includes(UserRole.ADMIN)) {
      return {
        authenticated: true,
        redirectTo: "/u",
        roles,
        id,
      } as const;
    }

    // Check if user is trying to access user routes with only admin role
    if (pathname.startsWith("/u") && roles.includes(UserRole.ADMIN) && !roles.includes(UserRole.USER)) {
      return {
        authenticated: true,
        redirectTo: "/admin",
        roles,
        id,
      } as const;
    }

    // For all other authenticated routes, return full auth data
    return {
      authenticated: true,
      roles,
      id,
    } as const;
  },

  refresh: async () => {
    return await refreshToken();
  },

  onError: async (error: ApiError) => {
    const status = error.response?.status;

    if (status === 401) {
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.success) {
          return { error };
        }
      } catch {
        return {
          logout: true,
          redirectTo: "/login",
          error,
        };
      }
    }

    if (status === 403) {
      return {
        redirectTo: "/unauthorized",
        error,
      };
    }

    return { error };
  },

  getPermissions: async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      const roles = (response.data as { roles?: UserRole[] }).roles;
      return roles?.[0] ?? null;
    } catch {
      return null;
    }
  },

  getIdentity: async () => {
    try {
      const response = await axiosInstance.get<UserData>("/auth/profile");
      return response.data;
    } catch {
      return null;
    }
  },
};
