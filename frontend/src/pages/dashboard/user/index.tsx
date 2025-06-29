import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Badge,
  Container,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Grid2 as Grid,
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PaymentIcon from "@mui/icons-material/Payment";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutButton from "../../../components/LogoutButton";
import { useAuthentication } from "../../../hooks/useAuthentication";
import { useResourceData } from "../../../hooks/useResourceData";
import type { Booking, Payment, Feedback } from "../../../types/api.types";
import { TabPanel } from "../../../components/dashboard";
import { BookingsTab } from "./components/BookingsTab";
import { PaymentsTab } from "./components/PaymentsTab";
import { FeedbackTab } from "./components/FeedbackTab";
import {
  DashboardContainer,
  SectionTitle,
  StatCardContainer,
  StatsGrid,
  TabsContainer,
  EmptyStateContainer,
} from "../../../components/dashboard";
import { getThemeColor, getAlertShadow, getStatCardHoverShadow, getSubtleBackground } from "../../../theme/constants";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useNavigate, Link } from "react-router-dom";

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
      <>
        <DashboardHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </>
    );
  }

  // Show auth error
  if (authError) {
    return (
      <>
        <DashboardHeader />
        <EmptyStateContainer minHeight="80vh">
          <Alert severity="error" sx={{ maxWidth: 600, boxShadow: getAlertShadow(theme), mb: 2 }}>
            {authError}
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Please try signing in again or contact support if the issue persists.
          </Typography>
        </EmptyStateContainer>
      </>
    );
  }

  // Show missing user error
  if (!userId) {
    return (
      <>
        <DashboardHeader />
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
      </>
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

  localStorage.removeItem("tour_booking_cache");
  localStorage.removeItem("tour_booking_timestamp");

  return (
    <>
      <DashboardHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <DashboardContainer>
          {/* Header Section */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              background: getSubtleBackground(theme, "light"),
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" alignItems="center">
              <DashboardIcon sx={{ mr: 2, color: getThemeColor(theme, "NUS_BLUE"), fontSize: 42 }} />
              <Box>
                <SectionTitle variant="h4">My Dashboard</SectionTitle>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage your bookings, payments, and feedback all in one place
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: { xs: 2, sm: 0 },
                alignSelf: { xs: "flex-end", sm: "center" },
              }}
            >
              <Button startIcon={<AccountCircleIcon />} variant="outlined" color="primary" sx={{ mr: 2 }}>
                Profile
              </Button>
            </Box>
          </Paper>

          {/* Stats Overview Section */}
          <StatsGrid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCardContainer
                elevation={3}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: getStatCardHoverShadow(theme),
                  },
                }}
              >
                <Badge
                  badgeContent={activeBookings}
                  color="primary"
                  max={99}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.9rem",
                      height: "1.5rem",
                      minWidth: "1.5rem",
                    },
                  }}
                >
                  <EventNoteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                </Badge>
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {activeBookings}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Active Bookings
                </Typography>
              </StatCardContainer>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCardContainer
                elevation={3}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: getStatCardHoverShadow(theme),
                  },
                }}
              >
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {completedBookings}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Completed Tours
                </Typography>
              </StatCardContainer>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCardContainer
                elevation={3}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: getStatCardHoverShadow(theme),
                  },
                }}
              >
                <Badge
                  badgeContent={pendingPayments}
                  color="error"
                  max={99}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.9rem",
                      height: "1.5rem",
                      minWidth: "1.5rem",
                    },
                  }}
                >
                  <PaymentIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                </Badge>
                <Typography variant="h3" color="info.main" fontWeight="bold">
                  {pendingPayments}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Pending Payments
                </Typography>
              </StatCardContainer>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCardContainer
                elevation={3}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: getStatCardHoverShadow(theme),
                  },
                }}
              >
                <RateReviewIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" color="secondary.main" fontWeight="bold">
                  {totalFeedbacksGiven}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Feedback Given
                </Typography>
              </StatCardContainer>
            </Grid>
          </StatsGrid>

          {/* Main Content Section */}
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
        </DashboardContainer>
      </Container>
    </>
  );
};

// Dashboard Header Component
const DashboardHeader: React.FC = () => {
  const theme = useMuiTheme();
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ bgcolor: getThemeColor(theme, "NUS_BLUE"), mb: 2 }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: getThemeColor(theme, "NUS_ORANGE"),
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => {
              void navigate("/");
            }}
          >
            NUS Tour
          </Typography>
          <Box>
            <LogoutButton />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default UserDashboard;
