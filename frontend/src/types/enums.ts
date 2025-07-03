export enum BookingStatus {
  // Slot reservation (pre-payment)
  SLOT_RESERVED = "slot_reserved", // Slot is temporarily held; countdown active
  SLOT_EXPIRED = "slot_expired", // Hold expired; slot released

  // Payment flow
  AWAITING_PAYMENT = "awaiting_payment", // Awaiting successful charge
  PAYMENT_FAILED = "payment_failed", // Payment attempt declined/errored
  PAID = "paid", // Charge succeeded, awaiting confirmation (or instantly confirmed)

  // Booking confirmation
  CONFIRMED = "confirmed", // Slot officially reserved after payment approval

  // Cancellation
  CANCELLED = "cancelled", // Cancelled before tour date

  // Refunds
  REFUND_PENDING = "refund_pending", // Refund requested, awaiting settlement
  REFUNDED = "refunded", // Refund settled successfully
  REFUND_FAILED = "refund_failed", // Refund could not be processed automatically

  // Tour execution
  CHECKED_IN = "checked_in", // Customer has arrived and been verified
  NO_SHOW = "no_show", // Customer did not arrive
  COMPLETED = "completed", // Tour completed successfully
}
