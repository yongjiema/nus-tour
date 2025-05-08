import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  Divider,
  Rating,
  Chip,
  useTheme,
  Tab,
  Tabs,
  Tooltip,
  Avatar,
} from "@mui/material";
import { Booking, Feedback } from "../../../types/api.types";
import { formatDateDisplay, formatTimeAgo } from "../../../utils/dateUtils";
import FeedbackForm from "../../feedback/form";
import FeedbackIcon from "@mui/icons-material/Feedback";
import HistoryIcon from "@mui/icons-material/History";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import EventIcon from "@mui/icons-material/Event";
import { DashboardCard, EmptyStateContainer, CardContent, TabsContainer } from "./StyledComponents";

interface FeedbackTabProps {
  bookings: Booking[];
  feedbacks: Feedback[];
  isBookingsLoading: boolean;
  isFeedbacksLoading: boolean;
  isFeedbacksError: boolean;
  onFeedbackSuccess: () => void;
}

// Simple tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const SimpleTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const FeedbackTab: React.FC<FeedbackTabProps> = ({
  bookings,
  feedbacks,
  isBookingsLoading,
  isFeedbacksLoading,
  isFeedbacksError,
  onFeedbackSuccess,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Memoize filtered bookings for performance
  const pendingFeedbackBookings = React.useMemo(
    () => bookings.filter((b) => b.status === "completed" && !b.hasFeedback),
    [bookings],
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isBookingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <Box>
      <TabsContainer>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Feedback management tabs"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
            "& .MuiTab-root": {
              py: 1.5,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: () => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
              },
            },
          }}
        >
          <Tab
            icon={<FeedbackIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="button" sx={{ fontWeight: tabValue === 0 ? "bold" : "normal" }}>
                  Give Feedback
                </Typography>
                {pendingFeedbackBookings.length > 0 && (
                  <Chip
                    label={pendingFeedbackBookings.length}
                    color="primary"
                    size="small"
                    sx={{ ml: 1, height: 20, minWidth: 20, borderRadius: "10px" }}
                  />
                )}
              </Box>
            }
            id="feedback-tab-0"
            aria-controls="feedback-tabpanel-0"
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="button" sx={{ fontWeight: tabValue === 1 ? "bold" : "normal" }}>
                  Past Reviews
                </Typography>
                {feedbacks.length > 0 && (
                  <Chip
                    label={feedbacks.length}
                    color="secondary"
                    size="small"
                    sx={{ ml: 1, height: 20, minWidth: 20, borderRadius: "10px" }}
                  />
                )}
              </Box>
            }
            id="feedback-tab-1"
            aria-controls="feedback-tabpanel-1"
          />
        </Tabs>

        {/* Give Feedback Panel */}
        <SimpleTabPanel value={tabValue} index={0}>
          {pendingFeedbackBookings.length === 0 ? (
            <EmptyStateContainer>
              <Box sx={{ mb: 3 }}>
                <FeedbackIcon sx={{ fontSize: 64, color: "primary.light", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  All Tours Reviewed
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                  You have already provided feedback for all your completed tours. Thank you for your reviews!
                </Typography>
              </Box>
            </EmptyStateContainer>
          ) : (
            <Grid container spacing={3}>
              {pendingFeedbackBookings.map((booking: Booking) => (
                <Grid item xs={12} key={booking.id}>
                  <DashboardCard
                    sx={{
                      border: "1px solid",
                      borderColor: (theme: any) =>
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <EventIcon sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
                        <Typography variant="h6">
                          Tour on {formatDateDisplay(booking.date)} ({booking.timeSlot})
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        We value your feedback! Please share your experience:
                      </Typography>
                      <FeedbackForm bookingId={booking.id} onSuccess={onFeedbackSuccess} />
                    </CardContent>
                  </DashboardCard>
                </Grid>
              ))}
            </Grid>
          )}
        </SimpleTabPanel>

        {/* Past Reviews Panel */}
        <SimpleTabPanel value={tabValue} index={1}>
          {isFeedbacksLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress size={40} thickness={4} />
            </Box>
          ) : isFeedbacksError ? (
            <Alert severity="error" sx={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              Failed to load your feedback history. Please try again later.
            </Alert>
          ) : feedbacks.length === 0 ? (
            <EmptyStateContainer>
              <Box sx={{ mb: 3 }}>
                <HistoryIcon sx={{ fontSize: 64, color: "primary.light", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Reviews Yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                  You haven't submitted any reviews yet. After completing a tour, you can share your experience here.
                </Typography>
              </Box>
            </EmptyStateContainer>
          ) : (
            <Grid container spacing={3}>
              {feedbacks.map((feedback: Feedback) => (
                <Grid item xs={12} md={6} key={feedback.id}>
                  <DashboardCard>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              color: "#fff",
                              width: 40,
                              height: 40,
                            }}
                          >
                            {feedback.rating}
                          </Avatar>
                          <Box sx={{ ml: 1.5 }}>
                            <Rating value={feedback.rating} readOnly precision={0.5} size="small" />
                            <Typography variant="body2" color="text.secondary">
                              {formatTimeAgo(feedback.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        <Tooltip title={feedback.isPublic ? "Publicly visible review" : "Private review"}>
                          <Chip
                            label={feedback.isPublic ? "Public" : "Private"}
                            size="small"
                            color={feedback.isPublic ? "success" : "default"}
                            sx={{ borderRadius: "16px" }}
                          />
                        </Tooltip>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          p: 2,
                          bgcolor: (theme) =>
                            theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                          borderRadius: "8px",
                          position: "relative",
                        }}
                      >
                        <FormatQuoteIcon
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            color: (theme) =>
                              theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                            fontSize: "1.2rem",
                          }}
                        />
                        <Typography variant="body1" sx={{ pl: 3 }}>
                          {feedback.comments || "(No comments provided)"}
                        </Typography>
                      </Box>

                      {feedback.bookingId && (
                        <Box mt={2}>
                          <Typography variant="caption" color="text.secondary">
                            Booking Reference: #{feedback.bookingId}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </DashboardCard>
                </Grid>
              ))}
            </Grid>
          )}
        </SimpleTabPanel>
      </TabsContainer>
    </Box>
  );
};
