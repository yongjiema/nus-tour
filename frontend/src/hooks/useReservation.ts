import { useCustomMutation, useNotification } from "@refinedev/core";

interface ReserveSlotRequest {
  date: string;
  timeSlot: string;
  groupSize: number;
  deposit?: number;
}

interface ReserveSlotResponse {
  id: string;
  date: string;
  groupSize: number;
  deposit: number;
  timeSlot: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export const useReserveSlot = () => {
  const { mutate, isPending } = useCustomMutation<ReserveSlotResponse>();
  const { open } = useNotification();

  const reserveSlot = (
    data: ReserveSlotRequest,
    options?: {
      onSuccess?: (response: ReserveSlotResponse) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    mutate(
      {
        url: "bookings/reserve",
        method: "post",
        values: data,
      },
      {
        onSuccess: (response) => {
          options?.onSuccess?.(response.data);
        },
        onError: (error) => {
          console.error("useReserveSlot error:", error);

          // Define interface for API error structure
          interface ApiError {
            response?: {
              status?: number;
              data?: {
                message?: string;
              };
            };
            message?: string;
          }

          // Check for authentication errors
          const apiError = error as ApiError;
          const status = apiError.response?.status;
          const message = apiError.response?.data?.message ?? apiError.message ?? "Failed to reserve slot";

          if (status === 401) {
            // Authentication error - redirect to login
            open?.({
              type: "error",
              message: "Your session has expired. Please log in again.",
            });
            // Clear local storage and redirect
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            localStorage.removeItem("token_issued_at");
            window.location.href = "/login";
            return;
          }

          if (status === 403) {
            open?.({
              type: "error",
              message: "You don't have permission to perform this action.",
            });
          } else {
            open?.({
              type: "error",
              message,
            });
          }

          options?.onError?.(error);
        },
      },
    );
  };

  return {
    mutate: reserveSlot,
    isPending,
  };
};

export const useConfirmReservation = () => {
  const { mutate, isPending } = useCustomMutation<ReserveSlotResponse>();
  const { open } = useNotification();

  const confirmReservation = (
    bookingId: string,
    options?: {
      onSuccess?: (response: ReserveSlotResponse) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    mutate(
      {
        url: `bookings/${bookingId}/confirm-reservation`,
        method: "patch",
        values: {},
      },
      {
        onSuccess: (response) => {
          open?.({
            type: "success",
            message: "Reservation confirmed successfully",
          });
          options?.onSuccess?.(response.data);
        },
        onError: (error) => {
          // Define interface for API error structure
          interface ApiError {
            response?: {
              data?: {
                message?: string;
              };
            };
          }

          const message = (error as ApiError).response?.data?.message ?? "Failed to confirm reservation";
          open?.({
            type: "error",
            message,
          });
          options?.onError?.(error);
        },
      },
    );
  };

  return {
    mutate: confirmReservation,
    isPending,
  };
};

export const useCancelReservation = () => {
  const { mutate, isPending } = useCustomMutation<{ message: string }>();
  const { open } = useNotification();

  const cancelReservation = (
    bookingId: string,
    options?: {
      onSuccess?: (response: { message: string }) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    mutate(
      {
        url: `bookings/${bookingId}/cancel-reservation`,
        method: "patch",
        values: {},
      },
      {
        onSuccess: (response) => {
          open?.({
            type: "success",
            message: response.data.message || "Reservation canceled successfully",
          });
          options?.onSuccess?.(response.data);
        },
        onError: (error) => {
          console.error("useCancelReservation error:", error);
          // Define interface for API error structure
          interface ApiError {
            response?: {
              data?: {
                message?: string;
              };
            };
          }

          const message = (error as ApiError).response?.data?.message ?? "Failed to cancel reservation";
          open?.({
            type: "error",
            message,
          });
          options?.onError?.(error);
        },
      },
    );
  };

  return {
    mutate: cancelReservation,
    isPending,
  };
};

export type { ReserveSlotRequest, ReserveSlotResponse };
