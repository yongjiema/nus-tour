import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "../utils/errorHandler";
import { useNotification } from "@refinedev/core";

export interface PaymentData {
  bookingId: string; // UUID
  amount: number;
  paymentMethod?: string;
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutate } = useCustomMutation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { open } = useNotification();

  const processPayment = async (paymentData: PaymentData) => {
    setIsProcessing(true);

    try {
      if (!paymentData.bookingId) {
        throw new Error("Missing booking ID. Please try again or contact support.");
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const finalBookingId = paymentData.bookingId;

      console.log("Processing payment for bookingId:", finalBookingId);

      const response = await mutate({
        url: "payments",
        method: "post",
        values: {
          bookingId: finalBookingId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod || "paynow",
        },
        meta: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // Return just the successful status - we don't need the data
      const result = response !== undefined;

      // Store payment confirmation for success page
      // Use the original booking UUID for UI consistency
      const uuidForDisplay = finalBookingId;

      localStorage.setItem(
        "payment_confirmation",
        JSON.stringify({
          bookingId: uuidForDisplay,
          amount: paymentData.amount,
          date: new Date().toISOString(),
          transactionId: `TXN-${Date.now()}`,
        }),
      );

      open?.({
        message: "Payment successful",
        type: "success",
      });

      // Navigate to success page with UUID for display
      navigate(`/payment/success/${uuidForDisplay}`);

      return result;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
  };
};
