import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  Typography,
  Container,
  Paper,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: "",
    amount: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    const amount = searchParams.get("amount");

    if (!bookingId || !amount) {
      console.error("Invalid booking details.");
      setErrorMessage("Missing booking details. Please try again.");
      setLoading(false);
      return;
    }

    if (isNaN(Number(amount))) {
      console.error("Invalid amount format.");
      setErrorMessage("Amount must be a valid number.");
      setLoading(false);
      return;
    }

    if (Number(amount) <= 0) {
      console.error("Amount must be greater than 0.");
      setErrorMessage("Invalid amount. It must be greater than 0.");
      setLoading(false);
      return;
    }

    setBookingDetails({ bookingId, amount });
    setLoading(false);
  }, [searchParams]);

  const handlePaymentConfirmation = async () => {
    try {
      await axios.post("/api/payments/confirm", {
        bookingId: bookingDetails.bookingId,
      });
      alert("Payment confirmed!");
    } catch (error) {
      alert("Failed to confirm payment");
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!bookingDetails.bookingId || !bookingDetails.amount) {
    return (
      <Container maxWidth="sm" style={{ marginTop: "50px" }}>
        <Paper elevation={3} style={{ padding: "30px" }}>
          <Typography
            variant="h6"
            style={{ color: "red", textAlign: "center" }}
          >
            {errorMessage || "Missing or invalid booking details. Please try again."}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "30px" }}>
        <Typography
          variant="h4"
          gutterBottom
          style={{ color: "#002147", fontWeight: "bold" }}
        >
          Payment Details
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          style={{ color: "#FF6600", marginBottom: "20px" }}
        >
          Use any PayNow-compatible app to complete your payment.
        </Typography>

        {/* Booking Details */}
        <Box style={{ marginBottom: "20px" }}>
          <Typography
            variant="body2"
            style={{ color: "#002147", marginBottom: "10px" }}
          >
            <strong>Booking ID:</strong> {bookingDetails.bookingId}
          </Typography>
          <Typography
            variant="body2"
            style={{ color: "#002147", marginBottom: "10px" }}
          >
            <strong>Amount to Pay:</strong> SGD {bookingDetails.amount}
          </Typography>
        </Box>

        {/* QR Code Section */}
        <Box
          style={{
            backgroundColor: "#F5F5F5",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ marginBottom: "20px" }}
          >
            Open any app with PayNow functionality and scan the QR code below to
            complete your payment.
          </Typography>
          <img
            src="https://placehold.co/200x200?text=PayNow+QR"
            alt="Mock PayNow QR Code"
            style={{
              display: "block",
              margin: "20px auto",
              maxWidth: "200px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
        </Box>

        {/* Confirmation Button */}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: "20px" }}
          onClick={handlePaymentConfirmation}
        >
          Mark as Paid
        </Button>
      </Paper>
    </Container>
  );
};

export default PaymentPage;
