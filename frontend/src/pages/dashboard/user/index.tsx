import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, CircularProgress, Alert, Badge, Button } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PaymentIcon from "@mui/icons-material/Payment";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuthentication, useResourceData } from "../../../hooks";
import type { Booking, Payment, Feedback } from "../../../types/api.types";
import { TabPanel, TabsContainer, EmptyStateContainer } from "../../../components/dashboard";
import {
  StatCardGrid,
  SectionWrapper,
  DashboardHeader,
  DashboardContainer,
} from "../../../components/shared/dashboard";
import { Link } from "react-router-dom";
import { getAlertShadow, getSubtleBackground } from "../../../theme/constants";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { BookingsTab } from "./components/BookingsTab";
import { PaymentsTab } from "./components/PaymentsTab";
import { FeedbackTab } from "./components/FeedbackTab";

// Main component with improved organization
const UserDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useMuiTheme();

  // Custom hook for authentication
  const { userId, isLoading, authError } = useAuthentication();

  // Use custom hook for data fetching with improved error handling
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useResourceData<Booking>("bookings/user", userId);

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useResourceData<Payment>("payments", userId);

  const {
    data: feedbacksData,
    isLoading: feedbacksLoading,
    isError: feedbacksError,
    refetch: refetchFeedbacks,
  } = useResourceData<Feedback>("feedback/user", userId);

  // Handle tab changes
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle on feedback success
  const handleFeedbackSuccess = () => {
    void refetchBookings();
    void refetchFeedbacks();
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // Show auth error
  if (authError) {
    return (
      <DashboardContainer>
        <EmptyStateContainer minHeight="80vh">
          <Alert severity="error" sx={{ maxWidth: 600, boxShadow: getAlertShadow(theme), mb: 2 }}>
            {authError}
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Please try signing in again or contact support if the issue persists.
          </Typography>
        </EmptyStateContainer>
      </DashboardContainer>
    );
  }

  // Show missing user error
  if (!userId) {
    return (
      <DashboardContainer>
        <EmptyStateContainer minHeight="80vh">
          <Alert severity="warning" sx={{ maxWidth: 600, boxShadow: getAlertShadow(theme), mb: 2 }}>
            Unable to load user information. Redirecting to login...
          </Alert>
          <Typography variant="body1" color="text.secondary">
            This may take a few moments. If you're not redirected automatically, please click{" "}
            <Link to="/login" style={{ color: "inherit", textDecoration: "underline" }}>
              here
            </Link>
            .
          </Typography>
        </EmptyStateContainer>
      </DashboardContainer>
    );
  }

  // Extract data safely with proper typing
  const bookings = bookingsData?.data.map((item) => item as unknown as Booking) ?? [];
  const payments = paymentsData?.data.map((item) => item as unknown as Payment) ?? [];
  const feedbacks = feedbacksData?.data.map((item) => item as unknown as Feedback) ?? [];

  // Calculate statistics with proper typing
  const activeBookings = bookings.filter(
    (booking) => booking.status !== "cancelled" && booking.status !== "completed",
  ).length;
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length;
  const totalFeedbacksGiven = feedbacks.length;
  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;

  // Prepare stats for StatCardGrid
  const statsForCards = [
    {
      title: "Active Bookings",
      value: activeBookings,
      icon: <EventNoteIcon />,
      color: "primary" as const,
    },
    {
      title: "Completed Tours",
      value: completedBookings,
      icon: <CheckCircleIcon />,
      color: "success" as const,
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
      icon: <PaymentIcon />,
      color: "warning" as const,
    },
    {
      title: "Feedback Given",
      value: totalFeedbacksGiven,
      icon: <RateReviewIcon />,
      color: "info" as const,
    },
  ];

  localStorage.removeItem("tour_booking_cache");
  localStorage.removeItem("tour_booking_timestamp");

  return (
    <DashboardContainer>
      {/* Dashboard Header with Icon and Actions */}
      <SectionWrapper>
        <DashboardHeader
          title="Welcome to Your Dashboard"
          subtitle="Track your tour experiences and manage your bookings"
          icon={<DashboardIcon />}
          actions={
            <Button startIcon={<AccountCircleIcon />} variant="outlined" color="primary">
              Profile
            </Button>
          }
        />
      </SectionWrapper>

      {/* Statistics Cards */}
      <SectionWrapper>
        <StatCardGrid stats={statsForCards} isLoading={bookingsLoading || paymentsLoading || feedbacksLoading} />
      </SectionWrapper>

      {/* Main Content Section with Tabs */}
      <SectionWrapper>
        <TabsContainer elevation={3}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            aria-label="User dashboard navigation tabs"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: getSubtleBackground(theme, "medium"),
              "& .MuiTab-root": {
                py: 2.5,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: getSubtleBackground(theme, "light"),
                },
              },
            }}
          >
            <Tab
              icon={<EventNoteIcon />}
              iconPosition="start"
              label={
                <Badge badgeContent={activeBookings || null} color="primary" sx={{ mr: 1 }}>
                  <Typography variant="button" sx={{ fontWeight: tabValue === 0 ? "bold" : "normal" }}>
                    My Bookings
                  </Typography>
                </Badge>
              }
              id="dashboard-tab-0"
              aria-controls="dashboard-tabpanel-0"
            />
            <Tab
              icon={<PaymentIcon />}
              iconPosition="start"
              label={
                <Badge badgeContent={pendingPayments || null} color="error" sx={{ mr: 1 }}>
                  <Typography variant="button" sx={{ fontWeight: tabValue === 1 ? "bold" : "normal" }}>
                    Payments
                  </Typography>
                </Badge>
              }
              id="dashboard-tab-1"
              aria-controls="dashboard-tabpanel-1"
            />
            <Tab
              icon={<RateReviewIcon />}
              iconPosition="start"
              label={
                <Typography variant="button" sx={{ fontWeight: tabValue === 2 ? "bold" : "normal" }}>
                  Feedback
                </Typography>
              }
              id="dashboard-tab-2"
              aria-controls="dashboard-tabpanel-2"
            />
          </Tabs>

          {/* Bookings Tab */}
          <TabPanel value={tabValue} index={0}>
            <BookingsTab
              bookings={bookings}
              isLoading={bookingsLoading}
              isError={bookingsError}
              onFeedbackClick={() => {
                setTabValue(2);
              }}
            />
          </TabPanel>

          {/* Payments Tab */}
          <TabPanel value={tabValue} index={1}>
            <PaymentsTab payments={payments} isLoading={paymentsLoading} isError={paymentsError} />
          </TabPanel>

          {/* Feedback Tab */}
          <TabPanel value={tabValue} index={2}>
            <FeedbackTab
              bookings={bookings}
              feedbacks={feedbacks}
              isBookingsLoading={bookingsLoading}
              isFeedbacksLoading={feedbacksLoading}
              isFeedbacksError={feedbacksError}
              onFeedbackClick={() => {
                setTabValue(2);
              }}
              onFeedbackSuccess={handleFeedbackSuccess}
            />
          </TabPanel>
        </TabsContainer>
      </SectionWrapper>
    </DashboardContainer>
  );
};

export default UserDashboard;

export { default as UserBookingsManagement } from "./bookingsManagement";
