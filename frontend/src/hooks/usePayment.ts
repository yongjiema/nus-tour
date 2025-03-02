import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "../utils/errorHandler";
import { useNotification } from "@refinedev/core";
import { PaymentStatus } from '../api/types';

export interface PaymentData {
  bookingId: number;
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
      // Simulate payment gateway processing
      // In a real app, you would integrate with a payment provider here
      const simulatePaymentGateway = () => {
        return new Promise<{ transactionId: string }>((resolve) => {
          setTimeout(() => {
            resolve({ transactionId: `txn_${Date.now()}` });
          }, 1500);
        });
      };

      // Simulate payment gateway response
      const gatewayResponse = await simulatePaymentGateway();

      // Record payment in backend
      await mutate({
        url: "payments",
        method: "post",
        values: {
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          status: PaymentStatus.COMPLETED,
          transactionId: gatewayResponse.transactionId,
          paymentMethod: paymentData.paymentMethod || "paynow",
        },
      });

      // Success notification
      open?.({
        message: "Payment Successful",
        description: "Your booking has been confirmed.",
        type: "success",
      });

      // Redirect to confirmation page
      navigate(`/booking/confirmation/${paymentData.bookingId}`);
    } catch (error) {
      // Update payment status to failed
      try {
        await mutate({
          url: "payments/status",
          method: "patch",
          values: {
            bookingId: paymentData.bookingId,
            status: "failed",
          },
        });
      } catch (updateError) {
        console.error("Failed to update payment status:", updateError);
      }

      // Handle error
      const errorMessage = handleError(error);
      open?.({
        message: "Payment Failed",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
  };
}; 