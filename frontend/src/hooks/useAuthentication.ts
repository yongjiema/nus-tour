import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authProvider } from "../authProvider";

/**
 * Custom hook for handling user authentication
 * @returns Authentication state and user ID
 */
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

        if (result.authenticated && result.id) {
          setUserId(result.id);
        } else if (storedUserId && storedRole === "user") {
          setUserId(storedUserId);
        } else {
          setAuthError("Authentication failed. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        setAuthError("Authentication error. Please try again.");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { userId, isLoading, authError };
};
