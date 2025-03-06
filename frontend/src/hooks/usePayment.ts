import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "../utils/errorHandler";
import { useNotification } from "@refinedev/core";

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
      if (!paymentData.bookingId) {
        throw new Error("Missing booking ID. Please try again or contact support.");
      }
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      console.log("Processing payment for booking:", paymentData.bookingId);
      
      const response = await mutate({
        url: "payments",
        method: "post",
        values: {
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod || "paynow",
        },
        meta: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });
      
      // Return just the successful status - we don't need the data
      const result = response !== undefined;
      
      // Store payment confirmation for success page
      localStorage.setItem("payment_confirmation", JSON.stringify({
        bookingId: paymentData.bookingId.toString(),
        amount: paymentData.amount,
        date: new Date().toISOString(),
        transactionId: `TXN-${Date.now()}`
      }));
      
      open?.({
        message: "Payment successful",
        type: "success",
      });
      
      // Navigate to the success page with the booking ID
      navigate(`/payment/success/${paymentData.bookingId}`);
      
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
