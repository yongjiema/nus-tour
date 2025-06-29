import React, { useState } from "react";
import { Container, Typography, TextField, Button, Paper, Box, Rating } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { handleRefineError } from "../../utils/errorHandler";

interface FeedbackFormData {
  bookingId: string;
  rating: number;
  comment: string;
}

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const [formData, setFormData] = useState<FeedbackFormData>({
    bookingId: "",
    rating: 0,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: submitFeedback } = useCustomMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      submitFeedback(
        {
          url: "feedback",
          method: "post",
          values: formData,
        },
        {
          onSuccess: () => {
            open?.({
              message: "Feedback submitted successfully!",
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

  const handleInputChange = (field: keyof FeedbackFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleRatingChange = (_event: React.SyntheticEvent, value: number | null) => {
    setFormData((prev) => ({
      ...prev,
      rating: value ?? 0,
    }));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Submit Feedback
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          We value your feedback! Please share your experience with us.
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

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating name="rating" value={formData.rating} onChange={handleRatingChange} size="large" />
          </Box>

          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            value={formData.comment}
            onChange={handleInputChange("comment")}
            margin="normal"
            variant="outlined"
            placeholder="Tell us about your experience..."
          />

          <Button type="submit" fullWidth variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 3 }}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Feedback;
