import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUpdate, useNotification } from "@refinedev/core";
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Paper,
  Button
} from "@mui/material";
import { useErrorHandler } from "../../utils/errorHandler";

// Import shared styled components
import {
  PageTitle as SharedPageTitle,
  ActionButton
} from "../../components/styled";

// Local styled components for specific UI elements
import { styled } from '@mui/material/styles';

const PaymentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3]
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: '#FF6600', // NUS orange
  marginBottom: theme.spacing(2.5)
}));

const QRContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center'
}));

const QRImage = styled('img')({
  display: 'block',
  margin: '20px auto',
  maxWidth: '200px',
  border: '1px solid #ddd',
  borderRadius: '8px'
});

const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { handleError } = useErrorHandler();
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: "",
    amount: "",
  });
  const [loading, setLoading] = useState(true);

  // Using Refine's useUpdate hook for API interaction
  const { mutate, isLoading: isSubmitting } = useUpdate();

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    const amount = searchParams.get("amount");

    if (!bookingId || !amount) {
      open?.({
        message: "Missing booking details",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (isNaN(Number(amount))) {
      open?.({
        message: "Invalid amount format",
        type: "error",
      });
      setLoading(false);
      return;
    }

    setBookingDetails({ bookingId, amount });
    setLoading(false);
  }, [searchParams, open]);

  const handlePaymentConfirmation = () => {
    mutate(
      {
        resource: "payments",
        id: bookingDetails.bookingId,
        values: {
          bookingId: bookingDetails.bookingId,
          status: "confirmed"
        }
      },
      {
        onSuccess: () => {
          open?.({
            message: "Payment confirmed successfully",
            type: "success",
          });
          navigate('/dashboard');
        },
        onError: (error) => {
          const errorMessage = handleError(error);
          open?.({
            message: "Payment confirmation failed",
            description: errorMessage,
            type: "error",
          });
        }
      }
    );
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
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
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <PaymentPaper>
        <SharedPageTitle variant="h4" gutterBottom>
          Payment Details
        </SharedPageTitle>
        <Subtitle variant="body1" gutterBottom>
          Use any PayNow-compatible app to complete your payment.
        </Subtitle>

        {/* Booking Details */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ color: '#002147', mb: 1.25 }}>
            <strong>Booking ID:</strong> {bookingDetails.bookingId}
          </Typography>
          <Typography variant="body2" sx={{ color: '#002147', mb: 1.25 }}>
            <strong>Amount to Pay:</strong> SGD {bookingDetails.amount}
          </Typography>
        </Box>

        {/* QR Code Section */}
        <QRContainer>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
            Open any app with PayNow functionality and scan the QR code below to
            complete your payment.
          </Typography>
          <QRImage
            src="https://placehold.co/200x200?text=PayNow+QR"
            alt="Mock PayNow QR Code"
          />
        </QRContainer>

        {/* Confirmation Button */}
        <ActionButton
          variant="contained"
          fullWidth
          onClick={handlePaymentConfirmation}
          disabled={isSubmitting}
          sx={{ mt: 2.5 }}
        >
          {isSubmitting ? "Processing..." : "Mark as Paid"}
        </ActionButton>
      </PaymentPaper>
    </Container>
  );
};

export default PaymentPage;
