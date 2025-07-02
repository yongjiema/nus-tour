import { useUpdate, useNotification } from "@refinedev/core";
import type { BookingStatusUpdateRequest } from "../types/api.types";

// Booking status update hook (payment-related status updates)
export const useBookingStatus = () => {
  const { mutate, isPending } = useUpdate();
  const { open } = useNotification();

  const updateBookingStatus = (bookingId: string, data: BookingStatusUpdateRequest) => {
    mutate(
      {
        resource: "bookings",
        id: bookingId,
        values: data,
        meta: {
          operation: "payment-status",
        },
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Booking status updated successfully",
          });
        },
        onError: () => {
          open?.({
            type: "error",
            message: "Failed to update booking status",
          });
        },
      },
    );
  };

  return { updateBookingStatus, isPending };
};
