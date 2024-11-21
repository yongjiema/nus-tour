import React from "react";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const bookingData = JSON.parse(sessionStorage.getItem("bookingData") || "{}");

  if (!bookingData.name || !bookingData.email) {
    navigate("/booking");
    return null;
  }

  const handleConfirm = async () => {
    try {
      // Make an API call to store the booking data in the database
      const response = await fetch("http://localhost:3000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          paymentStatus: "pending", // Set the payment status to pending
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save booking data");
      }

      // Clear booking data from sessionStorage after saving to the database
      sessionStorage.removeItem("bookingData");

      // Navigate to the payment page
      navigate("/payment");
    } catch (error) {
      alert("There was an error saving your booking. Please try again.");
    }
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
