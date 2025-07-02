import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, MenuItem, Alert, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@refinedev/core";
import { logger } from "../../utils/logger";
import { useCreateBooking, useAvailableTimeSlots } from "../../hooks";
import type { TimeSlotAvailability } from "../../types/api.types";
import { FormField } from "../../components/shared/forms/FormField";
import { FormActions } from "../../components/shared/forms/FormActions";

// Constants
const tomorrow = dayjs().add(1, "day");
const STORAGE_KEYS = {
  BOOKING_DATA: "booking-data",
  PAYMENT_CONFIRMATION: "payment_confirmation",
} as const;

// Define the form data type
interface BookingFormData {
  date: Dayjs;
  timeSlot: string;
  groupSize: number;
}

const BookingForm: React.FC = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(tomorrow.format("YYYY-MM-DD"));
  const [availableSlots, setAvailableSlots] = useState<TimeSlotAvailability[]>([]);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { open } = useNotification();
  const { createBooking } = useCreateBooking();

  // Fetch available time slots for the selected date
  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = useAvailableTimeSlots(selectedDate);

  // Update available slots when data changes
  useEffect(() => {
    if (slotsData?.data) {
      setAvailableSlots(slotsData.data);
    }
  }, [slotsData]);

  // Create dynamic schema based on available slots
  const createBookingSchema = (slots: TimeSlotAvailability[]) => {
    const validSlots = slots.map((slot) => slot.slot);

    return yup
      .object({
        date: yup
          .mixed<Dayjs>()
          .test("is-dayjs", "Invalid date", (value) => dayjs.isDayjs(value) && value.isValid())
          .test("is-future", "Booking date must be from tomorrow onwards", (value) => {
            if (!value || !dayjs.isDayjs(value)) return false;
            return value.isAfter(dayjs(), "day");
          })
          .required("Booking date is required"),
        timeSlot: yup.string().oneOf(validSlots, "Please select a valid time slot").required("Time slot is required"),
        groupSize: yup
          .number()
          .min(1, "Group size must be at least 1")
          .max(50, "Group size cannot exceed 50")
          .integer("Group size must be a whole number")
          .required("Group size is required"),
      })
      .required();
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BookingFormData>({
    resolver: yupResolver(createBookingSchema(availableSlots)),
    defaultValues: {
      date: tomorrow,
      groupSize: 1,
      timeSlot: "",
    },
  });

  // Watch for date changes to refetch slots
  const watchedDate = watch("date");

  useEffect(() => {
    if (dayjs.isDayjs(watchedDate)) {
      const newDate = watchedDate.format("YYYY-MM-DD");
      if (newDate !== selectedDate) {
        setSelectedDate(newDate);
        setValue("timeSlot", ""); // Reset time slot when date changes
        void refetchSlots();
      }
    }
  }, [watchedDate, selectedDate, setValue, refetchSlots]);

  const processSubmit = (data: BookingFormData) => {
    setError("");
    setSuccess(false);

    // Validate that selected time slot is still available
    const selectedSlot = availableSlots.find((slot) => slot.slot === data.timeSlot);
    if (!selectedSlot || selectedSlot.available <= 0) {
      setError("Selected time slot is no longer available. Please choose another slot.");
      return;
    }

    logger.debug("Creating booking with data", {
      data: {
        ...data,
        date: data.date.toISOString(),
        formattedDate: data.date.format("YYYY-MM-DD"),
      },
    });

    try {
      if (!dayjs(data.date).isValid()) {
        setError("Invalid date. Please select a valid date.");
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        logger.error("No access token found");
        void navigate("/login");
        return;
      }

      logger.debug("Token present", { tokenLength: token.length });

      const formattedDate = data.date.format("YYYY-MM-DD");

      logger.debug("Sending date to server", { formattedDate });

      const userStr = localStorage.getItem("user");

      // Type guard for user data
      const parseUserData = (str: string): { email: string; firstName: string; lastName?: string } | null => {
        try {
          const parsed = JSON.parse(str) as unknown;
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "email" in parsed &&
            "firstName" in parsed &&
            typeof (parsed as Record<string, unknown>).email === "string" &&
            typeof (parsed as Record<string, unknown>).firstName === "string"
          ) {
            const userData = parsed as { email: string; firstName: string; lastName?: unknown };
            return {
              email: userData.email,
              firstName: userData.firstName,
              lastName: typeof userData.lastName === "string" ? userData.lastName : undefined,
            };
          }
          return null;
        } catch {
          return null;
        }
      };

      const userData = userStr ? parseUserData(userStr) : null;

      if (!userData) {
        setError("User information not found. Please log in again.");
        void navigate("/login");
        return;
      }

      const typedUserData = userData as { email: string; firstName: string; lastName?: string };
      if (!typedUserData.email || !typedUserData.firstName) {
        setError("User information not found. Please log in again.");
        void navigate("/login");
        return;
      }

      // Create display name from firstName and lastName
      const displayName = [typedUserData.firstName, typedUserData.lastName].filter(Boolean).join(" ");

      const requestData = {
        date: formattedDate,
        timeSlot: data.timeSlot,
        groupSize: Number(data.groupSize),
        name: displayName,
        email: typedUserData.email,
      };

      // Use the data provider hook with proper error handling
      createBooking(requestData, {
        onSuccess: (response) => {
          logger.debug("Booking created successfully");
          setSuccess(true);
          open?.({
            message: "Booking created successfully! Redirecting to payment...",
            type: "success",
          });
          // Navigate to payment success page with booking data after a short delay
          redirectTimeoutRef.current = setTimeout(() => {
            if (response.id) {
              const bookingData = {
                id: response.id,
                amount: response.deposit,
              };
              logger.debug("Navigating to payment with booking data", { bookingData });
              try {
                localStorage.setItem(STORAGE_KEYS.BOOKING_DATA, JSON.stringify(bookingData));
                void navigate("/payment/success");
              } catch (storageError) {
                logger.error(
                  "Failed to store booking data",
                  storageError instanceof Error ? storageError : new Error(String(storageError)),
                );
                setError("Booking created but navigation failed. Please contact support.");
              }
            } else {
              logger.error(
                "Unexpected response structure",
                new Error(`Response missing id: ${JSON.stringify(response)}`),
              );
              setError("Booking created but payment data is unavailable. Please contact support.");
            }
          }, 1500);
        },
        onError: (error: unknown) => {
          logger.error("Booking creation error", error instanceof Error ? error : new Error(String(error)));
          let errorMessage =
            error instanceof Error ? error.message : "An unexpected error occurred while creating the booking";

          // Check for unique constraint violation (duplicate slot)
          interface ErrorWithResponse {
            response?: {
              data?: {
                message?: string;
                detail?: string;
              };
            };
          }

          const typedError = error as ErrorWithResponse;
          if (typedError.response?.data?.detail?.includes("already exists")) {
            errorMessage = "Sorry, this time slot is no longer available. Please choose another slot.";
          }
          setError(errorMessage);
        },
      });
    } catch (err: unknown) {
      logger.error("Booking creation error", err instanceof Error ? err : new Error(String(err)));

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while creating the booking");
      }
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
      logger.debug("No authentication found, redirecting to login");
      void navigate("/login");
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
      logger.debug("User accessed booking page directly");
      setError("For the best experience, start from the home page. You may continue with your booking.");

      // Clear error message after 5 seconds
      const errorTimeout = setTimeout(() => {
        setError("");
      }, 5000);

      // Return cleanup function for this timeout
      return () => {
        clearTimeout(errorTimeout);
      };
    }
  }, [navigate]);

  // Cleanup timeout on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(processSubmit)();
      }}
      noValidate
      sx={{ mt: 2 }}
    >
      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            label="Booking Date"
            minDate={tomorrow}
            value={field.value}
            onChange={(date) => {
              field.onChange(date);
            }}
            slotProps={{
              textField: { fullWidth: true, required: true, error: !!errors.date, helperText: errors.date?.message },
            }}
          />
        )}
      />
      <Controller
        name="timeSlot"
        control={control}
        render={({ field }) => (
          <FormField
            {...field}
            select
            label="Time Slot"
            fullWidth
            required
            error={!!errors.timeSlot}
            helperText={errors.timeSlot?.message}
            disabled={slotsLoading || availableSlots.length === 0}
          >
            {slotsLoading ? (
              <MenuItem value="" disabled>
                <CircularProgress size={20} /> Loading...
              </MenuItem>
            ) : (
              availableSlots.map((slot) => (
                <MenuItem key={slot.slot} value={slot.slot} disabled={slot.available <= 0}>
                  {slot.slot} {slot.available <= 0 ? "(Full)" : `(${slot.available} available)`}
                </MenuItem>
              ))
            )}
          </FormField>
        )}
      />
      <Controller
        name="groupSize"
        control={control}
        render={({ field }) => (
          <FormField
            {...field}
            type="number"
            label="Group Size"
            fullWidth
            required
            error={!!errors.groupSize}
            helperText={errors.groupSize?.message}
            slotProps={{ htmlInput: { min: 1, max: 50 } }}
          />
        )}
      />
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Booking successful! Redirecting to confirmation...
        </Alert>
      )}
      {/* Actions */}
      <FormActions
        onSubmit={() => {
          void handleSubmit(processSubmit)();
        }}
        isLoading={isSubmitting}
        submitText="Book Tour"
      />
    </Box>
  );
};

export { BookingForm };
