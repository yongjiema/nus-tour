import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Set the base URL from environment variables
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
