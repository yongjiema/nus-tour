import axiosInstance from "./axiosConfig";
import { HttpError } from "@refinedev/core";
import { UserRole, LoginResponse } from "./types/auth.types";

// Add a flag to prevent cascading refresh attempts
let isRefreshing = false;

interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiError extends HttpError {
  message: string;
  statusCode: number;
  response?: {
    status: number;
    data?: unknown;
  };
}

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh if we're already doing so
      if (isRefreshing) {
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await authProvider.refresh();
        if (refreshResponse.success) {
          const token = localStorage.getItem("access_token");
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const authProvider = {
  login: async ({ email, password }: LoginCredentials) => {
    try {
      const response = await axiosInstance.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      if (response.data.access_token) {
        // Normalize the role to uppercase to match enum
        const normalizedRole = response.data.user.role.toUpperCase() as UserRole;

        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("userId", response.data.user.id);

        console.log("Stored auth data:", {
          token: response.data.access_token,
          role: normalizedRole,
          username: response.data.user.username,
          userId: response.data.user.id,
        });

        if (normalizedRole === UserRole.ADMIN) {
          return {
            success: true,
            redirectTo: "/admin",
          };
        } else {
          return {
            success: true,
            redirectTo: "/user-dashboard",
          };
        }
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid username or password",
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid username or password",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const pathname = window.location.pathname;
    const token = localStorage.getItem("access_token");
    const storedRole = localStorage.getItem("role");
    const id = localStorage.getItem("userId");

    // Normalize the role to match enum
    const role = storedRole ? (storedRole.toUpperCase() as UserRole) : null;

    // If no token, user is not authenticated
    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    // Public routes - still return auth data if available
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/information") ||
      pathname === "/checkin" ||
      pathname === "/testimonials"
    ) {
      return {
        authenticated: true,
        role,
        id,
      };
    }

    // Check if user is trying to access admin routes without admin role
    if (pathname.startsWith("/admin") && role !== UserRole.ADMIN) {
      return {
        authenticated: true,
        redirectTo: "/user-dashboard",
        role,
        id,
      };
    }

    // Check if user is trying to access user routes with admin role
    if (pathname === "/user-dashboard" && role === UserRole.ADMIN) {
      return {
        authenticated: true,
        redirectTo: "/admin",
        role,
        id,
      };
    }

    // For all other authenticated routes, return full auth data
    return {
      authenticated: true,
      role,
      id,
    };
  },

  refresh: async () => {
    if (isRefreshing) return { success: false };
    isRefreshing = true;

    try {
      const response = await axiosInstance.post("/auth/refresh");
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        return { success: true };
      }
      return { success: false };
    } finally {
      isRefreshing = false;
    }
  },

  onError: async (error: ApiError) => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        const refreshResult = await authProvider.refresh();
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
      return response.data.role;
    } catch {
      return null;
    }
  },

  getIdentity: async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return response.data;
    } catch {
      return null;
    }
  },
};

export default authProvider;
