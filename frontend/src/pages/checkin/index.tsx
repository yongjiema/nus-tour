import React, { useState } from "react";
import { Container, Typography, TextField, Box, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { useErrorHandler } from "../../utils/errorHandler";
import { AuthPaper, PageTitle, SubmitButton } from "../../components/styled";

// Styled components for consistent UI
const FormContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const SuccessAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface CheckinFormData {
  bookingId: string;
  email: string;
}

const Checkin: React.FC = () => {
  const [formData, setFormData] = useState<CheckinFormData>({ bookingId: "", email: "" });
  const { open } = useNotification();
  const { handleError } = useErrorHandler();

  // Use Refine's custom mutation hook instead of direct axios
  const { mutate, isLoading } = useCustomMutation();
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinSuccess(false);

    try {
      await mutate({
        url: "checkins",
        method: "post",
        values: formData,
      });

      setCheckinSuccess(true);
      setFormData({ bookingId: "", email: "" });

      open?.({
        message: "Check-in successful!",
        type: "success",
        description: "Your attendance has been recorded.",
      });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <AuthPaper>
        <PageTitle variant="h4" gutterBottom>
          Participant Check-In
        </PageTitle>

        <Typography variant="body1" gutterBottom sx={{ mb: 3, textAlign: "center" }}>
          Please enter your Booking ID and Email Address to check in.
        </Typography>

        {checkinSuccess && (
          <SuccessAlert severity="success">Check-in successful! Thank you for joining our tour.</SuccessAlert>
        )}

        <FormContainer component="form" onSubmit={handleCheckin}>
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

          <Box mb={3}>
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

          <SubmitButton type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
            {isLoading ? "Processing..." : "Check-In"}
          </SubmitButton>
        </FormContainer>
      </AuthPaper>
    </Container>
  );
};

export default Checkin;
