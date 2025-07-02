import { useCustomMutation, useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { logger } from "../utils/logger";
import { handleRefineError } from "../utils/errorHandler";
import type { PaymentData, PaymentResponse } from "../types/api.types";

export const usePayment = () => {
  const navigate = useNavigate();
  const { open } = useNotification();

  // Use Refine's custom mutation with built-in error handling
  const { mutate, isPending } = useCustomMutation<PaymentResponse>();

  const processPayment = (paymentData: PaymentData): void => {
    // Validation
    if (!paymentData.bookingId) {
      open?.({
        message: "Missing booking ID. Please try again or contact support.",
        type: "error",
      });
      return;
    }

    logger.debug("Processing payment for bookingId:", { bookingId: paymentData.bookingId });

    mutate(
      {
        url: "payments",
        method: "post",
        values: {
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod ?? "paynow",
        },
      },
      {
        onSuccess: (response) => {
          // Store payment confirmation for success page
          localStorage.setItem(
            "payment_confirmation",
            JSON.stringify({
              bookingId: paymentData.bookingId,
              amount: paymentData.amount,
              date: new Date().toISOString(),
              transactionId: response.data.transactionId,
            }),
          );

          open?.({
            message: "Payment successful",
            type: "success",
          });

          // Navigate to success page
          void navigate(`/payment/success/${paymentData.bookingId}`);
        },
        onError: (error) => {
          // Use the enhanced error handler
          handleRefineError(error, open);
        },
      },
    );
  };

  return {
    processPayment,
    isProcessing: isPending,
  };
};
