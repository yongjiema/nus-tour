import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  styled,
  Divider,
  CircularProgress,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useOne } from "@refinedev/core";
import { PublicHeader } from "../../components/header/public";

const ConfirmationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const SuccessIcon = styled(CheckCircle)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.success.main,
  marginBottom: theme.spacing(2),
}));

const DetailsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(1, 0),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  backgroundColor: "#002147",
  "&:hover": {
    backgroundColor: "#001a38",
  },
}));

const BookingConfirmation: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useOne({
    resource: "bookings",
    id: bookingId,
  });

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!data?.data) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <ConfirmationPaper>
          <Typography variant="h6" color="error" align="center">
            Booking not found. Please check your booking details.
          </Typography>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <ActionButton
              variant="contained"
              onClick={() => navigate("/booking")}
            >
              Return to Booking
            </ActionButton>
          </Box>
        </ConfirmationPaper>
      </Container>
    );
  }

  const booking = data.data;

  return (
    <>
      <PublicHeader />
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <ConfirmationPaper>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <SuccessIcon />
            <Typography variant="h4" align="center" gutterBottom>
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              Your payment has been received and your booking is confirmed.
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Booking Details
          </Typography>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Booking ID</Typography>
            <Typography variant="body2">{booking.bookingId}</Typography>
          </DetailsRow>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Name</Typography>
            <Typography variant="body2">{booking.name}</Typography>
          </DetailsRow>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Email</Typography>
            <Typography variant="body2">{booking.email}</Typography>
          </DetailsRow>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Date</Typography>
            <Typography variant="body2">{booking.date}</Typography>
          </DetailsRow>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Time</Typography>
            <Typography variant="body2">{booking.timeSlot}</Typography>
          </DetailsRow>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Group Size</Typography>
            <Typography variant="body2">{booking.groupSize} people</Typography>
          </DetailsRow>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Amount Paid</Typography>
            <Typography variant="body2">SGD {booking.deposit}</Typography>
          </DetailsRow>

          <DetailsRow>
            <Typography variant="body2" color="textSecondary">Payment Status</Typography>
            <Typography variant="body2" sx={{ color: booking.paymentStatus === 'completed' ? 'success.main' : 'warning.main' }}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Typography>
          </DetailsRow>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <ActionButton
              variant="contained"
              onClick={() => navigate("/")}
            >
              Return to Home
            </ActionButton>
          </Box>
        </ConfirmationPaper>
      </Container>
    </>
  );
};

export default BookingConfirmation;
