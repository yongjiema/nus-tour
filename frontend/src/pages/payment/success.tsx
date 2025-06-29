import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  styled,
  CircularProgress,
  Grid2 as Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getThemeColor } from "../../theme/constants";
import { useTheme } from "@mui/material/styles";

const SuccessPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: "8px",
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
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  backgroundColor: getThemeColor(theme, "NUS_BLUE"),
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
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
  const theme = useTheme();

  useEffect(() => {
    // Retrieve payment confirmation from localStorage
    const storedData = localStorage.getItem("payment_confirmation");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as PaymentConfirmation;
        setPaymentDetails(parsedData);
        // Clean up localStorage after successfully loading the data
        localStorage.removeItem("booking-data");
        localStorage.removeItem("payment_confirmation");
      } catch (e) {
        console.error("Error parsing payment confirmation data:", e);
      }
    }
    setLoading(false);
  }, [id]);

  const handleViewBookings = () => {
    void navigate("/my-bookings");
  };

  const handleReturnHome = () => {
    void navigate("/");
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
        <SuccessPaper elevation={2}>
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
    <Container maxWidth="md" sx={{ mt: 6, mb: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          maxWidth: 600,
          width: "100%",
        }}
      >
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <ActionButton variant="contained" fullWidth onClick={handleViewBookings}>
              View My Bookings
            </ActionButton>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ActionButton
              variant="outlined"
              fullWidth
              onClick={handleReturnHome}
              sx={{
                backgroundColor: "transparent",
                color: getThemeColor(theme, "NUS_BLUE"),
                border: `1px solid ${getThemeColor(theme, "NUS_BLUE")}`,
              }}
            >
              Return to Home
            </ActionButton>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;
