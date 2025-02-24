import React from "react";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as dataProviders from "../../dataProviders";

interface BookingResponse {
  bookingId: string;
}

export const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const bookingData = JSON.parse(sessionStorage.getItem("bookingData") || "{}");

  if (!bookingData.name || !bookingData.email) {
    navigate("/booking");
    return null;
  }

  const handleConfirm = async () => {
    const bookingData = JSON.parse(sessionStorage.getItem("bookingData") || "{}");

    // Simulate saving to the database and include bookingId
    const response = await dataProviders.backend.custom({
      url: "/bookings",
      method: "post",
      payload: bookingData,
    });
    const data = response.data as BookingResponse;
    sessionStorage.setItem("bookingId", data.bookingId); // Save bookingId
    window.location.href = `/payment?bookingId=${data.bookingId}&amount=50`;
  };

  const handleEdit = () => navigate("/booking");

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "30px", textAlign: "center" }}>
        <Typography
          variant="h4"
          gutterBottom
          style={{ color: "#002147", fontWeight: "bold" }}
        >
          Confirm Your Booking
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          style={{ marginBottom: "20px" }}
        >
          Please review your booking details below. A security deposit of S$
          {bookingData.deposit} is required to confirm your booking. This
          deposit will be refunded within a few days after your visit.
        </Typography>

        <Box style={{ marginBottom: "20px", textAlign: "left" }}>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            <strong>Name:</strong> {bookingData.name}
          </Typography>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            <strong>Email:</strong> {bookingData.email}
          </Typography>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            <strong>Tour Date:</strong> {bookingData.date}
          </Typography>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            <strong>Group Size:</strong> {bookingData.groupSize}
          </Typography>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            <strong>Time Slot:</strong> {bookingData.timeSlot}
          </Typography>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            <strong>Deposit Amount:</strong> S${bookingData.deposit}
          </Typography>
        </Box>

        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={handleEdit}
            style={{
              borderColor: "#002147",
              color: "#002147",
              fontWeight: "bold",
            }}
          >
            Edit Details
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleConfirm}
            style={{
              backgroundColor: "#FF6600",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            Confirm & Proceed to Payment
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
