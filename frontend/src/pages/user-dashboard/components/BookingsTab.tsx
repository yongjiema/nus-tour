import React, { useState } from "react";
import {
  Grid,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Divider,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  useTheme,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Booking } from "../../../types/api.types";
import { formatDateDisplay } from "../../../utils/dateUtils";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CloseIcon from "@mui/icons-material/Close";
import {
  ActionButton,
  DashboardCard,
  StatusChip,
  EmptyStateContainer,
  CardContent as StyledCardContent,
} from "./StyledComponents";

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

  // Filter bookings based on search term and status filter
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm === "" ||
      booking.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.timeSlot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === null || booking.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter chips
  const uniqueStatuses = [...new Set(bookings.map((booking) => booking.status))];

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
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
        <ActionButton color="primary" variant="contained" size="large" onClick={() => navigate("/booking")}>
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
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: "24px" },
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
            onClick={() => setStatusFilter(null)}
            sx={{ borderRadius: "16px" }}
          />

          {uniqueStatuses.map((status) => (
            <Chip
              key={status}
              label={status}
              color={statusFilter === status ? "primary" : "default"}
              onClick={() => setStatusFilter(status === statusFilter ? null : status)}
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
          {filteredBookings.map((booking: Booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <DashboardCard>
                <StyledCardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Box display="flex" alignItems="center">
                      <EventAvailableIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                      <Typography variant="h6" fontWeight="500">
                        Tour on {formatDateDisplay(booking.date)}
                      </Typography>
                    </Box>
                    <StatusChip
                      label={booking.status}
                      color={
                        booking.status === "completed"
                          ? "success"
                          : booking.status === "confirmed"
                          ? "primary"
                          : booking.status === "cancelled"
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
                        Time: <strong>{booking.timeSlot}</strong>
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <PeopleIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                      <Typography variant="body1">
                        Group Size: <strong>{booking.groupSize}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    {booking.status === "confirmed" && (
                      <Tooltip title="Check in for your tour">
                        <ActionButton
                          variant="outlined"
                          color="primary"
                          onClick={() => navigate("/checkin")}
                          size="small"
                        >
                          Check In
                        </ActionButton>
                      </Tooltip>
                    )}

                    {booking.status === "completed" && !booking.hasFeedback && (
                      <Tooltip title="Share your experience with us">
                        <ActionButton
                          variant="contained"
                          color="secondary"
                          onClick={onFeedbackClick}
                          startIcon={<FeedbackIcon />}
                        >
                          Leave Feedback
                        </ActionButton>
                      </Tooltip>
                    )}
                  </Box>
                </StyledCardContent>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
