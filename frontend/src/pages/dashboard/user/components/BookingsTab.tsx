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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import type { Booking } from "../../../../types/api.types";
import { useCustomMutation, useNotification } from "@refinedev/core";
import {
  DashboardCard,
  StatusChip,
  ActionButton,
  DestructiveButton,
  EmptyStateContainer,
  CardContent as StyledCardContent,
} from "../../../../components/dashboard";
import { getElevatedShadow } from "../../../../theme/constants";
import {
  isValidBooking,
  getEffectiveBookingStatus,
  canCancelBooking,
  canProceedToPayment,
  getBookingHasFeedback,
  getBookingProperty,
  isBookingExpired,
} from "../../../../utils/bookingHelpers";

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

interface BookingsTabProps {
  bookings: Booking[];
  isLoading: boolean;
  isError: boolean;
  onFeedbackClick: () => void;
  invalidateQueries?: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({
  bookings,
  isLoading,
  isError,
  onFeedbackClick,
  invalidateQueries,
}) => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const { mutate: cancelBooking, isPending: isCancelling } = useCustomMutation();
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  // Handle cancel booking confirmation
  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  // Handle cancel booking
  const handleCancelConfirm = () => {
    if (!bookingToCancel) return;

    cancelBooking(
      {
        url: `bookings/${bookingToCancel}`,
        method: "delete",
        values: {},
        successNotification: false,
        errorNotification: false,
      },
      {
        onSuccess: () => {
          open?.({
            message: "Booking cancelled successfully",
            type: "success",
          });
          setCancelDialogOpen(false);
          setBookingToCancel(null);
          // Invalidate and refetch the bookings data
          invalidateQueries?.();
        },
        onError: (error) => {
          console.error("Cancel booking error:", error);
          open?.({
            message: "Failed to cancel booking. Please try again.",
            type: "error",
          });
          setCancelDialogOpen(false);
          setBookingToCancel(null);
        },
      },
    );
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  // Filter bookings based on search term and status filter with type safety
  const filteredBookings = bookings.filter((booking) => {
    if (!isValidBooking(booking)) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const bookingDate = getBookingProperty(booking, "date");
    const bookingTimeSlot = getBookingProperty(booking, "timeSlot");
    const bookingStatus = getEffectiveBookingStatus(booking); // Use database status

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
            const bookingStatus = getEffectiveBookingStatus(booking); // Use database status
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
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={booking.id}>
                <DashboardCard
                  sx={{
                    opacity: isInactive ? 0.7 : 1,
                    height: "100%",
                    minHeight: "300px", // Ensure consistent minimum height
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <StyledCardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between", // Ensure consistent layout
                    }}
                  >
                    <Box>
                      {/* Status chip at top right */}
                      <Box display="flex" justifyContent="flex-end" mb={1}>
                        <StatusChip
                          size="small"
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
                        />
                      </Box>

                      {/* Title on its own line */}
                      <Box display="flex" alignItems="center" mb={2}>
                        <EventAvailableIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                        <Typography variant="h6" fontWeight="500">
                          {formatDateDisplay(bookingDate)}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box display="flex" flexDirection="column" gap={1} my={1.5}>
                        <Box display="flex" alignItems="center">
                          <AccessTimeIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                          <Typography variant="body2">Time: {bookingTimeSlot}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                          <PeopleIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                          <Typography variant="body2">Group Size: {bookingGroupSize}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Action buttons and messages - always at bottom with consistent spacing */}
                    <Box
                      mt={2}
                      display="flex"
                      flexDirection="row"
                      gap={1}
                      alignItems="center"
                      justifyContent="flex-end"
                      flexWrap="wrap"
                    >
                      {canProceedToPayment(booking) && (
                        <Tooltip title="Complete your payment to confirm the booking">
                          <ActionButton
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              void navigate(`/u?tab=payment&id=${booking.id}`);
                            }}
                            size="small"
                            sx={{ minWidth: 90, px: 1.5, fontWeight: 600 }}
                          >
                            <PaymentIcon sx={{ fontSize: "0.875rem", mr: 0.5 }} />
                            Pay it now
                          </ActionButton>
                        </Tooltip>
                      )}

                      {canCancelBooking(booking) && (
                        <Tooltip title="Cancel this booking">
                          <DestructiveButton
                            variant="outlined"
                            onClick={() => {
                              handleCancelClick(booking.id.toString());
                            }}
                            size="small"
                            disabled={isCancelling}
                            sx={{ minWidth: 90, px: 1.5 }}
                          >
                            <CancelIcon sx={{ fontSize: "0.875rem", mr: 0.5 }} />
                            Cancel
                          </DestructiveButton>
                        </Tooltip>
                      )}

                      {bookingStatus === "confirmed" && (
                        <Tooltip title="Check in for your tour">
                          <ActionButton
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              void navigate("/u?tab=check-in");
                            }}
                            size="small"
                            sx={{ minWidth: 90, px: 1.5 }}
                          >
                            <CheckCircleIcon sx={{ fontSize: "0.875rem", mr: 0.5 }} />
                            Check In
                          </ActionButton>
                        </Tooltip>
                      )}

                      {bookingStatus === "completed" && !bookingHasFeedback && (
                        <Tooltip title="Leave feedback for your tour">
                          <ActionButton
                            variant="outlined"
                            color="secondary"
                            onClick={onFeedbackClick}
                            size="small"
                            sx={{ minWidth: 90, px: 1.5 }}
                          >
                            <RateReviewIcon sx={{ fontSize: "0.875rem", mr: 0.5 }} />
                            Feedback
                          </ActionButton>
                        </Tooltip>
                      )}
                    </Box>

                    {/* Show informational message for expired/cancelled bookings */}
                    {(isBookingExpired(booking) ||
                      bookingStatus === "slot_expired" ||
                      bookingStatus === "cancelled") && (
                      <Box mt={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                          {bookingStatus === "cancelled" ? "Booking was cancelled" : "Reservation expired"}
                        </Typography>
                      </Box>
                    )}
                  </StyledCardContent>
                </DashboardCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel this booking? This action cannot be undone.
            {bookingToCancel &&
              bookings.find((b) => b.id.toString() === bookingToCancel)?.status === "confirmed" &&
              " You may be eligible for a refund according to our cancellation policy."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            Keep Booking
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained" disabled={isCancelling}>
            {isCancelling ? <CircularProgress size={16} /> : "Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
