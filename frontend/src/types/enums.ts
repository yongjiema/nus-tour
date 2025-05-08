export enum BookingLifecycleStatus {
  // Initial status when booking is created
  PENDING_PAYMENT = "pending_payment",

  // Payment related statuses
  PAYMENT_COMPLETED = "payment_completed",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_REFUNDED = "payment_refunded",

  // Booking confirmation statuses
  CONFIRMED = "confirmed",

  // Tour execution statuses
  CHECKED_IN = "checked_in",
  COMPLETED = "completed",

  // Cancellation statuses
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}
