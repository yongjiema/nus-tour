export enum BookingLifecycleStatus {
  // Initial status when booking is created
  PENDING_PAYMENT = "pending_payment",

  // Payment related statuses
  PAYMENT_COMPLETED = "payment_completed",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_REFUNDED = "payment_refunded",

  // Booking confirmation statuses
  CONFIRMED = "confirmed", // After payment is completed and booking is confirmed

  // Tour execution statuses
  CHECKED_IN = "checked_in", // Customer has checked in for the tour
  COMPLETED = "completed", // Tour is completed

  // Cancellation statuses
  CANCELLED = "cancelled", // Booking was cancelled
  NO_SHOW = "no_show", // Customer didn't show up
}
