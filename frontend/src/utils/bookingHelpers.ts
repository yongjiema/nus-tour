import type { Booking } from "../types/api.types";

// Type guard to ensure booking has required properties
export const isValidBooking = (booking: unknown): booking is Booking => {
  return (
    typeof booking === "object" &&
    booking !== null &&
    "id" in booking &&
    "date" in booking &&
    "timeSlot" in booking &&
    "status" in booking &&
    "groupSize" in booking &&
    "hasFeedback" in booking
  );
};

// Helper function to safely get booking property
export const getBookingProperty = (booking: unknown, property: string): string => {
  if (!isValidBooking(booking)) {
    return "";
  }
  const value = booking[property as keyof Booking];
  return typeof value === "string" ? value : "";
};

// Helper function to safely get booking status
export const getBookingStatus = (booking: unknown): string => {
  if (!isValidBooking(booking)) {
    return "";
  }
  return typeof booking.status === "string" ? booking.status : "";
};

// Helper function to check if booking has expired
export const isBookingExpired = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) {
    return false;
  }

  const status = getBookingStatus(booking);
  if (status === "slot_expired") {
    return true;
  }

  // Check if slot_reserved booking has passed expiration time
  if (status === "slot_reserved" && booking.expiresAt) {
    try {
      const expiresAt = new Date(booking.expiresAt);
      return new Date() > expiresAt;
    } catch {
      return false;
    }
  }

  return false;
};

// Helper function to get effective booking status (now just returns the actual status)
export const getEffectiveBookingStatus = (booking: unknown): string => {
  if (!isValidBooking(booking)) {
    return "";
  }

  // Since the backend now automatically handles no_show status updates,
  // we just return the actual status from the database
  return getBookingStatus(booking);
};

// Helper function to check if booking allows payment
export const canProceedToPayment = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) {
    return false;
  }

  const status = getBookingStatus(booking);
  const allowedStatuses = ["slot_reserved", "awaiting_payment"];

  // Don't allow payment for expired, cancelled, or already paid bookings
  if (!allowedStatuses.includes(status)) {
    return false;
  }

  // Don't allow payment for expired bookings
  if (isBookingExpired(booking)) {
    return false;
  }

  return true;
};

// Helper function to safely get booking hasFeedback
export const getBookingHasFeedback = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) {
    return false;
  }
  return typeof booking.hasFeedback === "boolean" ? booking.hasFeedback : false;
};

// Helper function to check if booking can be cancelled
export const canCancelBooking = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) return false;

  const status = getBookingStatus(booking);
  const cancellableStatuses = ["slot_reserved", "awaiting_payment", "paid", "confirmed"];

  // Cannot cancel if booking is in a non-cancellable state (including no_show)
  if (!cancellableStatuses.includes(status)) {
    return false;
  }

  // Cannot cancel if booking has expired
  if (isBookingExpired(booking)) {
    return false;
  }

  return true;
};

// Helper function to check if booking can be checked in
export const canCheckIn = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) {
    return false;
  }

  const status = getBookingStatus(booking);
  const allowedStatuses = ["confirmed", "checked_in", "completed"];

  // Allow display of confirmed bookings (for check-in), checked_in bookings, and completed bookings (for viewing status)
  return allowedStatuses.includes(status);
};
