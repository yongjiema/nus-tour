import { useList, useCustomMutation, useInvalidate, useNotification } from "@refinedev/core";
import type { CrudFilters, HttpError } from "@refinedev/core";
import type { Booking, ApiResponse, AdminBookingStatusUpdateRequest } from "../types/api.types";

export const useAdminBookings = (filters?: CrudFilters) => {
  return useList<Booking>({
    resource: "admin/bookings",
    filters,
    pagination: {
      mode: "off",
    },
  });
};

export const useAdminUpdateBookingStatus = () => {
  const { mutate, isPending } = useCustomMutation<ApiResponse<unknown>, HttpError, AdminBookingStatusUpdateRequest>();
  const invalidate = useInvalidate();
  const { open } = useNotification();

  const updateBookingStatus = (id: string, data: AdminBookingStatusUpdateRequest) => {
    mutate(
      {
        url: `bookings/${id}/status`,
        method: "patch",
        values: data,
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: `Booking ${data.status === "cancelled" ? "cancelled" : "updated"} successfully`,
          });
          // Invalidate relevant caches
          void invalidate({
            resource: "admin/bookings",
            invalidates: ["list"],
          });
          // Also invalidate user bookings in case the user is logged in
          void invalidate({
            resource: "bookings/user",
            invalidates: ["list"],
          });
        },
        onError: (error) => {
          console.error("Error updating booking status:", error);
          open?.({
            type: "error",
            message: "Failed to update booking status. Please try again.",
          });
        },
      },
    );
  };

  return {
    updateStatus: updateBookingStatus,
    isPending,
  };
};
