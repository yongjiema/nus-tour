import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Grid2 as Grid, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useActivityFeed } from "../../../hooks";
import type { ActivityItem } from "../../../types/api.types";
import {
  StatCardGrid,
  SectionWrapper,
  DashboardHeader,
  DashboardContainer,
} from "../../../components/shared/dashboard";

// Import separated components
import { QuickActions, BookingChart, RecentActivity } from "./components";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DashboardIcon from "@mui/icons-material/Dashboard";

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

  // Prepare stats for StatCardGrid
  const statsForCards = [
    {
      title: "Total Bookings",
      value: dashboardStats.totalBookings,
      icon: <CalendarMonthIcon />,
      color: "primary" as const,
    },
    {
      title: "Pending Check-Ins",
      value: dashboardStats.pendingCheckIns,
      icon: <PersonIcon />,
      color: "warning" as const,
    },
    {
      title: "Completed Tours",
      value: dashboardStats.completedTours,
      icon: <DoneAllIcon />,
      color: "success" as const,
    },
    {
      title: "Total Feedbacks",
      value: dashboardStats.feedbacks,
      icon: <RateReviewIcon />,
      color: "info" as const,
    },
  ];

  if (statsLoading || activityLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (statsError || activityError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      {/* Dashboard Header with Icon */}
      <SectionWrapper>
        <DashboardHeader
          title="Welcome to Admin Dashboard"
          subtitle="Monitor and manage your NUS Tour operations"
          icon={<DashboardIcon />}
        />
      </SectionWrapper>

      {/* Statistics Cards */}
      <SectionWrapper>
        <StatCardGrid stats={statsForCards} isLoading={statsLoading} />
      </SectionWrapper>

      {/* Quick Actions */}
      <SectionWrapper>
        <QuickActions navigate={navigate} />
      </SectionWrapper>

      {/* Charts and Activity */}
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

export { AdminDashboard };
