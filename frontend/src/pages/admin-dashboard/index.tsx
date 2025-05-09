import React, { useEffect, useState } from "react";
import {
  Box,
  Alert,
  Button,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Grid,
  Divider,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { useApiUrl, useCustom } from "@refinedev/core";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useErrorHandler } from "../../utils/errorHandler";
import { DashboardStats, ActivityItem, ActivityApiResponse } from "../../types/api.types";

// Import separated components
import StatCards from "./components/StatCards";
import QuickActions from "./components/QuickActions";
import BookingChart from "./components/BookingChart";
import RecentActivity from "./components/RecentActivity";

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(2),
  },
}));

const HeaderTitle = styled(Box)({
  display: "flex",
  alignItems: "center",
});

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: "bold",
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
}));

const SectionWrapper = styled(Box)(({ theme }) => ({
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const apiUrl = useApiUrl();
  const { handleError } = useErrorHandler();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingCheckIns: 0,
    completedTours: 0,
    feedbacks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Using Refine's useCustom hook for data fetching
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useCustom<{ data: DashboardStats }>({
    url: `${apiUrl}/admin/dashboard/stats`,
    method: "get",
    queryOptions: {
      retry: 1,
      onError: (error) => {
        handleError(error);
      },
    },
  });

  const {
    data: activityResponse,
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = useCustom<{ data: ActivityApiResponse }>({
    url: `${apiUrl}/admin/dashboard/recent-activity`,
    method: "get",
    queryOptions: {
      retry: 1,
      onError: (error) => {
        handleError(error);
      },
    },
  });

  useEffect(() => {
    if (apiResponse?.data?.data) {
      const stats = apiResponse.data.data;
      setDashboardStats({
        totalBookings: stats.totalBookings,
        pendingCheckIns: stats.pendingCheckIns,
        completedTours: stats.completedTours,
        feedbacks: stats.feedbacks,
      });
    }
  }, [apiResponse]);

  useEffect(() => {
    if (activityResponse?.data?.data) {
      // Ensure we're getting an array and handle empty data case
      const activities = Array.isArray(activityResponse.data.data) ? activityResponse.data.data : [];
      setRecentActivity(activities);
    }
  }, [activityResponse]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refetchActivity()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const chartData = React.useMemo(
    () => [
      { name: "Total Bookings", value: dashboardStats.totalBookings },
      { name: "Pending Check-Ins", value: dashboardStats.pendingCheckIns },
      { name: "Completed Tours", value: dashboardStats.completedTours },
      { name: "Feedbacks", value: dashboardStats.feedbacks },
    ],
    [dashboardStats],
  );

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardContainer maxWidth="xl">
      <PageHeader>
        <HeaderTitle>
          <DashboardIcon
            sx={{
              fontSize: 40,
              color: theme.palette.primary.main,
              mr: 2,
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.dark">
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {currentDate}
            </Typography>
          </Box>
        </HeaderTitle>

        <ActionButton
          startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          onClick={handleRefresh}
          variant="contained"
          color="primary"
          aria-label="Refresh dashboard data"
          disabled={isLoading || activityLoading || isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </ActionButton>
      </PageHeader>

      {error ? (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: "10px",
            boxShadow: theme.shadows[2],
          }}
        >
          Unable to load dashboard statistics. Please try again.
        </Alert>
      ) : (
        <SectionWrapper>
          <StatCards stats={dashboardStats} isLoading={isLoading || isRefreshing} />
        </SectionWrapper>
      )}

      <SectionWrapper>
        <QuickActions navigate={navigate} />
      </SectionWrapper>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <SectionWrapper>
            <BookingChart data={chartData} isLoading={isLoading || isRefreshing} />
          </SectionWrapper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionWrapper sx={{ height: "100%" }}>
            <RecentActivity activities={recentActivity} isLoading={activityLoading || isRefreshing} />
          </SectionWrapper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default AdminDashboard;
