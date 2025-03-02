import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  styled,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { usePayment } from "../../hooks/usePayment";
import { useCustom } from "@refinedev/core";
import { PublicHeader } from "../../components/header/public";
import axios from "axios";

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

interface PaymentPageParams {
  bookingId: string;
}

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<keyof PaymentPageParams>() as PaymentPageParams;
  const navigate = useNavigate();
  const { processPayment, isProcessing } = usePayment();
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: bookingId,
    amount: 0,
  });
  const [bookingData, setBookingData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Get booking data from localStorage
    const savedData = localStorage.getItem("booking-data");
    if (savedData) {
      setBookingData(JSON.parse(savedData));
      // Clear after use
      localStorage.removeItem("booking-data");
    }
  }, []);

  // Use bookingData if available, otherwise fetch from API
  const { data: apiData, isLoading } = useCustom({
    url: `bookings/find-by-booking-id/${bookingId}`,
    method: "get",
    queryOptions: {
      enabled: !bookingData // Only run API call if no localStorage data
    }
  });

  // Combine data sources
  const data = bookingData || apiData?.data;

  useEffect(() => {
    if (data?.data) {
      setBookingDetails({
        bookingId: String(data.data.id),
        amount: data.data.deposit,
      });
    }
  }, [data]);

  useEffect(() => {
    // Make sure auth headers are set correctly
    const token = localStorage.getItem("auth-token") || localStorage.getItem("payment-redirect-token");
    if (token) {
      // Set token in your auth headers/context if needed
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setSessionExpired(true);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCompletePayment = async () => {
    await processPayment({
      bookingId: Number(bookingDetails.bookingId),
      amount: bookingDetails.amount,
      paymentMethod: "paynow",
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!bookingDetails.bookingId || !bookingDetails.amount) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <PaymentPaper>
          <Typography variant="h6" color="error" align="center">
            Missing or invalid booking details. Please try again.
          </Typography>
          <Box mt={3} textAlign="center">
            <ActionButton
              variant="contained"
              onClick={() => navigate('/booking')}
            >
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
          <Box sx={{ mb: 2, textAlign: 'center', color: timeLeft < 60 ? 'error.main' : 'text.secondary' }}>
            <Typography variant="subtitle1">
              Session expires in: {formatTime(timeLeft)}
            </Typography>
          </Box>
          
          {!sessionExpired ? (
            <>
              {/* Existing payment content */}
              <Subtitle variant="body1" gutterBottom>
                Use any PayNow-compatible app to complete your payment.
              </Subtitle>
              
              {/* Booking Details */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" sx={{ color: '#002147', mb: 1.25 }}>
                  <strong>Booking ID:</strong> {bookingId}
                </Typography>
                <Typography variant="body2" sx={{ color: '#002147', mb: 1.25 }}>
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
              <Box sx={{ textAlign: 'center' }}>
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
            <Box sx={{ textAlign: 'center' }}>
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
