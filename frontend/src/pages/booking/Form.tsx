import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import * as dataProviders from "../../dataProviders";

export const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    groupSize: "",
    timeSlot: "",
    deposit: 50,
  });
  const [timeSlots, setTimeSlots] = useState<
    { slot: string; available: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Restrict date selection to today and beyond
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];

  // Fetch available time slots when the date changes
  async function fetchAvailableTimeSlots(date: string) {
    try {
      setLoading(true);
      const response = await dataProviders.backend.custom({
        url: `/bookings/available-slots`,
        method: "get",
        payload: {
          date
        }
      });
      const data = response.data as any;
      setTimeSlots(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load available time slots. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "groupSize" ? Math.max(1, parseInt(value, 10) || 1) : value,
    });

    if (name === "date") {
      fetchAvailableTimeSlots(value);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save form data in session storage
    sessionStorage.setItem("bookingData", JSON.stringify(formData));
    // Redirect to Confirmation Page
    window.location.href = "/booking/confirmation";
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={5} style={{ padding: "40px", borderRadius: "12px" }}>
        <Typography variant="h4" gutterBottom style={{ textAlign: "center" }}>
          Book a Campus Tour
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            {/* Email */}
            <Grid item xs={12}>
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
            </Grid>
            {/* Date */}
            <Grid item xs={12}>
              <TextField
                label="Preferred Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: formattedToday, // Prevent selecting past dates
                }}
              />
            </Grid>
            {/* Group Size */}
            <Grid item xs={12}>
              <TextField
                label="Group Size"
                name="groupSize"
                type="number"
                value={formData.groupSize || ""}
                placeholder="Enter number of people"
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                inputProps={{ min: 1 }}
              />
            </Grid>
            {/* Time Slot */}
            <Grid item xs={12}>
              <TextField
                select
                label="Select Time Slot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                disabled={loading || !timeSlots.length}
                helperText={
                  loading
                    ? "Loading available time slots..."
                    : !timeSlots.length
                    ? "No available slots"
                    : "Please select a time slot"
                }
              >
                {timeSlots.map(({ slot, available }) => (
                  <MenuItem key={slot} value={slot}>
                    {slot} (Available: {available})
                  </MenuItem>
                ))}
              </TextField>
              {loading && (
                <CircularProgress
                  size={24}
                  style={{
                    marginTop: "10px",
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ textAlign: "center" }}
              >
                A security deposit of SGD {formData.deposit} is required to
                confirm your booking. This deposit will be fully refunded within
                a few days after your visit.
              </Typography>
            </Grid>
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                style={{
                  backgroundColor: "#FF6600",
                  color: "#FFFFFF",
                }}
              >
                Proceed to Confirmation
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};
