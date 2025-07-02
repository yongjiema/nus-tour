import { useCustomMutation } from "@refinedev/core";
import type { CreateBookingRequest, CreateBookingResponse } from "../types/api.types";

export const useCreateBooking = () => {
  const { mutate, isPending } = useCustomMutation<CreateBookingResponse>();

  const createBooking = (
    data: CreateBookingRequest,
    options?: {
      onSuccess?: (response: CreateBookingResponse) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    mutate(
      {
        url: "bookings",
        method: "post",
        values: data,
      },
      {
        onSuccess: (response) => {
          options?.onSuccess?.(response.data);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      },
    );
  };

  return { createBooking, isPending };
};
