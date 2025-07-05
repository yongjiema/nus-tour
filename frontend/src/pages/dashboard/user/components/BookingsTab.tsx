import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid2 as Grid,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";
import type { Booking } from "../../../../types/api.types";
import {
  DashboardCard,
  StatusChip,
  ActionButton,
  EmptyStateContainer,
  CardContent as StyledCardContent,
} from "../../../../components/dashboard";
import { getElevatedShadow } from "../../../../theme/constants";

// Helper function to safely format date
const formatDateDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Type guard to ensure booking has required properties
const isValidBooking = (booking: unknown): booking is Booking => {
  return (
    typeof booking === "object" &&
    booking !== null &&
    "id" in booking &&
    "date" in booking &&
    "timeSlot" in booking &&
    "status" in booking &&
    "groupSize" in booking &&
    "hasFeedback" in booking
  );
};

// Helper function to safely get booking property
const getBookingProperty = (booking: unknown, property: string): string => {
  if (!isValidBooking(booking)) {
    return "";
  }
  const value = booking[property as keyof Booking];
  return typeof value === "string" ? value : "";
};

// Helper function to safely get booking status
const getBookingStatus = (booking: unknown): string => {
  if (!isValidBooking(booking)) {
    return "";
  }
  return typeof booking.status === "string" ? booking.status : "";
};

// Helper function to check if booking has expired
const isBookingExpired = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) {
    return false;
  }

  const status = getBookingStatus(booking);
  if (status === "slot_expired") {
    return true;
  }

  // Check if slot_reserved booking has passed expiration time
  if (status === "slot_reserved" && booking.expiresAt) {
    try {
      const expiresAt = new Date(booking.expiresAt);
      return new Date() > expiresAt;
    } catch {
      return false;
    }
  }

  return false;
};

// Helper function to check if booking allows payment
const canProceedToPayment = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) {
    return false;
  }

  const status = getBookingStatus(booking);
  const allowedStatuses = ["slot_reserved", "awaiting_payment"];

  // Don't allow payment for expired, cancelled, or already paid bookings
  if (!allowedStatuses.includes(status)) {
    return false;
  }

  // Don't allow payment for expired bookings
  if (isBookingExpired(booking)) {
    return false;
  }

  return true;
};

// Helper function to safely get booking hasFeedback
const getBookingHasFeedback = (booking: unknown): boolean => {
  if (!isValidBooking(booking)) {
    return false;
  }
  return typeof booking.hasFeedback === "boolean" ? booking.hasFeedback : false;
};

interface BookingsTabProps {
  bookings: Booking[];
  isLoading: boolean;
  isError: boolean;
  onFeedbackClick: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, isLoading, isError, onFeedbackClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter bookings based on search term and status filter with type safety
  const filteredBookings = bookings.filter((booking) => {
    if (!isValidBooking(booking)) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const bookingDate = getBookingProperty(booking, "date");
    const bookingTimeSlot = getBookingProperty(booking, "timeSlot");
    const bookingStatus = getBookingStatus(booking);

    const matchesSearch =
      searchTerm === "" ||
      bookingDate.toLowerCase().includes(searchLower) ||
      bookingTimeSlot.toLowerCase().includes(searchLower) ||
      bookingStatus.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === null || bookingStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter chips with type safety
  const uniqueStatuses = [...new Set(bookings.filter(isValidBooking).map((booking) => booking.status))];

  // Helper function to get user-friendly status labels
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "slot_reserved":
        return "Payment Required";
      case "slot_expired":
        return "Expired";
      case "awaiting_payment":
        return "Awaiting Payment";
      case "paid":
        return "Payment Complete";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "no_show":
        return "No Show";
      case "checked_in":
        return "Checked In";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{
          borderRadius: "8px",
          boxShadow: getElevatedShadow(theme),
        }}
      >
        Failed to load your bookings. Please try refreshing the page.
      </Alert>
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyStateContainer>
        <Box sx={{ mb: 3 }}>
          <EventAvailableIcon sx={{ fontSize: 64, color: "primary.light", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Bookings Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            You haven't made any tour bookings yet. Start exploring NUS with our guided tours!
          </Typography>
        </Box>
        <ActionButton
          color="primary"
          variant="contained"
          size="large"
          onClick={() => void navigate("/u?tab=book-tour")}
        >
          Book a Tour Now
        </ActionButton>
      </EmptyStateContainer>
    );
  }

  return (
    <Box>
      {/* Search and filter section */}
      <Box
        mb={3}
        sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "flex-start" }}
      >
        <TextField
          placeholder="Search bookings..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchTerm("");
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: "24px" },
            },
          }}
          sx={{ maxWidth: { sm: "300px" } }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ alignSelf: "center", mr: 1, display: "flex", alignItems: "center" }}
          >
            <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} /> Filter:
          </Typography>

          <Chip
            label="All"
            color={statusFilter === null ? "primary" : "default"}
            onClick={() => {
              setStatusFilter(null);
            }}
            sx={{ borderRadius: "16px" }}
          />

          {uniqueStatuses.map((status) => (
            <Chip
              key={status}
              label={getStatusLabel(status)}
              color={statusFilter === status ? "primary" : "default"}
              onClick={() => {
                setStatusFilter(status === statusFilter ? null : status);
              }}
              sx={{ borderRadius: "16px" }}
            />
          ))}
        </Box>
      </Box>

      {filteredBookings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: "8px" }}>
          No bookings match your filters.{" "}
          <Button
            size="small"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter(null);
            }}
          >
            Clear filters
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => {
            if (!isValidBooking(booking)) {
              return null;
            }

            const bookingDate = getBookingProperty(booking, "date");
            const bookingTimeSlot = getBookingProperty(booking, "timeSlot");
            const bookingStatus = getBookingStatus(booking);
            const bookingGroupSize = typeof booking.groupSize === "number" ? booking.groupSize : 0;
            const bookingHasFeedback = getBookingHasFeedback(booking);
            const isExpired = isBookingExpired(booking);
            const isInactive =
              isExpired ||
              bookingStatus === "slot_expired" ||
              bookingStatus === "cancelled" ||
              bookingStatus === "completed" ||
              bookingStatus === "no_show";

            // Debug logging
            console.log(
              `Booking ${booking.id}: status=${bookingStatus}, isExpired=${isExpired}, isInactive=${isInactive}`,
            );

            return (
              <Grid size={{ xs: 12, md: isInactive ? 4 : 6 }} key={booking.id}>
                <DashboardCard sx={{ opacity: isInactive ? 0.7 : 1 }}>
                  <StyledCardContent sx={{ pb: isInactive ? 2 : 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Box display="flex" alignItems="center">
                        <EventAvailableIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                        <Typography variant={isInactive ? "body1" : "h6"} fontWeight="500">
                          Tour on {formatDateDisplay(bookingDate)}
                        </Typography>
                      </Box>
                      <StatusChip
                        label={
                          isBookingExpired(booking)
                            ? "Expired"
                            : bookingStatus === "slot_reserved"
                            ? "Payment Required"
                            : bookingStatus === "slot_expired"
                            ? "Expired"
                            : bookingStatus === "awaiting_payment"
                            ? "Awaiting Payment"
                            : bookingStatus === "paid"
                            ? "Payment Complete"
                            : bookingStatus === "confirmed"
                            ? "Confirmed"
                            : bookingStatus === "completed"
                            ? "Completed"
                            : bookingStatus === "cancelled"
                            ? "Cancelled"
                            : bookingStatus === "no_show"
                            ? "No Show"
                            : bookingStatus === "checked_in"
                            ? "Checked In"
                            : bookingStatus
                        }
                        color={
                          isBookingExpired(booking) || bookingStatus === "slot_expired"
                            ? "error"
                            : bookingStatus === "completed"
                            ? "success"
                            : bookingStatus === "confirmed"
                            ? "primary"
                            : bookingStatus === "slot_reserved"
                            ? "warning"
                            : bookingStatus === "awaiting_payment" || bookingStatus === "paid"
                            ? "info"
                            : bookingStatus === "cancelled" || bookingStatus === "no_show"
                            ? "error"
                            : bookingStatus === "checked_in"
                            ? "success"
                            : "default"
                        }
                        sx={isInactive ? { fontSize: "0.7rem", height: "auto", px: 1, py: 0.5 } : undefined}
                      />
                    </Box>

                    {!isInactive && <Divider sx={{ my: 1.5 }} />}

                    <Box
                      display="flex"
                      flexDirection={isInactive ? "row" : "column"}
                      gap={isInactive ? 2 : 1}
                      my={isInactive ? 1 : 1.5}
                    >
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                        <Typography variant="body2">
                          {isInactive ? bookingTimeSlot : `Time: ${bookingTimeSlot}`}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center">
                        <PeopleIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                        <Typography variant="body2">
                          {isInactive ? `${bookingGroupSize} people` : `Group Size: ${bookingGroupSize}`}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                      {canProceedToPayment(booking) && (
                        <Tooltip title="Complete your payment to confirm the booking">
                          <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => void navigate(`/u?tab=payment&id=${booking.id}`)}
                            size="small"
                          >
                            <PaymentIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                            {bookingStatus === "slot_reserved" ? "Proceed to Payment" : "Complete Payment"}
                          </ActionButton>
                        </Tooltip>
                      )}

                      {bookingStatus === "confirmed" && (
                        <Tooltip title="Check in for your tour">
                          <ActionButton
                            variant="outlined"
                            color="primary"
                            onClick={() => void navigate("/u?tab=check-in")}
                            size="small"
                          >
                            <CheckCircleIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                            Check In
                          </ActionButton>
                        </Tooltip>
                      )}

                      {bookingStatus === "completed" && !bookingHasFeedback && (
                        <Tooltip title="Leave feedback for your tour">
                          <ActionButton variant="outlined" color="secondary" onClick={onFeedbackClick} size="small">
                            <RateReviewIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                            Leave Feedback
                          </ActionButton>
                        </Tooltip>
                      )}

                      {/* Show informational message for expired/cancelled bookings */}
                      {(isBookingExpired(booking) ||
                        bookingStatus === "slot_expired" ||
                        bookingStatus === "cancelled") && (
                        <Box sx={{ opacity: 0.6, fontStyle: "italic" }}>
                          <Typography variant="caption" color="text.secondary">
                            {bookingStatus === "cancelled" ? "Booking was cancelled" : "Reservation expired"}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </StyledCardContent>
                </DashboardCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
