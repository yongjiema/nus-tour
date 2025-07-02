import { useList, useCustomMutation } from "@refinedev/core";
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

  const updateBookingStatus = (id: string, data: AdminBookingStatusUpdateRequest) => {
    mutate(
      {
        url: `bookings/${id}/status`,
        method: "patch",
        values: data,
      },
      {
        onError: (error) => {
          console.error("Error updating booking status:", error);
        },
      },
    );
  };

  return {
    updateStatus: updateBookingStatus,
    isPending,
  };
};
