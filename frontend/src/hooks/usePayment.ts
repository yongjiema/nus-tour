import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "../utils/errorHandler";
import { useNotification } from "@refinedev/core";

export interface PaymentData {
  bookingId: string | number;
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
      if (!paymentData.bookingId && paymentData.bookingId !== 0) {
        throw new Error("Missing booking ID. Please try again or contact support.");
      }
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Check localStorage for booking data to get numeric ID
      let numericId: number | null = null;
      let uuidBookingId: string | null = null;
      try {
        const storedData = localStorage.getItem("booking-data");
        if (storedData) {
          const bookingData = JSON.parse(storedData);
          console.log("Found booking data for payment:", bookingData);
          
          // First check for UUID bookingId
          if (bookingData.bookingId && typeof bookingData.bookingId === 'string') {
            uuidBookingId = bookingData.bookingId;
            console.log("Using UUID bookingId for payment:", uuidBookingId);
          }
          // Fallback to numeric ID only if UUID is not available
          else if (bookingData.id && typeof bookingData.id === 'number') {
            numericId = bookingData.id;
            console.log("Using numeric ID for payment:", numericId);
          }
        }
      } catch (e) {
        console.error("Error retrieving booking data:", e);
      }
      
      // Always prioritize the UUID over numeric ID
      // If the original paymentData.bookingId is a string (UUID), use that
      // Otherwise use the UUID from localStorage, then fallback to the original bookingId
      const finalBookingId = 
        (typeof paymentData.bookingId === 'string' && paymentData.bookingId) || 
        uuidBookingId || 
        paymentData.bookingId;
        
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
            Authorization: `Bearer ${token}`
          }
        }
      });
      
      // Return just the successful status - we don't need the data
      const result = response !== undefined;
      
      // Store payment confirmation for success page
      // Use the original booking UUID for UI consistency
      const uuidForDisplay = typeof paymentData.bookingId === 'string' ? 
        paymentData.bookingId : String(paymentData.bookingId);
      
      localStorage.setItem("payment_confirmation", JSON.stringify({
        bookingId: uuidForDisplay,
        amount: paymentData.amount,
        date: new Date().toISOString(),
        transactionId: `TXN-${Date.now()}`
      }));
      
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
