import React from "react";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";

export const BookingConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract booking details from query parameters
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const date = searchParams.get("date") || "";
  const groupSize = searchParams.get("groupSize") || "";
  const amount = searchParams.get("amount") || "0.00";

  const handleConfirm = () => {
    // Redirect to Payment Page with query params
    navigate(`/payment?name=${name}&amount=${amount}&date=${date}`);
  };

  const handleEdit = () => {
    // Navigate back to the booking form with the existing details
    navigate(
      `/booking?name=${encodeURIComponent(name)}&email=${encodeURIComponent(
        email
      )}&date=${encodeURIComponent(date)}&groupSize=${encodeURIComponent(
        groupSize
      )}`
    );
  };

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
          Please review your booking details below.
        </Typography>

        {/* Booking Details */}
        <Box style={{ marginBottom: "20px", textAlign: "left" }}>
          <Typography variant="body2" style={{ color: "#002147", marginBottom: "10px" }}>
            <strong>Name:</strong> {name}
          </Typography>
          <Typography variant="body2" style={{ color: "#002147", marginBottom: "10px" }}>
            <strong>Email:</strong> {email}
          </Typography>
          <Typography variant="body2" style={{ color: "#002147", marginBottom: "10px" }}>
            <strong>Tour Date:</strong> {date}
          </Typography>
          <Typography variant="body2" style={{ color: "#002147", marginBottom: "10px" }}>
            <strong>Group Size:</strong> {groupSize}
          </Typography>
          <Typography variant="body2" style={{ color: "#002147", marginBottom: "10px" }}>
            <strong>Amount:</strong> SGD {amount}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
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
            size="large"
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
