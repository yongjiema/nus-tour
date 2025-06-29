import React, { useState } from "react";
import { Container, Typography, TextField, Box, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { AuthPaper, PageTitle, SubmitButton } from "../../components/styled";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { handleRefineError } from "../../utils/errorHandler";

// Styled components for consistent UI
const _FormContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const SuccessAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface CheckinFormData {
  bookingId: string;
  email: string;
}

const CheckInPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const _navigate = useNavigate();
  const [checkInData, setCheckInData] = useState<CheckinFormData>({ bookingId: "", email: "" });
  const [error, setError] = useState<string | null>(null);

  const {
    data: _bookingData,
    isLoading: _bookingLoading,
    error: _fetchError,
  } = useOne({
    resource: "bookings",
    id: id ?? "",
    queryOptions: {
      enabled: !!id,
    },
  });

  const { open } = useNotification();

  // Use Refine's custom mutation hook with built-in error handling
  const { mutate, isPending } = useCustomMutation();
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckInData({
      ...checkInData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinSuccess(false);
    setError(null);

    mutate(
      {
        url: "checkins",
        method: "post",
        values: checkInData,
      },
      {
        onSuccess: () => {
          setCheckinSuccess(true);
          setCheckInData({ bookingId: "", email: "" });

          open?.({
            message: "Check-in successful!",
            type: "success",
            description: "Your attendance has been recorded.",
          });
        },
        onError: (error) => {
          // Use the enhanced error handler
          const message = handleRefineError(error, open);
          setError(message);
        },
      },
    );
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleCheckin}>
          <Box mb={2}>
            <TextField
              label="Booking ID"
              name="bookingId"
              value={checkInData.bookingId}
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
              value={checkInData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Box>

          <SubmitButton type="submit" variant="contained" color="primary" fullWidth disabled={isPending}>
            {isPending ? "Processing..." : "Check-In"}
          </SubmitButton>
        </Box>
      </AuthPaper>
    </Container>
  );
};

export default CheckInPage;
