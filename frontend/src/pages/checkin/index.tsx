import React, { useState } from "react";
import { Container, Paper, Typography, TextField, Button, Box } from "@mui/material";
import axios from "axios";

const Checkin = () => {
  const [formData, setFormData] = useState({ bookingId: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/checkin`, formData);
      setSuccess("Check-in successful!");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error("Axios error:", err.response?.data || err.message);
      } else {
        console.error("Unexpected error:", err);
      }
      setError("Check-in failed. Please verify your details and try again.");
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "30px" }}>
        <Typography variant="h4" gutterBottom style={{ color: "#002147", fontWeight: "bold", textAlign: "center" }}>
          Participant Check-In
        </Typography>
        <Typography variant="body1" gutterBottom style={{ marginBottom: "20px", textAlign: "center" }}>
          Please enter your Booking ID and Email Address to check in.
        </Typography>
        <form onSubmit={handleCheckin}>
          <Box mb={2}>
            <TextField
              label="Booking ID"
              name="bookingId"
              value={formData.bookingId}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Box>
          {error && (
            <Typography variant="body2" style={{ color: "red", marginBottom: "16px" }}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography variant="body2" style={{ color: "green", marginBottom: "16px" }}>
              {success}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? "Processing..." : "Check-In"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Checkin;
