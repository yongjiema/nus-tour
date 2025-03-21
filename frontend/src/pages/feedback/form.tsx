import React from "react";
import { useForm } from "@refinedev/react-hook-form";
import { Controller, Resolver, FieldValues } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Typography, TextField, Rating, Button, FormControlLabel, Checkbox, FormHelperText } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useErrorHandler } from "../../utils/errorHandler";

const FormContainer = styled(Box)({
  maxWidth: 500,
  margin: "0 auto",
});

const SubmitButton = styled(Button)({
  marginTop: "16px",
  backgroundColor: "primary.main",
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: "primary.dark",
  },
});

const RatingContainer = styled(Box)({
  marginBottom: "24px",
});

interface FeedbackFormProps {
  bookingId: number;
  onSuccess?: () => void;
}

interface FeedbackFormInputs {
  rating: number;
  comments: string;
  isPublic: boolean;
}

const feedbackSchema = yup.object().shape({
  rating: yup
    .number()
    .required("Please provide a rating")
    .min(1, "Please provide a rating")
    .max(5, "Rating cannot exceed 5 stars"),
  comments: yup
    .string()
    .required("Please provide comments about your experience")
    .min(10, "Comments should be at least 10 characters")
    .max(500, "Comments should not exceed 500 characters"),
  isPublic: yup.boolean().default(true),
});

const FeedbackForm: React.FC<FeedbackFormProps> = ({ bookingId, onSuccess }) => {
  const { handleError } = useErrorHandler();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    register,
    refineCore: { onFinish, formLoading },
    reset,
  } = useForm<FeedbackFormInputs>({
    resolver: yupResolver(feedbackSchema) as unknown as Resolver<FieldValues, Record<string, never>>,
    defaultValues: {
      rating: 0,
      comments: "",
      isPublic: true,
    },
    refineCoreProps: {
      resource: "feedbacks",
      action: "create",
      successNotification: {
        message: "Thank you for your feedback!",
        type: "success",
      },
      redirect: false,
      meta: {
        bookingId,
      },
    },
  });

  const onSubmit = async (data: FeedbackFormInputs) => {
    try {
      await onFinish({ ...data, bookingId });
      reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleFormSubmit = handleSubmit((data) => onSubmit(data as FeedbackFormInputs));

  return (
    <FormContainer component="form" onSubmit={handleFormSubmit}>
      <Typography variant="subtitle1" gutterBottom>
        How was your tour experience?
      </Typography>

      {/* Rating Field */}
      <RatingContainer>
        <Typography variant="body2" mb={1}>
          Rating:
        </Typography>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <Rating {...field} precision={1} size="large" onChange={(_, value) => field.onChange(value)} />
          )}
        />
        {errors.rating && <FormHelperText error>{errors.rating.message?.toString()}</FormHelperText>}
      </RatingContainer>

      {/* Comments Field */}
      <Controller
        control={control}
        name="comments"
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Share your thoughts about the tour"
            error={!!errors.comments}
            helperText={errors.comments?.message?.toString()}
          />
        )}
      />

      {/* Public Feedback Option */}
      <FormControlLabel
        control={<Checkbox {...register("isPublic")} defaultChecked={true} />}
        label="Make my feedback public (anonymously)"
      />

      {/* Submit Button */}
      <SubmitButton type="submit" variant="contained" fullWidth disabled={isSubmitting || formLoading}>
        {isSubmitting || formLoading ? "Submitting..." : "Submit Feedback"}
      </SubmitButton>
    </FormContainer>
  );
};

export default FeedbackForm;
