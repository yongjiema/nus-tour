import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
} from "@mui/material";
import { Timer as TimerIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@refinedev/core";
import { logger } from "../../utils/logger";
import { useAvailableTimeSlots } from "../../hooks";
import { useReserveSlot } from "../../hooks/useReservation";
import { useBookingSession } from "../../hooks/useBookingSession";
import type { TimeSlotAvailability } from "../../types/api.types";
import { FormField } from "../../components/shared/forms/FormField";
import { DestructiveButton } from "../../components/shared/ui";

// Constants
const tomorrow = dayjs().add(1, "day");

// Define the form data type
interface BookingFormData {
  date: Dayjs;
  timeSlot: string;
  groupSize: number;
}

const ReservationForm: React.FC = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(tomorrow.format("YYYY-MM-DD"));
  const [availableSlots, setAvailableSlots] = useState<TimeSlotAvailability[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { open } = useNotification();
  const { mutate: reserveSlot, isPending: isReserving } = useReserveSlot();
  const { saveReservation, reservation, timeRemaining, isExpired, clearReservation } = useBookingSession();

  // Fetch available time slots for the selected date
  const {
    data: slotsData,
    isLoading: slotsLoading,
    error: slotsError,
    refetch: refetchSlots,
  } = useAvailableTimeSlots(selectedDate);

  // Update available slots when data changes
  useEffect(() => {
    if (slotsData?.data) {
      setAvailableSlots(slotsData.data);
    } else if (slotsError) {
      console.error("Failed to load time slots:", slotsError);
      setAvailableSlots([]);
    }
  }, [slotsData, slotsError]);

  // Create dynamic schema based on available slots
  const createBookingSchema = useCallback((slots: TimeSlotAvailability[]) => {
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
        timeSlot:
          validSlots.length > 0
            ? yup.string().oneOf(validSlots, "Please select a valid time slot").required("Time slot is required")
            : yup.string().required("Time slot is required"),
        groupSize: yup
          .number()
          .min(1, "Group size must be at least 1")
          .max(50, "Group size cannot exceed 50")
          .integer("Group size must be a whole number")
          .required("Group size is required"),
      })
      .required();
  }, []);

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
    // Prevent double submission
    if (isSubmittingForm || isReserving || isNavigating) {
      return;
    }

    setIsSubmittingForm(true);
    setError("");
    setSuccess(false);

    // Validate that selected time slot is still available
    const selectedSlot = availableSlots.find((slot) => slot.slot === data.timeSlot);

    if (!selectedSlot || (selectedSlot.available <= 0 && !selectedSlot.userHasBooking)) {
      const errorMsg = "Selected time slot is no longer available. Please choose another slot.";
      setError(errorMsg);
      setIsSubmittingForm(false);
      return;
    }

    // If user already has a booking for this slot, show specific message
    if (selectedSlot.userHasBooking) {
      const errorMsg = `You already have a ${selectedSlot.userBookingStatus
        ?.toLowerCase()
        .replace("_", " ")} booking for this time slot. Please check your reservations.`;
      console.error("User already has booking:", errorMsg);
      setError(errorMsg);
      setIsSubmittingForm(false);
      return;
    }

    logger.debug("Reserving slot with data", {
      data: {
        ...data,
        date: data.date.toISOString(),
        formattedDate: data.date.format("YYYY-MM-DD"),
      },
    });

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found");
      logger.error("No access token found");
      setIsSubmittingForm(false);
      void navigate("/login");
      return;
    }

    const formattedDate = data.date.format("YYYY-MM-DD");
    const reservationData = {
      date: formattedDate,
      timeSlot: data.timeSlot,
      groupSize: Number(data.groupSize),
      deposit: 50, // Default deposit amount
    };

    // Reserve the slot
    try {
      reserveSlot(reservationData, {
        onSuccess: (response) => {
          logger.debug("Slot reserved successfully", { response });

          // Save reservation to session for countdown
          saveReservation({
            bookingId: response.id,
            expiresAt: response.expiresAt,
            groupSize: response.groupSize,
            date: response.date,
            timeSlot: response.timeSlot,
            deposit: response.deposit,
          });

          setSuccess(true);
          setIsNavigating(true);

          // Show success notification
          open?.({
            message: "Slot reserved successfully! Redirecting to payment...",
            type: "success",
          });

          // Navigate to payment tab in user dashboard
          try {
            void navigate(`/u?tab=payment&id=${response.id}`, { replace: true });

            // Add a small delay to check if navigation actually happened
            setTimeout(() => {
              if (!window.location.pathname.includes("/u") || !window.location.search.includes("tab=payment")) {
                console.warn("Navigation may have failed, forcing redirect");
                window.location.href = `/u?tab=payment&id=${response.id}`;
              }
            }, 200);
          } catch (navError) {
            console.error("Navigation error:", navError);
            setIsNavigating(false);
            // Fallback: try window.location if navigate fails
            window.location.href = `/u?tab=payment&id=${response.id}`;
          }
        },
        onError: (error: unknown) => {
          logger.error("Slot reservation error", error instanceof Error ? error : new Error(String(error)));

          setIsSubmittingForm(false);
          setIsNavigating(false);

          let errorMessage =
            error instanceof Error ? error.message : "An unexpected error occurred while reserving the slot";

          // Check for specific errors
          interface ErrorWithResponse {
            response?: {
              data?: {
                message?: string;
                detail?: string;
              };
              status?: number;
            };
          }
          const typedError = error as ErrorWithResponse;

          if (
            typedError.response?.data?.message?.includes("fully booked") ||
            typedError.response?.data?.message?.includes("no longer available")
          ) {
            errorMessage = "Sorry, this time slot is no longer available. Please choose another slot.";
            // Refresh slots to show updated availability
            void refetchSlots();
          } else if (typedError.response?.data?.message?.includes("already have a booking")) {
            errorMessage = "You already have a booking for this time slot. Please check your existing reservations.";
          } else if (typedError.response?.status === 401) {
            errorMessage = "Please log in to make a reservation.";
            void navigate("/login");
            return;
          } else if (typedError.response?.data?.message) {
            errorMessage = typedError.response.data.message;
          }

          setError(errorMessage);
        },
      });
    } catch (_syncError) {
      setIsSubmittingForm(false);
      setError("Failed to process reservation request. Please try again.");
    }
  };

  // Enhanced authentication check with user feedback
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    let timeoutId: NodeJS.Timeout | null = null;

    // Check if user is authenticated
    if (!token || !user) {
      logger.debug("No authentication found, redirecting to login");
      setError("Please log in to make a reservation.");
      timeoutId = setTimeout(() => {
        void navigate("/login");
      }, 2000);
    } else {
      // Check if token is expired by trying to decode it
      try {
        interface TokenPayload {
          exp?: number;
        }

        const tokenPayload = JSON.parse(atob(token.split(".")[1])) as TokenPayload;
        const currentTime = Date.now() / 1000;

        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          logger.debug("Token expired, redirecting to login");
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          localStorage.removeItem("token_issued_at");
          setError("Your session has expired. Please log in again.");
          timeoutId = setTimeout(() => {
            void navigate("/login");
          }, 2000);
        }
      } catch (_e) {
        logger.debug("Invalid token format, redirecting to login");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("token_issued_at");
        setError("Invalid session. Please log in again.");
        timeoutId = setTimeout(() => {
          void navigate("/login");
        }, 2000);
      }
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    const currentRef = redirectTimeoutRef.current;
    return () => {
      if (currentRef) {
        clearTimeout(currentRef);
      }
    };
  }, []);

  // Handle cancel reservation confirmation
  const handleCancelReservationClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelReservationConfirm = () => {
    clearReservation(true);
    setCancelDialogOpen(false);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show active reservation if exists (avoid early return to prevent hook issues)
  const hasActiveReservation = reservation && !isExpired;

  // Render active reservation component instead of early return
  const renderActiveReservation = () => {
    if (!reservation) return null;

    return (
      <Box>
        <Alert severity="warning" icon={<TimerIcon />} sx={{ mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Active Reservation
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You have an active slot reservation. Complete your payment or it will expire.
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip label={`Date: ${reservation.date}`} variant="outlined" size="small" />
            <Chip label={`Time: ${reservation.timeSlot}`} variant="outlined" size="small" />
            <Chip label={`Group: ${reservation.groupSize}`} variant="outlined" size="small" />
            <Chip label={`Deposit: SGD ${reservation.deposit}`} variant="outlined" size="small" />
          </Box>

          <Typography variant="h6" color="error" sx={{ mb: 2, fontWeight: 600 }}>
            Time Remaining: {formatTimeRemaining(timeRemaining)}
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                void navigate(`/u?tab=payment&id=${reservation.bookingId}`);
              }}
              sx={{ fontWeight: 600 }}
            >
              Proceed to Payment
            </Button>
            <Tooltip title="Cancel your current reservation">
              <DestructiveButton
                variant="outlined"
                onClick={handleCancelReservationClick}
                size="medium"
                startIcon={<CancelIcon sx={{ fontSize: "1rem" }} />}
              >
                Cancel Reservation
              </DestructiveButton>
            </Tooltip>
          </Box>
        </Alert>
      </Box>
    );
  };
  return (
    <Box>
      {hasActiveReservation ? (
        renderActiveReservation()
      ) : (
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(processSubmit)(e);
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            maxWidth: 600,
            mx: "auto",
            p: 3,
          }}
        >
          {/* ...existing form content... */}
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Book Your Tour
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Slot reserved successfully! Redirecting to payment...
            </Alert>
          )}

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Tour Date"
                minDate={tomorrow}
                slotProps={{
                  textField: {
                    error: !!errors.date,
                    helperText: errors.date?.message,
                    fullWidth: true,
                  },
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
                error={!!errors.timeSlot}
                helperText={
                  errors.timeSlot?.message ??
                  (slotsLoading
                    ? "Loading available slots..."
                    : availableSlots.length === 0
                    ? "No available slots for this date"
                    : availableSlots.every((slot) => slot.available <= 0 && !slot.userHasBooking)
                    ? "All slots are fully booked for this date"
                    : "Select your preferred time slot")
                }
                disabled={slotsLoading}
                fullWidth
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (value: unknown) => {
                      if (!value || typeof value !== "string") return "Select a time slot";
                      return value;
                    },
                  },
                }}
              >
                {!slotsLoading && availableSlots.length === 0 && (
                  <MenuItem disabled>No slots available for this date</MenuItem>
                )}
                {availableSlots.map((slot) => {
                  const isDisabled = slot.available <= 0 && !slot.userHasBooking;
                  const displayText = slot.userHasBooking
                    ? `${slot.slot} - You have a ${slot.userBookingStatus?.toLowerCase().replace("_", " ")} booking`
                    : slot.available > 0
                    ? `${slot.slot} - ${slot.available} spots available`
                    : `${slot.slot} - Fully booked`;

                  return (
                    <MenuItem key={slot.slot} value={slot.slot} disabled={isDisabled}>
                      {displayText}
                      {slot.userHasBooking && <Chip size="small" label="Your Booking" color="warning" sx={{ ml: 1 }} />}
                    </MenuItem>
                  );
                })}
              </FormField>
            )}
          />

          <Controller
            name="groupSize"
            control={control}
            render={({ field }) => (
              <FormField
                {...field}
                label="Group Size"
                type="number"
                error={!!errors.groupSize}
                helperText={errors.groupSize?.message ?? "Number of people in your group (max 50)"}
                slotProps={{
                  htmlInput: { min: 1, max: 50 },
                }}
                fullWidth
              />
            )}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={
                availableSlots.length === 0 ||
                slotsLoading ||
                isSubmitting ||
                isReserving ||
                isNavigating ||
                isSubmittingForm
              }
              startIcon={
                isSubmitting || isReserving || isNavigating || isSubmittingForm ? <CircularProgress size={20} /> : null
              }
            >
              {isNavigating
                ? "Redirecting..."
                : isSubmitting || isReserving || isSubmittingForm
                ? "Reserving..."
                : "Reserve Slot"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Cancel Reservation Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        aria-labelledby="cancel-reservation-dialog-title"
        aria-describedby="cancel-reservation-dialog-description"
      >
        <DialogTitle id="cancel-reservation-dialog-title">Cancel Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-reservation-dialog-description">
            Are you sure you want to cancel your current reservation? This action cannot be undone and you'll need to
            make a new reservation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary" variant="outlined">
            Keep Reservation
          </Button>
          <Button onClick={handleCancelReservationConfirm} color="error" variant="contained" startIcon={<CancelIcon />}>
            Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReservationForm;
