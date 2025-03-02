import React, { useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box, Button, TextField, MenuItem, FormHelperText, Alert
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useApiUrl } from "@refinedev/core";
import axios from "axios";
import { handleSubmissionError } from "../../utils/errorHandler";
import { format, isValid, parseISO } from "date-fns";

// Define validation schema
const bookingSchema = yup.object({
  date: yup
    .date()
    .transform((value, originalValue) => {
      // Handle date transformation during validation
      if (originalValue && typeof originalValue === 'string') {
        const parsedDate = parseISO(originalValue);
        return isValid(parsedDate) ? parsedDate : null;
      }
      return isValid(value) ? value : null;
    })
    .min(new Date(), "Booking date must be in the future")
    .required("Booking date is required")
    .typeError("Please select a valid date"),
  timeSlot: yup
    .string()
    .oneOf([
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM'
    ], "Please select a valid time slot")
    .required("Time slot is required"),
  groupSize: yup
    .number()
    .min(1, "Group size must be at least 1")
    .max(50, "Group size cannot exceed 50")
    .integer("Group size must be a whole number")
    .required("Group size is required"),
  specialRequests: yup
    .string()
    .max(500, "Special requests cannot exceed 500 characters"),
}).required();

type BookingFormData = yup.InferType<typeof bookingSchema>;

const BookingForm: React.FC = () => {
  const apiUrl = useApiUrl();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<BookingFormData>({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      groupSize: 1,
      timeSlot: '09:00 AM - 10:00 AM'
    },
    refineCoreProps: {
      resource: "bookings",
      action: "create",
      redirect: "show"
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    setError("");
    setSuccess(false);

    try {
      // Make sure we have a valid date
      if (!data.date || !isValid(data.date)) {
        setError("Invalid date. Please select a valid date.");
        return;
      }

      // Format the date properly before submission
      const formattedData = {
        ...data,
        // Format as YYYY-MM-DD string for PostgreSQL
        date: format(data.date, 'yyyy-MM-dd')
      };

      console.log("Submitting with formatted date:", formattedData.date);

      await onFinish(formattedData);
      setSuccess(true);
      reset();
    } catch (error) {
      console.error("Submission error:", error);
      handleSubmissionError(error, setError);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, margin: '0 auto' }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Booking created successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="Booking Date"
            value={field.value}
            onChange={(newValue) => {
              // Ensure we're setting a valid date object
              if (newValue && isValid(newValue)) {
                field.onChange(newValue);
              } else {
                // If invalid, set to null
                field.onChange(null);
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "normal",
                error: !!errors.date,
                helperText: errors.date?.message
              }
            }}
            disablePast
          />
        )}
      />

      <TextField
        select
        label="Time Slot"
        {...register("timeSlot")}
        error={!!errors.timeSlot}
        helperText={errors.timeSlot?.message}
        fullWidth
        margin="normal"
      >
        <MenuItem value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</MenuItem>
        <MenuItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</MenuItem>
        <MenuItem value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</MenuItem>
        <MenuItem value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</MenuItem>
        <MenuItem value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</MenuItem>
        <MenuItem value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</MenuItem>
      </TextField>

      <TextField
        label="Group Size"
        type="number"
        {...register("groupSize")}
        error={!!errors.groupSize}
        helperText={errors.groupSize?.message}
        fullWidth
        margin="normal"
        InputProps={{ inputProps: { min: 1, max: 50 } }}
      />

      <TextField
        label="Special Requests (Optional)"
        multiline
        rows={4}
        {...register("specialRequests")}
        error={!!errors.specialRequests}
        helperText={errors.specialRequests?.message || "Any special accommodations needed?"}
        fullWidth
        margin="normal"
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={formLoading}
      >
        {formLoading ? "Submitting..." : "Book Tour"}
      </Button>
    </Box>
  );
};

export { BookingForm };
