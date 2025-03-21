import React from "react";
import { useForm } from "@refinedev/react-hook-form";
import { Box, Button, TextField, Typography, Rating, FormControlLabel, Checkbox, Paper } from "@mui/material";
import { useCreate } from "@refinedev/core";

interface FeedbackFormProps {
  bookingId: number;
  onSuccess?: () => void;
}

interface FeedbackFormData {
  bookingId: number;
  rating: number;
  comments: string;
  isPublic: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ bookingId, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FeedbackFormData>({
    defaultValues: {
      bookingId,
      rating: 5,
      comments: "",
      isPublic: true,
    },
  });

  const { mutate, isLoading } = useCreate();
  const rating = watch("rating");

  const onSubmit = (data: FeedbackFormData) => {
    mutate(
      {
        resource: "bookings",
        values: data,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Share Your Tour Experience
      </Typography>
      <form onSubmit={handleSubmit((data) => onSubmit(data as FeedbackFormData))}>
        <Box mb={2}>
          <Typography component="legend">Rating</Typography>
          <Rating name="rating" value={rating} onChange={(_, value) => setValue("rating", value || 0)} size="large" />
        </Box>

        <TextField
          {...register("comments", { required: "Please share your thoughts" })}
          label="Comments"
          multiline
          rows={4}
          fullWidth
          error={!!errors.comments}
          helperText={errors.comments?.message?.toString()}
          margin="normal"
        />

        <FormControlLabel
          control={<Checkbox defaultChecked {...register("isPublic")} />}
          label="Make my review public"
        />

        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            Submit Feedback
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default FeedbackForm;
