import axios, { AxiosError } from "axios";
import { useNotification } from "@refinedev/core";

interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Handle backend validation errors
    if (axiosError.response?.status === 400) {
      const errorData = axiosError.response.data;
      if (Array.isArray(errorData.message)) {
        return errorData.message.join(', ');
      }
      return errorData.message || "Validation error. Please check your input.";
    }

    // Handle authorization errors
    if (axiosError.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    // Handle forbidden errors
    if (axiosError.response?.status === 403) {
      return "You don't have permission to perform this action.";
    }

    // Handle not found errors
    if (axiosError.response?.status === 404) {
      return "The requested resource could not be found.";
    }

    // Handle server errors
    if (axiosError.response?.status && axiosError.response.status >= 500) {
      return "Server error. Please try again later.";
    }

    // Network errors
    if (axiosError.code === 'ECONNABORTED') {
      return "Request timed out. Please check your connection.";
    }

    if (error.message) {
      return error.message;
    }
  }

  // Handle non-axios errors
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export const handleSubmissionError = (error: unknown, setError: (error: string) => void) => {
  const message = getErrorMessage(error);
  setError(message);
  console.error("Form submission error:", error);
};

export const useErrorHandler = () => {
  const { open } = useNotification();

  const handleError = (error: any) => {
    console.error("API Error:", error);

    const message = error.response?.data?.message || error.message || "An unexpected error occurred";

    if (typeof error === 'object' && error !== null) {
      const err = error as any;

      // Handle fetch errors
      if (err.status === 409) {
        return "Email is already registered. Please use a different email.";
      }

      if (err.status === 400) {
        return "Invalid input. Please check your information.";
      }

      return Array.isArray(message) ? message.join(' ') : message;
    }

    return "An unexpected error occurred";
  };

  return { handleError };
};
