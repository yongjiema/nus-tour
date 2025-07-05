import axios, { AxiosError } from "axios";
import config from "./config";

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Add authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(new Error(error instanceof Error ? error.message : String(error)));
  },
);

// Response interceptor: Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Type guard to ensure we have an axios error with the expected shape
    if (!error || typeof error !== "object") {
      return Promise.reject(new Error("Unknown error"));
    }

    const axiosError = error as AxiosError & {
      config?: AxiosError["config"] & { _retry?: boolean };
    };

    const originalRequest = axiosError.config;

    // Don't intercept refresh endpoint to avoid circular calls
    if (originalRequest?.url === "/auth/refresh") {
      return Promise.reject(new Error(axiosError.message || "Authentication failed"));
    }

    if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lazy import to avoid circular dependency
        const { refreshToken } = await import("./services/authService");
        const refreshResponse = await refreshToken();

        // Check if refresh was successful
        if (refreshResponse.success) {
          const token = localStorage.getItem("access_token");
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return await axiosInstance(originalRequest);
        }

        const { clearAuthData } = await import("./services/authService");
        clearAuthData();
        return await Promise.reject(new Error(axiosError.message || "Authentication failed"));
      } catch (refreshError) {
        const { clearAuthData } = await import("./services/authService");
        clearAuthData();
        return Promise.reject(new Error(refreshError instanceof Error ? refreshError.message : "Refresh failed"));
      }
    }

    // For non-401 errors, preserve the original axios error structure
    return Promise.reject(axiosError);
  },
);

export default axiosInstance;
