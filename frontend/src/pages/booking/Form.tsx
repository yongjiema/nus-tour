import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, TextField, Button, Grid, Paper, Typography } from "@mui/material";

export const BookingForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    groupSize: "",
  });

  useEffect(() => {
    // Pre-fill form if query parameters exist
    setFormData({
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      date: searchParams.get("date") || "",
      groupSize: searchParams.get("groupSize") || "",
    });
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Redirect to Confirmation Page with booking details
    const amount = "50"; // Replace with dynamic amount calculation if needed
    window.location.href = `/booking/confirmation?name=${encodeURIComponent(
      formData.name
    )}&email=${encodeURIComponent(formData.email)}&date=${encodeURIComponent(
      formData.date
    )}&groupSize=${encodeURIComponent(formData.groupSize)}&amount=${amount}`;
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "30px" }}>
        <Typography
          variant="h4"
          gutterBottom
          style={{ color: "#002147", fontWeight: "bold" }}
        >
          Book a Campus Tour
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Preferred Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Group Size"
                name="groupSize"
                type="number"
                value={formData.groupSize}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                style={{ backgroundColor: "#FF6600", color: "#FFFFFF" }}
              >
                Confirm Booking
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};
