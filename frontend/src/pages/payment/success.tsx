import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Button, Divider, Grid, styled, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { PublicHeader } from "../../components/header/public";

const SuccessPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const SuccessIcon = styled(CheckCircleIcon)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.success.main,
  marginBottom: theme.spacing(2),
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(1.5, 0),
  borderBottom: "1px solid #eaeaea",
  "&:last-child": {
    borderBottom: "none",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  backgroundColor: "#002147",
  "&:hover": {
    backgroundColor: "#001a38",
  },
}));

interface PaymentConfirmation {
  bookingId: string;
  amount: number;
  date: string;
  transactionId: string;
}

const PaymentSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve payment confirmation from localStorage
    const storedData = localStorage.getItem("payment_confirmation");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setPaymentDetails(parsedData);
      } catch (e) {
        console.error("Error parsing payment confirmation data:", e);
      }
    }
    setLoading(false);
  }, [id]);

  const handleViewBookings = () => {
    navigate("/my-bookings");
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!paymentDetails) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <SuccessPaper>
          <Typography variant="h6" color="error" align="center">
            Payment confirmation details not found.
          </Typography>
          <Box mt={3} textAlign="center">
            <ActionButton variant="contained" onClick={handleReturnHome}>
              Return to Home
            </ActionButton>
          </Box>
        </SuccessPaper>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <SuccessPaper>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <SuccessIcon />
            <Typography variant="h4" gutterBottom align="center">
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              Your booking has been confirmed. Thank you for your payment.
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom>
            Payment Details
          </Typography>

          <Box sx={{ mb: 3 }}>
            <DetailRow>
              <Typography variant="body1" color="textSecondary">
                Booking ID
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {paymentDetails.bookingId}
              </Typography>
            </DetailRow>

            <DetailRow>
              <Typography variant="body1" color="textSecondary">
                Amount Paid
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                SGD {paymentDetails.amount.toFixed(2)}
              </Typography>
            </DetailRow>

            <DetailRow>
              <Typography variant="body1" color="textSecondary">
                Transaction ID
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {paymentDetails.transactionId}
              </Typography>
            </DetailRow>

            <DetailRow>
              <Typography variant="body1" color="textSecondary">
                Payment Date
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {new Date(paymentDetails.date).toLocaleString()}
              </Typography>
            </DetailRow>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ActionButton variant="contained" fullWidth onClick={handleViewBookings}>
                View My Bookings
              </ActionButton>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ActionButton
                variant="outlined"
                fullWidth
                onClick={handleReturnHome}
                sx={{ backgroundColor: "transparent", color: "#002147", border: "1px solid #002147" }}
              >
                Return to Home
              </ActionButton>
            </Grid>
          </Grid>
        </SuccessPaper>
      </Container>
    </>
  );
};

export default PaymentSuccessPage;
