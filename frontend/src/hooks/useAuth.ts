import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomMutation } from "@refinedev/core";
import { authProvider } from "../authProvider";
import type { RegisterRequest, RegisterResponse } from "../types/api.types";

// Registration hook
export const useRegister = () => {
  const { mutate, isPending } = useCustomMutation<RegisterResponse>();

  const register = (data: RegisterRequest) => {
    mutate({
      url: "auth/register",
      method: "post",
      values: data,
    });
  };

  return { register, isPending };
};

// Authentication state checking hook
export const useAuthentication = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Get auth data from localStorage as backup
        const storedUserId = localStorage.getItem("userId");
        const storedRole = localStorage.getItem("role");

        // Try getting from authProvider first
        const result = await authProvider.check();

        if (result.authenticated && "id" in result && result.id) {
          setUserId(result.id);
        } else if (storedUserId && storedRole === "user") {
          setUserId(storedUserId);
        } else {
          setAuthError("Authentication failed. Please log in again.");
          void setTimeout(() => void navigate("/login"), 2000);
        }
      } catch {
        setAuthError("Authentication error. Please try again.");
        void setTimeout(() => void navigate("/login"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, [navigate]);

  return { userId, isLoading, authError };
};
