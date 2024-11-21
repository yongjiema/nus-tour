import { AuthProvider } from "@refinedev/core";
import axiosInstance from "./axiosConfig";

export const authProvider: AuthProvider = {
  onError: (error) => {
    return Promise.resolve({ success: false, error });
  },
  login: async ({ username, password }) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password,
      });
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        return { success: true, redirectTo: "/admin" };
      } else {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "No access token received",
          },
        };
      }
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
    localStorage.removeItem("access_token");
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await axiosInstance.get("/auth/profile");
        return { authenticated: true };
      } catch {
        localStorage.removeItem("access_token");
        return { authenticated: false, redirectTo: "/login" };
      }
    }
    return { authenticated: false, redirectTo: "/login" };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return response.data;
    } catch {
      return null;
    }
  },
};
