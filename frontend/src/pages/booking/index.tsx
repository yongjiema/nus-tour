import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

export const Booking: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    groupSize: "",
    comments: "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation example
    if (!formData.name || !formData.email || !formData.date || !formData.groupSize) {
      alert("Please fill in all required fields.");
      return;
    }

    // Simulate API call for booking
    console.log("Booking details:", formData);
    setSuccess(true);
    setFormData({
      name: "",
      email: "",
      date: "",
      groupSize: "",
      comments: "",
    });
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
        <Typography
          variant="body1"
          gutterBottom
          style={{ color: "#FF6600", marginBottom: "20px" }}
        >
          Please fill in your details below to book a guided campus tour.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Name */}
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
              />
            </Grid>

            {/* Preferred Tour Date */}
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

            {/* Group Size */}
            <Grid item xs={12}>
              <TextField
                label="Group Size"
                name="groupSize"
                type="number"
                value={formData.groupSize}
                onChange={handleChange}
                fullWidth
                required
                select
              >
                <MenuItem value="1">1 Person</MenuItem>
                <MenuItem value="2">2 People</MenuItem>
                <MenuItem value="3-5">3-5 People</MenuItem>
                <MenuItem value="6-10">6-10 People</MenuItem>
                <MenuItem value="11+">11 or More</MenuItem>
              </TextField>
            </Grid>

            {/* Additional Comments */}
            <Grid item xs={12}>
              <TextField
                label="Additional Comments (optional)"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                style={{ backgroundColor: "#FF6600", color: "#FFFFFF" }}
              >
                Confirm Booking
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Booking confirmed! We will contact you shortly.
        </Alert>
      </Snackbar>
    </Container>
  );
};
