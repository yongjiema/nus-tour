import { useState, useEffect } from "react";
import { Container, Typography, Box, Paper, Button, CircularProgress, styled } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { usePayment } from "../../hooks/usePayment";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { PublicHeader } from "../../components/header/public";
import { BookingStatus } from "../../types/enums";
import * as dataProviders from "../../dataProvider";

const PaymentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const QRContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
}));

const QRImage = styled("img")({
  width: "200px",
  height: "200px",
  marginTop: "16px",
  border: "1px solid #eaeaea",
});

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  backgroundColor: "#002147",
  "&:hover": {
    backgroundColor: "#001a38",
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
}));

const SharedPageTitle = styled(Typography)({
  fontWeight: "bold",
  color: "#002147",
});

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processPayment, isProcessing } = usePayment();
  const [timeLeft, setTimeLeft] = useState(300);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { mutate } = useCustomMutation();

  // Single state for booking details
  const [bookingDetails, setBookingDetails] = useState<{
    id: string | null;
    amount: number;
  }>({
    id: id || null,
    amount: 50,
  });

  // Initialize from localStorage first
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("booking-data");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("Found booking data in localStorage:", parsedData);

        setBookingDetails({
          id: parsedData.id || parsedData.bookingId || id,
          amount: parsedData.deposit || 50,
        });

        // Optional: Remove after use
        // localStorage.removeItem("booking-data");
      }
    } catch (e) {
      console.error("Error parsing booking data:", e);
    }
  }, [id]);

  // Only fetch from API if we have an ID and no localStorage data
  const { data: apiData, isLoading } = useCustom({
    url: `/bookings/${bookingDetails.id || ""}`,
    method: "get",
    queryOptions: {
      enabled: !!bookingDetails.id,
    },
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      setSessionExpired(true);

      // Update booking status to PAYMENT_FAILED
      const updateBookingStatus = async () => {
        try {
          await dataProviders.default.custom({
            url: `bookings/${bookingDetails.id}/payment-status`,
            method: "post",
            payload: {
              status: BookingStatus.PAYMENT_FAILED,
              transactionId: `EXPIRED-${Date.now()}`,
            },
          });
          console.log("Payment session expired, booking status updated to PAYMENT_FAILED");
        } catch (error) {
          console.error("Failed to update booking status on expiration:", error);
        }
      };

      // Call the function to update status
      updateBookingStatus();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, bookingDetails.id]);

  // Update from API data if available
  useEffect(() => {
    if (apiData?.data) {
      console.log("Received API booking data:", apiData.data);
      setBookingDetails((prev) => ({
        ...prev,
        amount: apiData.data.deposit || prev.amount,
      }));
    }
  }, [apiData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCompletePayment = async () => {
    if (!bookingDetails.id) {
      console.error("Missing booking ID");
      return;
    }

    try {
      const transactionId = `TXN-${Date.now()}`;

      // 1. Process payment
      await processPayment({
        bookingId: bookingDetails.id,
        amount: bookingDetails.amount,
        paymentMethod: "paynow",
      });

      // 2. Update booking status AND create payment record
      await dataProviders.default.custom({
        url: `bookings/${bookingDetails.id}/payment-status`,
        method: "post",
        payload: {
          status: BookingStatus.PAYMENT_COMPLETED,
          transactionId: transactionId,
        },
      });

      // 3. Store confirmation details and navigate
      localStorage.setItem(
        "payment_confirmation",
        JSON.stringify({
          bookingId: typeof bookingDetails.id === "string" ? bookingDetails.id : "",
          amount: bookingDetails.amount,
          date: new Date().toISOString(),
          transactionId: transactionId,
        }),
      );
      console.log("Navigating to success page");
      navigate(`/payment/success/${bookingDetails.id}`);
    } catch (error) {
      console.error("Payment processing error:", error);

      alert("Payment processing failed. Please try again or contact support.");
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!bookingDetails.id || !bookingDetails.amount) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <PaymentPaper>
          <Typography variant="h6" color="error" align="center">
            Missing or invalid booking details. Please try again.
          </Typography>
          <Box mt={3} textAlign="center">
            <ActionButton variant="contained" onClick={() => navigate("/booking")}>
              Return to Booking
            </ActionButton>
          </Box>
        </PaymentPaper>
      </Container>
    );
  }

  return (
    <>
      <PublicHeader />
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <PaymentPaper>
          <SharedPageTitle variant="h4" gutterBottom>
            Payment Details
          </SharedPageTitle>

          {/* Timer display */}
          <Box sx={{ mb: 2, textAlign: "center", color: timeLeft < 60 ? "error.main" : "text.secondary" }}>
            <Typography variant="subtitle1">Session expires in: {formatTime(timeLeft)}</Typography>
          </Box>

          {!sessionExpired ? (
            <>
              {/* Existing payment content */}
              <Subtitle variant="body1" gutterBottom>
                Use any PayNow-compatible app to complete your payment.
              </Subtitle>

              {/* Booking Details */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" sx={{ color: "#002147", mb: 1.25 }}>
                  <strong>Booking ID:</strong> {bookingDetails.id}
                </Typography>
                <Typography variant="body2" sx={{ color: "#002147", mb: 1.25 }}>
                  <strong>Amount to Pay:</strong> SGD {bookingDetails.amount}
                </Typography>
              </Box>

              {/* QR Code */}
              <QRContainer>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
                  Scan the QR code to complete payment
                </Typography>
                <QRImage src="https://placehold.co/200x200?text=PayNow+QR" alt="PayNow QR Code" />
              </QRContainer>

              {/* Payment Button */}
              <Box sx={{ textAlign: "center" }}>
                <ActionButton
                  variant="contained"
                  disabled={isProcessing}
                  onClick={handleCompletePayment}
                  startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isProcessing ? "Processing..." : "Confirm Payment"}
                </ActionButton>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="error.main" gutterBottom>
                Your payment session has expired
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Please restart the booking process to try again.
              </Typography>
              <ActionButton variant="contained" onClick={() => navigate("/booking")}>
                Return to Booking
              </ActionButton>
            </Box>
          )}
        </PaymentPaper>
      </Container>
    </>
  );
};

export default PaymentPage;
