import React from "react";
import { Container, Box, Typography, Button, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { useCreate, useNotification } from "@refinedev/core";
import { useErrorHandler } from "../../utils/errorHandler";
import { formatDateDisplay } from "../../utils/dateUtils";

const ConfirmationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.shadows[3]
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  color: '#002147', // NUS blue
  fontWeight: "bold",
  marginBottom: theme.spacing(1)
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3)
}));

const BookingDetail = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.25),
  display: "flex",
  justifyContent: "space-between"
}));

const DetailLabel = styled('span')({
  fontWeight: "bold"
});

const EditButton = styled(Button)(({ theme }) => ({
  borderColor: '#002147', // NUS blue
  color: '#002147',
  fontWeight: "bold",
  '&:hover': {
    borderColor: '#001a38',
    backgroundColor: 'rgba(0, 33, 71, 0.04)'
  }
}));

const ConfirmButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF6600', // NUS orange
  color: '#FFFFFF',
  fontWeight: "bold",
  '&:hover': {
    backgroundColor: '#E05A00' // Darker orange
  }
}));

interface BookingResponse {
  bookingId: string;
}

export const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const { handleError } = useErrorHandler();

  // Use Refine's useCreate hook instead of direct dataProvider call
  const { mutate, isLoading } = useCreate();

  // Get booking data from sessionStorage
  const bookingData = JSON.parse(sessionStorage.getItem("bookingData") || "{}");

  // Redirect to booking form if no data exists
  if (!bookingData.name || !bookingData.email) {
    navigate("/booking");
    return null;
  }

  const handleConfirm = async () => {
    try {
      // Use Refine's mutation hook to create booking
      const response = await mutate({
        resource: "bookings",
        values: bookingData
      });

      // Extract booking ID from response
      const bookingId = response?.data?.bookingId;

      if (!bookingId) {
        throw new Error("No booking ID received from server");
      }

      // Save bookingId and redirect to payment page
      sessionStorage.setItem("bookingId", bookingId);
      navigate(`/payment?bookingId=${bookingId}&amount=${bookingData.deposit || 50}`);

    } catch (error) {
      handleError(error);
    }
  };

  const handleEdit = () => navigate("/booking");

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <ConfirmationPaper>
        <PageTitle variant="h4" gutterBottom>
          Confirm Your Booking
        </PageTitle>

        <Subtitle variant="body1" gutterBottom>
          Please review your booking details below. A security deposit of S$
          {bookingData.deposit || 50} is required to confirm your booking. This
          deposit will be refunded within a few days after your visit.
        </Subtitle>

        <Box sx={{ mb: 3, textAlign: "left" }}>
          <BookingDetail variant="body2">
            <DetailLabel>Name:</DetailLabel> {bookingData.name}
          </BookingDetail>

          <BookingDetail variant="body2">
            <DetailLabel>Email:</DetailLabel> {bookingData.email}
          </BookingDetail>

          <BookingDetail variant="body2">
            <DetailLabel>Tour Date:</DetailLabel> {
              bookingData.date ? formatDateDisplay(bookingData.date) : 'Not specified'
            }
          </BookingDetail>

          <BookingDetail variant="body2">
            <DetailLabel>Group Size:</DetailLabel> {bookingData.groupSize}
          </BookingDetail>

          <BookingDetail variant="body2">
            <DetailLabel>Time Slot:</DetailLabel> {bookingData.timeSlot}
          </BookingDetail>

          <BookingDetail variant="body2">
            <DetailLabel>Deposit Amount:</DetailLabel> S${bookingData.deposit || 50}
          </BookingDetail>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <EditButton
              variant="outlined"
              fullWidth
              onClick={handleEdit}
            >
              Edit Details
            </EditButton>
          </Grid>

          <Grid item xs={12} sm={6}>
            <ConfirmButton
              variant="contained"
              fullWidth
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm & Pay"}
            </ConfirmButton>
          </Grid>
        </Grid>
      </ConfirmationPaper>
    </Container>
  );
};

export default BookingConfirmation;
