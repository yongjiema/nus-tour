import { AxiosError, isAxiosError } from "axios";

/**
 * Error Handling for Refine Applications:
 *
 * 1. **Use Refine's Built-in Error Handling** for data operations (CRUD)
 * 2. **Use Custom Error Handler** for business-specific errors
 * 3. **Centralized Error Messages** for consistency
 * 4. **Type-Safe Error Handling** with proper TypeScript support
 *
 * Usage Examples:
 *
 * // For Refine hooks (automatic error handling)
 * const { data, error } = useList({ resource: "bookings" });
 *
 * // For custom mutations with error handling
 * const { mutate } = useCustomMutation({
 *   onError: (error) => handleRefineError(error, open),
 * });
 *
 * // For manual operations
 * const result = await withErrorHandling(
 *   () => someAsyncOperation(),
 *   (error) => setError(error)
 * );
 */

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  data?: {
    error?: string;
  };
  status?: number;
}

// Business-specific error codes
export const BUSINESS_ERROR_CODES = {
  BOOKING_CONFLICT: "BOOKING_CONFLICT",
  BOOKING_LIMIT_EXCEEDED: "BOOKING_LIMIT_EXCEEDED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_EXPIRED: "PAYMENT_EXPIRED",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
} as const;

// Enhanced error message mapping
const ERROR_MESSAGES = {
  // HTTP Status Codes
  400: "Invalid request. Please check your input.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource could not be found.",
  409: "Email is already registered. Please use a different email.",
  422: "Validation error. Please check your information.",
  500: "Server error. Please try again later.",

  // Business Error Codes
  [BUSINESS_ERROR_CODES.BOOKING_CONFLICT]: "This time slot is no longer available. Please select another time.",
  [BUSINESS_ERROR_CODES.BOOKING_LIMIT_EXCEEDED]: "You've reached the maximum number of active bookings allowed.",
  [BUSINESS_ERROR_CODES.PAYMENT_FAILED]:
    "Payment processing failed. Please try again or use a different payment method.",
  [BUSINESS_ERROR_CODES.PAYMENT_EXPIRED]: "Your payment session has expired. Please start a new booking.",
  [BUSINESS_ERROR_CODES.EMAIL_ALREADY_EXISTS]: "Email is already registered. Please use a different email.",

  // Network Errors
  ECONNABORTED: "Request timed out. Please check your connection.",
  NETWORK_ERROR: "Network error. Please check your internet connection.",

  // Default
  UNKNOWN: "An unexpected error occurred.",
} as const;

/**
 * Extracts a user-friendly error message from any error object
 * @param error - The error object to process
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const resData = axiosError.response?.data;

    // Business-specific error codes
    if (resData?.error && resData.error in BUSINESS_ERROR_CODES) {
      return ERROR_MESSAGES[resData.error as keyof typeof BUSINESS_ERROR_CODES];
    }

    // NestJS validation errors (400 with message property) - handle multiple formats
    if (status === 400) {
      // Try different possible message formats from NestJS
      let errorMessage = "";

      if (resData?.message) {
        errorMessage = Array.isArray(resData.message) ? resData.message.join(", ") : resData.message;
      } else if (resData?.error) {
        errorMessage = resData.error;
      } else if (typeof resData === "string") {
        errorMessage = resData;
      }

      if (errorMessage) {
        return errorMessage;
      }
    }

    // HTTP status code mapping (fallback)
    if (status && status in ERROR_MESSAGES) {
      return ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES];
    }

    // Network timeout
    if (axiosError.code === "ECONNABORTED") {
      return ERROR_MESSAGES.ECONNABORTED;
    }

    // Fallback to Axios message
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error && typeof error === "object" && "message" in error && "status" in error) {
    const httpError = error as { message?: string };
    return httpError.message ?? ERROR_MESSAGES.UNKNOWN;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return ERROR_MESSAGES.UNKNOWN;
};

/**
 * Enhanced error handler for Refine components
 * @returns Object with handleError function
 */
export const useRefineErrorHandler = () => {
  const handleError = (error: unknown): string => {
    console.error("API Error:", error);
    return getErrorMessage(error);
  };

  return { handleError };
};

// Legacy hook for backward compatibility
export const useErrorHandler = useRefineErrorHandler;

/**
 * Utility for handling Refine mutation errors with notifications
 * @param error - The error object
 * @param open - Refine's notification function
 * @returns The error message
 */
export const handleRefineError = (
  error: unknown,
  open?: (params: { message: string; type: "error" | "success" | "progress" }) => void,
): string => {
  const message = getErrorMessage(error);

  if (open) {
    open({
      message,
      type: "error",
    });
  }

  console.error("Refine Error:", error);
  return message;
};

/**
 * Utility for form submission errors
 * @param error - The error object
 * @param setError - Function to set form error state
 */
export const handleSubmissionError = (error: unknown, setError: (error: string) => void): void => {
  const message = getErrorMessage(error);
  setError(message);
  console.error("Form submission error:", error);
};

/**
 * Utility for async operations with error handling
 * @param operation - The async operation to execute
 * @param onError - Optional callback for error handling
 * @returns Promise that resolves to the operation result or null on error
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  onError?: (error: string) => void,
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const message = getErrorMessage(error);
    if (onError) {
      onError(message);
    }
    console.error("Operation failed:", error);
    return null;
  }
};
