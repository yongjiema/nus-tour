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
        <ActionButton color="primary" variant="contained" size="large" onClick={() => void navigate("/booking")}>
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
              label={status}
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

            return (
              <Grid size={{ xs: 12, md: 6 }} key={booking.id}>
                <DashboardCard>
                  <StyledCardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Box display="flex" alignItems="center">
                        <EventAvailableIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                        <Typography variant="h6" fontWeight="500">
                          Tour on {formatDateDisplay(bookingDate)}
                        </Typography>
                      </Box>
                      <StatusChip
                        label={bookingStatus}
                        color={
                          bookingStatus === "completed"
                            ? "success"
                            : bookingStatus === "confirmed"
                            ? "primary"
                            : bookingStatus === "cancelled"
                            ? "error"
                            : "default"
                        }
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" flexDirection="column" gap={1} my={1.5}>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                        <Typography variant="body1">
                          Time: <strong>{bookingTimeSlot}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center">
                        <PeopleIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                        <Typography variant="body1">
                          Group Size: <strong>{bookingGroupSize}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                      {bookingStatus === "confirmed" && (
                        <Tooltip title="Check in for your tour">
                          <ActionButton
                            variant="outlined"
                            color="primary"
                            onClick={() => void navigate("/checkin")}
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
