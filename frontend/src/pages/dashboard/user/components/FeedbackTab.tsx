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
  Rating,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import type { Feedback, Booking } from "../../../../types/api.types";
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

// Type guard to ensure feedback has required properties
const isValidFeedback = (feedback: unknown): feedback is Feedback => {
  return (
    typeof feedback === "object" &&
    feedback !== null &&
    "id" in feedback &&
    "rating" in feedback &&
    "comments" in feedback &&
    "isPublic" in feedback &&
    "bookingId" in feedback &&
    "createdAt" in feedback
  );
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
    "hasFeedback" in booking
  );
};

// Helper function to get feedbacks that can be left (completed bookings without feedback)
const getAvailableFeedbacks = (bookings: Booking[]): Booking[] => {
  return bookings.filter((booking) => {
    if (!isValidBooking(booking)) {
      return false;
    }
    return booking.status === "completed" && !booking.hasFeedback;
  });
};

interface FeedbackTabProps {
  feedbacks: Feedback[];
  bookings: Booking[];
  isBookingsLoading: boolean;
  isFeedbacksLoading: boolean;
  isFeedbacksError: boolean;
  onFeedbackClick: () => void;
  onFeedbackSuccess: () => void;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({
  feedbacks,
  bookings,
  isBookingsLoading,
  isFeedbacksLoading,
  isFeedbacksError,
  onFeedbackClick,
  onFeedbackSuccess: _onFeedbackSuccess,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<string | null>(null);

  // Filter feedbacks based on search term and filters with type safety
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (!isValidFeedback(feedback)) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      (typeof feedback.comments === "string" && feedback.comments.toLowerCase().includes(searchLower)) ||
      (typeof feedback.bookingId === "string" && feedback.bookingId.toLowerCase().includes(searchLower));

    const matchesRating =
      ratingFilter === null || (typeof feedback.rating === "number" && feedback.rating === ratingFilter);

    const matchesVisibility =
      visibilityFilter === null ||
      (typeof feedback.isPublic === "boolean" &&
        ((visibilityFilter === "public" && feedback.isPublic) ||
          (visibilityFilter === "private" && !feedback.isPublic)));

    return matchesSearch && matchesRating && matchesVisibility;
  });

  // Get unique ratings and visibility options for filter chips with type safety
  const uniqueRatings = [...new Set(feedbacks.filter(isValidFeedback).map((feedback) => feedback.rating))].sort();
  const availableFeedbacks = getAvailableFeedbacks(bookings);

  if (isBookingsLoading || isFeedbacksLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (isFeedbacksError) {
    return (
      <Alert
        severity="error"
        sx={{
          borderRadius: "8px",
          boxShadow: getElevatedShadow(theme),
        }}
      >
        Failed to load your feedback. Please try refreshing the page.
      </Alert>
    );
  }

  if (feedbacks.length === 0 && availableFeedbacks.length === 0) {
    return (
      <EmptyStateContainer>
        <Box sx={{ mb: 3 }}>
          <RateReviewIcon sx={{ fontSize: 64, color: "primary.light", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Feedback Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            You haven't left any feedback yet. Complete a tour to share your experience with us!
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
      {/* Available feedbacks section */}
      {availableFeedbacks.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Available for Feedback
          </Typography>
          <Grid container spacing={3}>
            {availableFeedbacks.map((booking) => {
              if (!isValidBooking(booking)) {
                return null;
              }

              return (
                <Grid size={{ xs: 12, md: 6 }} key={booking.id}>
                  <DashboardCard>
                    <StyledCardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Box display="flex" alignItems="center">
                          <RateReviewIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                          <Typography variant="h6" fontWeight="500">
                            Tour on {formatDateDisplay(booking.date)}
                          </Typography>
                        </Box>
                        <StatusChip label="Completed" color="success" />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box display="flex" flexDirection="column" gap={1} my={1.5}>
                        <Typography variant="body1">
                          Time: <strong>{booking.timeSlot}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ready for your feedback!
                        </Typography>
                      </Box>

                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <ActionButton
                          variant="contained"
                          color="primary"
                          onClick={onFeedbackClick}
                          startIcon={<RateReviewIcon />}
                        >
                          Leave Feedback
                        </ActionButton>
                      </Box>
                    </StyledCardContent>
                  </DashboardCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Existing feedbacks section */}
      {feedbacks.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Feedback History
          </Typography>

          {/* Search and filter section */}
          <Box
            mb={3}
            sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "flex-start" }}
          >
            <TextField
              placeholder="Search feedback..."
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
                color={ratingFilter === null && visibilityFilter === null ? "primary" : "default"}
                onClick={() => {
                  setRatingFilter(null);
                  setVisibilityFilter(null);
                }}
                sx={{ borderRadius: "16px" }}
              />

              {uniqueRatings.map((rating) => (
                <Chip
                  key={rating}
                  label={`${rating} Stars`}
                  color={ratingFilter === rating ? "primary" : "default"}
                  onClick={() => {
                    setRatingFilter(rating === ratingFilter ? null : rating);
                  }}
                  sx={{ borderRadius: "16px" }}
                />
              ))}

              <Chip
                label="Public"
                color={visibilityFilter === "public" ? "primary" : "default"}
                onClick={() => {
                  setVisibilityFilter(visibilityFilter === "public" ? null : "public");
                }}
                sx={{ borderRadius: "16px" }}
              />

              <Chip
                label="Private"
                color={visibilityFilter === "private" ? "primary" : "default"}
                onClick={() => {
                  setVisibilityFilter(visibilityFilter === "private" ? null : "private");
                }}
                sx={{ borderRadius: "16px" }}
              />
            </Box>
          </Box>

          {filteredFeedbacks.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: "8px" }}>
              No feedback matches your filters.{" "}
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setRatingFilter(null);
                  setVisibilityFilter(null);
                }}
              >
                Clear filters
              </Button>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredFeedbacks.map((feedback) => {
                if (!isValidFeedback(feedback)) {
                  return null;
                }

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={feedback.id}>
                    <DashboardCard>
                      <StyledCardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                          <Box display="flex" alignItems="center">
                            <RateReviewIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                            <Typography variant="h6" fontWeight="500">
                              Feedback #{feedback.id}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Rating
                              value={typeof feedback.rating === "number" ? feedback.rating : 0}
                              readOnly
                              size="small"
                            />
                            {feedback.isPublic ? (
                              <Tooltip title="Public feedback">
                                <VisibilityIcon sx={{ fontSize: "1rem", color: "success.main" }} />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Private feedback">
                                <VisibilityOffIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box display="flex" flexDirection="column" gap={1} my={1.5}>
                          <Typography variant="body1">
                            {typeof feedback.comments === "string" ? feedback.comments : "No comments"}
                          </Typography>

                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              Booking ID: {feedback.bookingId}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              Date: {formatDateDisplay(feedback.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledCardContent>
                    </DashboardCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};
