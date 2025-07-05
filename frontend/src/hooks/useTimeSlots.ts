import { useCustom } from "@refinedev/core";
import type { TimeSlotAvailability } from "../types/api.types";

// Available time slots hook (booking availability checking)
export const useAvailableTimeSlots = (date?: string) => {
  return useCustom<TimeSlotAvailability[]>({
    url: "bookings/available-slots",
    method: "get",
    config: {
      query: date ? { date } : undefined,
    },
  });
};
