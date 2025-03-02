import axiosInstance from "./axiosConfig";

// Add a flag to prevent cascading refresh attempts
let isRefreshing = false;

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
    // Clear any stored authentication data
    localStorage.removeItem("access_token");
    
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  
  check: async () => {
    const pathname = window.location.pathname;
    
    // Public routes that don't require authentication
    if (pathname === '/' || 
        pathname === '/login' || 
        pathname === '/register' || 
        pathname.startsWith('/information') ||
        pathname === '/checkin' ||
        pathname === '/testimonials') {
      return { authenticated: true };
    }
    
    // Handle booking flow - require auth for booking but allow direct access to payment/confirmation with session data
    if (pathname.includes('/booking')) {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return { 
          authenticated: false,
          redirectTo: "/login"
        };
      }
    }
    
    // Check token for all other routes
    const token = localStorage.getItem("access_token");
    if (token) {
      return { authenticated: true };
    }
    
    return { 
      authenticated: false,
      redirectTo: "/login"
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