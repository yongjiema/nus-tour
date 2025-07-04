import axios, { AxiosError } from "axios";
import config from "../config";

// Create a separate axios instance for refresh calls to avoid interceptor conflicts
const createRefreshAxios = () => {
  return axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Lazy initialization of refresh axios instance
let refreshAxios: ReturnType<typeof createRefreshAxios> | null = null;
const getRefreshAxios = () => {
  if (!refreshAxios) {
    refreshAxios = createRefreshAxios();
    // Add auth header to refresh requests
    refreshAxios.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  return refreshAxios;
};

// Define the refresh result type with explicit success values
export type RefreshResult = { success: true } | { success: false; redirectTo?: string };

// Refresh token function - extracted from authProvider to avoid circular dependencies
export const refreshToken = async (): Promise<RefreshResult> => {
  try {
    const response = await getRefreshAxios().post<{ access_token: string }>("/auth/refresh");
    const data = response.data;
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    // If we get a 401, it means the refresh token is invalid or expired
    if (error instanceof AxiosError && error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("token_issued_at");
      return { success: false, redirectTo: "/login" };
    }
    return { success: false };
  }
};

// Clear auth data helper
export const clearAuthData = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("token_issued_at");
};
