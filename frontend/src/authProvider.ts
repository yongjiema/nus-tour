import { Login } from "@mui/icons-material";
import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

export const TOKEN_KEY = "refine-auth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const authProvider: AuthProvider = {
  login: async ({ username, email, password }) => {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      username,
      password,
    });

    if (response.status >= 200 && response.status < 300 && response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, username);
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
