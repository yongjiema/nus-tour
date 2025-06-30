import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Container, Grid2 as Grid } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useActivityFeed, type ActivityItem } from "../../../services/api";
import RefineLayoutHeader from "../../../components/header";

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

const SectionWrapper = styled(Box)(() => ({
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

function isActivityItemArray(data: unknown): data is ActivityItem[] {
  return (
    Array.isArray(data) &&
    data.every((item): item is ActivityItem => {
      if (typeof item !== "object" || item === null) return false;
      const record = item as Record<string, unknown>;
      return (
        typeof record.type === "string" &&
        typeof record.description === "string" &&
        typeof record.timestamp === "string" &&
        (typeof record.id === "string" || typeof record.id === "number")
      );
    })
  );
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingCheckIns: 0,
    completedTours: 0,
    feedbacks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const { data: statsData, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: activityData, isLoading: activityLoading, error: activityError } = useActivityFeed();

  useEffect(() => {
    if (statsData?.data) {
      const stats = statsData.data.data;
      setDashboardStats({
        totalBookings: typeof stats.totalBookings === "number" ? stats.totalBookings : 0,
        pendingCheckIns: typeof stats.pendingBookings === "number" ? stats.pendingBookings : 0,
        completedTours: typeof stats.completedBookings === "number" ? stats.completedBookings : 0,
        feedbacks: typeof stats.totalRevenue === "number" ? stats.totalRevenue : 0,
      });
    }
  }, [statsData]);

  useEffect(() => {
    if (isActivityItemArray(activityData?.data)) {
      // Normalize timestamp and id
      const typedActivities: ActivityItem[] = activityData.data.map((activity) => ({
        id: typeof activity.id === "string" ? activity.id : String(activity.id),
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
      }));
      setRecentActivity(typedActivities);
    } else {
      setRecentActivity([]);
    }
  }, [activityData]);

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

  if (statsLoading || activityLoading) {
    return (
      <Container>
        <RefineLayoutHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (statsError || activityError) {
    return (
      <Container>
        <RefineLayoutHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography color="error">Failed to load dashboard data. Please try refreshing the page.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <DashboardContainer maxWidth="xl">
      <PageHeader>
        <HeaderTitle>
          <Typography variant="h4" fontWeight="bold" color="primary.dark">
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {currentDate}
          </Typography>
        </HeaderTitle>
      </PageHeader>

      <SectionWrapper>
        <StatCards stats={dashboardStats} isLoading={statsLoading} />
      </SectionWrapper>

      <SectionWrapper>
        <QuickActions navigate={navigate} />
      </SectionWrapper>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionWrapper>
            <BookingChart data={chartData} isLoading={statsLoading} />
          </SectionWrapper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionWrapper sx={{ height: "100%" }}>
            <RecentActivity activities={recentActivity} isLoading={activityLoading} />
          </SectionWrapper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default AdminDashboard;
