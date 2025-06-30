import React, { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { Container, Typography, TextField, Button, Paper, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@refinedev/core";
import { handleRefineError } from "../../utils/errorHandler";

interface CheckInFormData {
  bookingId: string;
  email: string;
}

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const [formData, setFormData] = useState<CheckInFormData>({
    bookingId: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: checkInMutation } = useCustomMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      checkInMutation(
        {
          url: "check-in",
          method: "post",
          values: formData,
        },
        {
          onSuccess: () => {
            open?.({
              message: "Check-in successful!",
              type: "success",
            });
            void navigate("/dashboard/user");
          },
          onError: (error) => {
            handleRefineError(error, open);
          },
        },
      );
    } catch (error) {
      handleRefineError(error, open);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CheckInFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Check-In
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Please enter your booking details to check in
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Booking ID"
            value={formData.bookingId}
            onChange={handleInputChange("bookingId")}
            margin="normal"
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            margin="normal"
            required
            variant="outlined"
          />
          <Button type="submit" fullWidth variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 3 }}>
            {isSubmitting ? "Checking In..." : "Check In"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckIn;
