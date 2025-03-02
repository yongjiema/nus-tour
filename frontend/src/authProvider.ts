import axios from "axios";
import axiosInstance from "./axiosConfig";

interface LoginCredentials {
  email: string;
  password: string;
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
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
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
  }
);

export const authProvider = {
  login: async ({ email, password }: LoginCredentials) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        const userResponse = await axiosInstance.get("/auth/profile");
        const userRole = userResponse.data.role;

        if (userRole === "admin") {
          return {
            success: true,
            redirectTo: "/admin",
          };
        } else {
          return {
            success: true,
            redirectTo: "/dashboard",
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
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("access_token");
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      localStorage.removeItem("access_token");
      return {
        success: false,
        redirectTo: "/",
        error
      };
    }
  },

  check: async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const response = await axiosInstance.get("/auth/profile");
        const userRole = response.data.role;

        return {
          authenticated: true,
          id: response.data.id,
          role: userRole
        };
      } catch {
        localStorage.removeItem("access_token");
        return { authenticated: false, redirectTo: "/login" };
      }
    }
    return { authenticated: false, redirectTo: "/login" };
  },

  refresh: async () => {
    try {
      const response = await axiosInstance.post("/auth/refresh");
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  },

  onError: async (error: any) => {
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
          error
        };
      }
    }

    if (status === 403) {
      return {
        redirectTo: "/unauthorized",
        error
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