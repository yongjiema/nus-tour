import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useApiUrl } from "@refinedev/core";
import * as yup from "yup";
import { Box, Button, TextField, MenuItem, Alert } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { isValid } from "date-fns";
import { useForm } from "@refinedev/react-hook-form";
import { useNavigate } from "react-router-dom";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const bookingSchema = yup
  .object({
    date: yup.date().min(tomorrow, "Booking date must be from tomorrow onwards").required("Booking date is required"),
    timeSlot: yup
      .string()
      .oneOf(
        [
          "09:00 AM - 10:00 AM",
          "10:00 AM - 11:00 AM",
          "11:00 AM - 12:00 PM",
          "01:00 PM - 02:00 PM",
          "02:00 PM - 03:00 PM",
          "03:00 PM - 04:00 PM",
        ],
        "Please select a valid time slot",
      )
      .required("Time slot is required"),
    groupSize: yup
      .number()
      .min(1, "Group size must be at least 1")
      .max(50, "Group size cannot exceed 50")
      .integer("Group size must be a whole number")
      .required("Group size is required"),
  })
  .required();

type BookingFormData = yup.InferType<typeof bookingSchema>;

const BookingForm: React.FC = () => {
  const apiUrl = useApiUrl();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    refineCore: { formLoading },
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: yupResolver(bookingSchema),
    refineCoreProps: {
      action: "create",
      resource: "bookings",
      redirect: false,
    },
    defaultValues: {
      date: tomorrow,
      groupSize: 1,
      timeSlot: "09:00 AM - 10:00 AM",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setError("");
    setSuccess(false);

    // Enhanced logging
    console.log(`API URL: ${apiUrl}/bookings`);
    console.log("Creating booking with data:", {
      ...data,
      date: data.date?.toISOString(),
      formattedDate: data.date?.toISOString().split("T")[0],
    });

    try {
      if (!data.date || !isValid(data.date)) {
        setError("Invalid date. Please select a valid date.");
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        navigate("/login");
        return;
      }

      // Log token length but not the actual token
      console.log(`Token present (length: ${token.length})`);

      // Format the date as YYYY-MM-DD
      const formattedDate = data.date.toISOString().split("T")[0];

      // Log the exact date being sent
      console.log("Sending date to server:", formattedDate);

      // Get user information from localStorage
      const userStr = localStorage.getItem("user");
      const userData = userStr ? JSON.parse(userStr) : null;

      if (!userData || !userData.email || !userData.username) {
        setError("User information not found. Please log in again.");
        navigate("/login");
        return;
      }

      // Create booking payload
      const bookingData = {
        date: formattedDate, // Send date as YYYY-MM-DD string
        timeSlot: data.timeSlot,
        groupSize: Number(data.groupSize),
        name: userData.username,
        email: userData.email,
      };

      // Replace the fetch call
      const response = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log(`Sent request to: ${apiUrl}/bookings`);

      // Check if response is ok before attempting to parse JSON
      if (!response.ok) {
        const status = response.status;
        console.error(`Server returned status: ${status}`);

        try {
          const contentType = response.headers.get("content-type");
          console.log(`Error response content type: ${contentType}`);

          const errorText = await response.text();
          console.log(`Raw error response: "${errorText}"`);

          let errorMessage = `Failed to create booking (Status ${status})`;

          if (errorText && errorText.trim() !== "") {
            try {
              if (contentType?.includes("application/json")) {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
                console.error("Parsed error details:", errorData);
              } else {
                errorMessage = errorText;
              }
            } catch (parseError) {
              console.error("Failed to parse error response:", parseError);
            }
          } else {
            console.error("Server returned empty error response");
          }

          throw new Error(errorMessage);
        } catch (responseError) {
          console.error("Error handling response:", responseError);

          throw new Error(`Request failed: ${(responseError as Error).message}`);
        }
      }

      // Declare variable outside the conditional block
      let newBooking;

      // Check response type
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        newBooking = await response.json();
        console.log("Booking created successfully:", newBooking);
      } else {
        throw new Error("Server returned non-JSON response");
      }

      // Now newBooking is accessible here
      console.log("Saving booking data to localStorage:", newBooking);
      localStorage.setItem("booking-data", JSON.stringify(newBooking));

      // Log before navigation
      console.log(`Redirecting to payment page with booking ID: ${newBooking.bookingId || newBooking.id}`);
      navigate(`/payment/${newBooking.bookingId || newBooking.id}`);

      // After successful booking creation and response parsing
      console.log("Booking created successfully:", newBooking);

      // Ensure bookingId exists before redirecting
      if (!newBooking || !newBooking.bookingId) {
        setError("Booking created but no ID was returned");
        console.error("Missing booking ID in response:", newBooking);
        return;
      }

      // Store in localStorage with proper structure
      localStorage.setItem(
        "booking-data",
        JSON.stringify({
          bookingId: newBooking.bookingId,
          id: newBooking.id,
          deposit: newBooking.deposit || 50,
          date: newBooking.date,
          timeSlot: newBooking.timeSlot,
          groupSize: newBooking.groupSize,
        }),
      );

      console.log(`Redirecting to payment with bookingId: ${newBooking.bookingId}`);
      navigate(`/payment/${newBooking.bookingId}`);

      // And it's accessible here too
      setSuccess(true);
      setTimeout(() => {
        navigate(`/payment/${newBooking.bookingId}`);
      }, 1000);
    } catch (err) {
      console.error("Error creating booking:", err);
      const error = err as Error;
      setError(error.message || "An error occurred while creating your booking");
    }
  };

  // Enhanced session verification
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    const referrer = document.referrer;
    const sessionValid = sessionStorage.getItem("booking_flow_valid");

    // Check if user is authenticated
    if (!token || !user) {
      console.log("No authentication found, redirecting to login");
      navigate("/login");
      return;
    }

    // Verify the user is coming from a valid source
    const isValidReferrer =
      referrer.includes("/register") ||
      referrer.includes("/login") ||
      referrer.includes("/home") ||
      sessionValid === "true";

    if (isValidReferrer) {
      // Mark this session as valid for potential page refreshes
      sessionStorage.setItem("booking_flow_valid", "true");
    } else {
      // Allow the user to proceed but show a notice
      console.log("User accessed booking page directly");
      setError("For the best experience, start from the home page. You may continue with your booking.");
      setTimeout(() => setError(""), 5000);
    }
  }, [navigate]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, margin: "0 auto" }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Booking created successfully! Redirecting to payment...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
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
              field.onChange(newValue);
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "normal",
                error: !!errors.date,
                helperText: errors.date?.message?.toString(),
              },
            }}
            disablePast
            minDate={tomorrow}
          />
        )}
      />

      <Controller
        name="timeSlot"
        control={control}
        defaultValue="09:00 AM - 10:00 AM"
        render={({ field }) => (
          <TextField
            select
            label="Time Slot"
            value={field.value}
            onChange={field.onChange}
            error={!!errors.timeSlot}
            helperText={errors.timeSlot?.message?.toString()}
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
        )}
      />

      <TextField
        label="Group Size"
        type="number"
        {...register("groupSize")}
        error={!!errors.groupSize}
        helperText={errors.groupSize?.message?.toString()}
        fullWidth
        margin="normal"
        InputProps={{ inputProps: { min: 1, max: 50 } }}
      />

      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={formLoading}>
        {formLoading ? "Submitting..." : "Book Tour"}
      </Button>
    </Box>
  );
};

export { BookingForm };
