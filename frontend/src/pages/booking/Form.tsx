import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Grid, Paper, Typography } from "@mui/material";

export const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    groupSize: "",
    deposit: 50,
  });

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("bookingData") || "{}");
    setFormData({
      name: storedData.name || "",
      email: storedData.email || "",
      date: storedData.date || "",
      groupSize: storedData.groupSize || "",
      deposit: 50,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("bookingData", JSON.stringify(formData));
    window.location.href = "/booking/confirmation";
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
              <Typography variant="body2" color="textSecondary">
                A security deposit of SGD {formData.deposit} is required to confirm your booking. This deposit will be fully refunded within a few days after your visit.
              </Typography>
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
