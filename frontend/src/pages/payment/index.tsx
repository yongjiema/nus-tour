import React, { useEffect, useState } from "react";
import { Typography, Container, Paper, Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";

export const Payment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: "",
    amount: "",
    });

  useEffect(() => {
    // Extract booking details from query params
    const bookingId = searchParams.get("bookingId") || "";
    const amount = searchParams.get("amount") || "";
    setBookingDetails({ bookingId, amount });
  }, [searchParams]);

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
              Open any app with PayNow functionality and scan the QR code below to complete
              your payment.
            </Typography>
            <img
              src="https://placehold.co/200x200?text=PayNow+QR"
              alt="PayNow QR Code"
              style={{
                display: "block",
                margin: "20px auto",
                maxWidth: "200px",
              }}
            />
          </Box>
        </Paper>
      </Container>
    );
};
