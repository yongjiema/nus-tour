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

export const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    bookingId: Math.random().toString(36).substr(2, 9), // Generate a random booking ID,
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

  useEffect(() => {
    const storedData = JSON.parse(
      sessionStorage.getItem("bookingData") || "{}"
    );
    setFormData({
      bookingId:
        storedData.bookingId || Math.random().toString(36).substr(2, 9), // Ensure bookingId is set
      name: storedData.name || "",
      email: storedData.email || "",
      date: storedData.date || "",
      groupSize: storedData.groupSize || "",
      timeSlot: storedData.timeSlot || "",
      deposit: storedData.deposit || 50, // Ensure deposit is set from stored data if available
    });
  }, []);

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];

  async function fetchAvailableTimeSlots(date: string) {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/bookings/available-slots?date=${date}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch available time slots");
      }
      const data = await response.json();
      setTimeSlots(data);
    } catch (error) {
      alert("Failed to load available time slots. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save form data to session storage and navigate to the payment page
    sessionStorage.setItem("bookingData", JSON.stringify(formData));
    window.location.href = `/payment?bookingId=${formData.bookingId}&amount=${formData.deposit}`;
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={5} style={{ padding: "40px", borderRadius: "12px" }}>
        <Typography
          variant="h4"
          gutterBottom
          style={{ color: "#3f51b5", fontWeight: "bold", textAlign: "center" }}
        >
          Book a Campus Tour
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
                  min: formattedToday, // Restrict selection to today or future dates
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Group Size"
                name="groupSize"
                type="number"
                placeholder="Please input number of people"
                value={formData.groupSize || ""}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                inputProps={{ min: 1 }}
              />
            </Grid>
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
                {timeSlots.length > 0
                  ? timeSlots.map(({ slot, available }) => (
                      <MenuItem key={slot} value={slot}>
                        {slot} (Available: {available})
                      </MenuItem>
                    ))
                  : null}
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
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                style={{
                  backgroundColor: "#FF6600",
                  color: "#FFFFFF",
                  padding: "10px",
                  fontSize: "16px",
                }}
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
