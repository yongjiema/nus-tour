import axiosInstance from "./axiosConfig";
import type { HttpError } from "@refinedev/core";
import { UserRole } from "./types/auth.types";
import type { LoginResponse } from "./types/auth.types";

// Add a flag to prevent cascading refresh attempts
let isRefreshing = false;

interface LoginCredentials {
  email: string;
  password: string;
}

interface AxiosErrorWithConfig {
  config: {
    _retry?: boolean;
    headers: Record<string, string>;
  };
  response?: {
    status: number;
  };
  message?: string;
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

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosErrorWithConfig) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh if we're already doing so
      if (isRefreshing) {
        return Promise.reject(new Error(error.message ?? "Authentication failed"));
      }

      try {
        const refreshResponse = await authProvider.refresh();
        if (refreshResponse.success) {
          const token = localStorage.getItem("access_token");
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return await axiosInstance(originalRequest);
        }
        return await Promise.reject(new Error(error.message ?? "Authentication failed"));
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(new Error(refreshError instanceof Error ? refreshError.message : "Refresh failed"));
      }
    }
    return Promise.reject(new Error(error.message ?? "Request failed"));
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
        // Normalize the roles to uppercase to match enum values
        const normalizedRoles = response.data.user.roles.map((r: string) => r.toUpperCase()) as UserRole[];

        // Persist auth info
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify({ ...response.data.user, roles: normalizedRoles }));

        // Auth data stored successfully (logging disabled for cleaner output)

        if (normalizedRoles.includes(UserRole.ADMIN)) {
          return {
            success: true,
            redirectTo: "/admin",
          };
        }
        return {
          success: true,
          redirectTo: "/dashboard/user",
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

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

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

    // Validate token by calling backend profile endpoint
    let user: UserData | null = null;
    try {
      const response = await axiosInstance.get<UserData>("/auth/profile");
      user = response.data;
      // Persist latest user payload for quick access next time
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      // Token invalid or server unreachable – treat as unauthenticated
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
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
      pathname === "/checkin" ||
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
        redirectTo: "/dashboard/user",
        roles,
        id,
      } as const;
    }

    // Check if user is trying to access user routes with only admin role
    if (pathname === "/dashboard/user" && roles.includes(UserRole.ADMIN) && !roles.includes(UserRole.USER)) {
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
    if (isRefreshing) return { success: false };
    isRefreshing = true;

    try {
      const response = await axiosInstance.post<{ access_token: string }>("/auth/refresh");
      const data = response.data;
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        return { success: true };
      }
      return { success: false };
    } finally {
      isRefreshing = false;
    }
  },

  onError: async (error: ApiError) => {
    const status = error.response?.status;

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
