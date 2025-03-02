import React, { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, Button, Tabs, Tab,
  CircularProgress, Alert, Divider, Card, CardContent,
  Chip, List, ListItem
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { useApiUrl, useList } from "@refinedev/core";
import { authProvider } from "../../authProvider";
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaymentIcon from '@mui/icons-material/Payment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FeedbackForm from "../feedback/form";
import {
  BookingsResponse,
  Booking,
  PaymentsResponse,
  Payment,
  FeedbacksResponse,
  Feedback,
  ApiResponse
} from "../../types/api.types";
import { formatDateDisplay } from "../../utils/dateUtils";

// Interfaces
interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
  [key: string]: any;
}

interface AuthCheckResponse {
  authenticated: boolean;
  id: string;
}

// Styled components for consistent UI
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'medium',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: '#002147', // NUS blue
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  fontWeight: 'bold',
  textTransform: 'none',
}));

// TabPanel component
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Main component
const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = useApiUrl();
  const [tabValue, setTabValue] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { authenticated, id } = (await authProvider.check()) as AuthCheckResponse;
      if (!authenticated) {
        navigate('/login');
      } else {
        setUserId(id);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch user's bookings using Refine's useList hook
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useList({
    resource: "bookings",
    filters: [{ field: "userId", operator: "eq", value: userId }],
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Standardize on useList for all resources
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useList({
    resource: "payments",
    filters: [{ field: "userId", operator: "eq", value: userId }],
    queryOptions: {
      enabled: !!userId,
    },
  });

  const {
    data: feedbacksData,
    isLoading: feedbacksLoading,
    isError: feedbacksError,
    refetch: refetchFeedbacks,
  } = useList({
    resource: "feedbacks",
    filters: [{ field: "userId", operator: "eq", value: userId }],
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Extract data safely
  const bookings = bookingsData?.data || [];
  const payments = paymentsData?.data || [];
  const feedbacks = feedbacksData?.data || [];

  return (
    <DashboardContainer>
      <SectionTitle variant="h4" gutterBottom>My Dashboard</SectionTitle>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<EventNoteIcon />} label="My Bookings" />
          <Tab icon={<PaymentIcon />} label="Payments" />
          <Tab icon={<RateReviewIcon />} label="Feedback" />
        </Tabs>

        {/* Bookings Tab */}
        <TabPanel value={tabValue} index={0}>
          {bookingsLoading ? (
            <CircularProgress />
          ) : bookingsError ? (
            <Alert severity="error">Failed to load your bookings</Alert>
          ) : bookings.length === 0 ? (
            <Alert severity="info">
              You don't have any bookings yet.
              <ActionButton
                color="primary"
                size="small"
                onClick={() => navigate('/booking')}
                sx={{ ml: 2 }}
              >
                Book a Tour
              </ActionButton>
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {bookings.map((booking: Booking) => (
                <Grid item xs={12} key={booking.id}>
                  <DashboardCard>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                          Tour on {formatDateDisplay(booking.date)}
                        </Typography>
                        <StatusChip
                          label={booking.status}
                          color={
                            booking.status === 'completed' ? 'success' :
                              booking.status === 'confirmed' ? 'primary' :
                                'default'
                          }
                        />
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body1">
                        Time: {booking.timeSlot}
                      </Typography>
                      <Typography variant="body1">
                        Group Size: {booking.groupSize}
                      </Typography>
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        {booking.status === 'completed' && !booking.hasFeedback && (
                          <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => setTabValue(2)}
                          >
                            Leave Feedback
                          </ActionButton>
                        )}
                      </Box>
                    </CardContent>
                  </DashboardCard>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={tabValue} index={1}>
          {paymentsLoading ? (
            <CircularProgress />
          ) : paymentsError ? (
            <Alert severity="error">Failed to load payment information</Alert>
          ) : (
            <List>
              {payments.map((payment: Payment) => (
                <ListItem key={payment.id} divider>
                  <Box width="100%">
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        Payment #{payment.id}
                      </Typography>
                      <StatusChip
                        label={payment.status}
                        color={payment.status === 'completed' ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Amount: ${payment.amount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Date: {formatDateDisplay(payment.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Method: {payment.method}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Feedback Tab */}
        <TabPanel value={tabValue} index={2}>
          {bookingsLoading ? (
            <CircularProgress />
          ) : (
            <Box>
              <SectionTitle variant="h6" gutterBottom>Your Completed Tours</SectionTitle>

              {!bookings.some((b: Booking) => b.status === 'completed' && !b.hasFeedback) ? (
                <Alert severity="info">
                  You don't have any completed tours to review, or you've already provided feedback for all of them.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {bookings
                    .filter((b: Booking) => b.status === 'completed' && !b.hasFeedback)
                    .map((booking: Booking) => (
                      <Grid item xs={12} key={booking.id}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1">
                            Tour on {formatDateDisplay(booking.date)} ({booking.timeSlot})
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <FeedbackForm
                            bookingId={booking.id}
                            onSuccess={() => {
                              refetchBookings();
                              refetchFeedbacks();
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              )}

              <Box mt={4}>
                <SectionTitle variant="h6" gutterBottom>Your Past Reviews</SectionTitle>
                {feedbacksLoading ? (
                  <CircularProgress />
                ) : feedbacksError ? (
                  <Alert severity="error">Failed to load your feedback history</Alert>
                ) : feedbacks.length === 0 ? (
                  <Alert severity="info">You haven't submitted any reviews yet.</Alert>
                ) : (
                  <List>
                    {feedbacks.map((feedback: Feedback) => (
                      <ListItem key={feedback.id} divider>
                        <Box width="100%">
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle1">
                              Rating: {feedback.rating}/5
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatDateDisplay(feedback.createdAt)}
                            </Typography>
                          </Box>
                          <Typography variant="body1" mt={1}>
                            "{feedback.comments}"
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {feedback.isPublic ? "Public review" : "Private review"}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </DashboardContainer>
  );
};

export default UserDashboard;
