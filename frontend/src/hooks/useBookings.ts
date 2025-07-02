import { useList, useCreate, useUpdate, useDelete, useNotification } from "@refinedev/core";
import { useMemo } from "react";
import type { Booking } from "../types/api.types";

export const useBookings = () => {
  const { open } = useNotification();

  // Get all bookings with automatic refetching
  const {
    data: bookings,
    isLoading: isPending,
    isError,
    refetch,
  } = useList<Booking>({
    resource: "bookings",
    pagination: {
      pageSize: 50,
    },
    sorters: [
      {
        field: "date",
        order: "desc",
      },
    ],
  });

  // Create booking mutation
  const { mutate: createBooking, isPending: isCreating } = useCreate<Booking>({
    resource: "bookings",
    mutationOptions: {
      onSuccess: () => {
        open?.({
          type: "success",
          message: "Booking created successfully",
        });
        void refetch();
      },
      onError: () => {
        open?.({
          type: "error",
          message: "Failed to create booking",
        });
      },
    },
  });

  // Update booking mutation
  const { mutate: updateBooking, isPending: isUpdating } = useUpdate<Booking>({
    resource: "bookings",
    mutationOptions: {
      onSuccess: () => {
        open?.({
          type: "success",
          message: "Booking updated successfully",
        });
        void refetch();
      },
      onError: () => {
        open?.({
          type: "error",
          message: "Failed to update booking",
        });
      },
    },
  });

  // Delete booking mutation
  const { mutate: deleteBookingMutate, isPending: isDeleting } = useDelete();

  const deleteBooking = (params: { id: string }) => {
    deleteBookingMutate({
      resource: "bookings",
      id: params.id,
      successNotification: () => ({
        type: "success",
        message: "Booking deleted successfully",
      }),
      errorNotification: () => ({
        type: "error",
        message: "Failed to delete booking",
      }),
    });
    void refetch();
  };

  // Computed values
  const stats = useMemo(() => {
    if (!bookings?.data) return null;

    const total = bookings.data.length;
    const pending = bookings.data.filter((b) => b.status === "pending").length;
    const confirmed = bookings.data.filter((b) => b.status === "confirmed").length;
    const completed = bookings.data.filter((b) => b.status === "completed").length;
    const cancelled = bookings.data.filter((b) => b.status === "cancelled").length;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }, [bookings?.data]);

  return {
    // Data
    bookings: bookings?.data ?? [],
    totalCount: bookings?.total ?? 0,
    stats,

    // Loading states
    isLoading: isPending,
    isCreating,
    isUpdating,
    isDeleting,
    isError,

    // Actions
    createBooking,
    updateBooking,
    deleteBooking,
    refetch,
  };
};

export type { Booking };
