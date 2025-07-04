import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useGetIdentity } from "@refinedev/core";
import { useUserDashboardStats, useUserActivity } from "../../../../hooks";

// Icons
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HistoryIcon from "@mui/icons-material/History";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import type { AuthUser } from "../../../../types/auth.types";
import type { UserDashboardStats } from "../../../../types/api.types";

const QuickActionCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  borderRadius: theme.spacing(2),
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
    "& .action-icon": {
      transform: "scale(1.1)",
    },
  },
  "&:active": {
    transform: "translateY(-2px)",
  },
}));

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: "primary" | "secondary" | "success" | "info";
  disabled?: boolean;
}

export const DashboardOverviewTab: React.FC = () => {
  const [, setSearchParams] = useSearchParams();
  const { data: user, isLoading: userLoading, error: userError } = useGetIdentity<AuthUser>();

  const { data: statsResponse, isLoading: statsLoading, error: statsError } = useUserDashboardStats();

  const { data: activityData, isLoading: activityLoading, error: activityError } = useUserActivity();

  // Default stats for loading/error states
  const defaultStats: UserDashboardStats = {
    upcomingTours: 0,
    completedTours: 0,
    totalBookings: 0,
    pendingPayments: 0,
  };

  // Extract activity data safely
  const activities = Array.isArray(activityData?.data.data) ? activityData.data.data : [];

  // Extract stats safely - handle the nested data structure from Refine useCustom hook
  const userStats: UserDashboardStats = statsResponse?.data.data ?? defaultStats;

  // Utility function to safely convert numbers to strings
  const safeToString = (value: unknown): string => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toString();
    }
    return "0";
  };

  // Utility function to safely get numeric value
  const safeNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === "number" && !isNaN(value)) {
      return value;
    }
    return fallback;
  };

  // Handle errors
  if (statsError) {
    console.warn("Error loading dashboard stats:", statsError);
  }
  if (activityError) {
    console.warn("Error loading user activity:", activityError);
  }

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="200px" height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from({ length: 3 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 4 }}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mx: "auto", mb: 1 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // If authentication error or no user found, show message
  if (userError || !user) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          {userError ? "Authentication error. Please try logging in again." : "Please log in to view your dashboard."}
        </Typography>
        {userError ? (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Unable to verify your authentication status.
          </Typography>
        ) : null}
      </Box>
    );
  }

  // Quick actions to navigate to different tabs
  const quickActions: QuickAction[] = [
    {
      title: "Book a Tour",
      description: "Schedule a new campus tour",
      icon: <BookOnlineIcon sx={{ fontSize: 40 }} />,
      action: () => {
        setSearchParams({ tab: "book-tour" });
      },
      color: "primary",
    },
    {
      title: "Make Payment",
      description: "Complete payment for your booking",
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      action: () => {
        setSearchParams({ tab: "payments" });
      },
      color: "info",
      disabled: safeNumber(userStats.pendingPayments) === 0,
    },
    {
      title: "Check In",
      description: "Check in for your scheduled tour",
      icon: <HowToRegIcon sx={{ fontSize: 40 }} />,
      action: () => {
        setSearchParams({ tab: "check-in" });
      },
      color: "success",
    },
    {
      title: "My Bookings",
      description: "View and manage your bookings",
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      action: () => {
        setSearchParams({ tab: "bookings" });
      },
      color: "secondary",
    },
  ];

  // Quick stats/info cards with real data
  const quickStats = [
    {
      label: "Upcoming Tours",
      value: statsLoading || statsError ? "..." : safeToString(userStats.upcomingTours),
      icon: <EventIcon />,
      color: "info" as const,
    },
    {
      label: "Completed Tours",
      value: statsLoading || statsError ? "..." : safeToString(userStats.completedTours),
      icon: <CheckCircleIcon />,
      color: "success" as const,
    },
    {
      label: "Total Bookings",
      value: statsLoading || statsError ? "..." : safeToString(userStats.totalBookings),
      icon: <HistoryIcon />,
      color: "primary" as const,
    },
  ];

  return (
    <Box>
      {/* Error Alert - Show if there are API errors */}
      {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
      {(statsError || activityError) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {statsError && activityError
              ? "Unable to load dashboard data. Some information may be unavailable."
              : statsError
              ? "Unable to load dashboard statistics. Stats may be unavailable."
              : "Unable to load recent activity. Activity feed may be unavailable."}
          </Typography>
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 4 }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  color: `${stat.color}.main`,
                }}
              >
                {stat.icon}
                <Typography variant="h4" fontWeight="bold" sx={{ ml: 1 }}>
                  {stat.value}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Quick Actions
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <QuickActionCard
              onClick={action.action}
              sx={{
                opacity: action.disabled ? 0.6 : 1,
                cursor: action.disabled ? "not-allowed" : "pointer",
              }}
            >
              <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                <Box
                  className="action-icon"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: `${action.color}.main`,
                    color: `${action.color}.contrastText`,
                    margin: "0 auto 16px",
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button variant="contained" color={action.color} disabled={action.disabled} fullWidth sx={{ mx: 2 }}>
                  Get Started
                </Button>
              </CardActions>
            </QuickActionCard>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Section */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Recent Activity
      </Typography>
      <Card>
        <CardContent>
          {activityLoading || activityError ? (
            // Loading skeleton or error state
            <Box>
              {activityError ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                  Unable to load recent activities. Please try again later.
                </Typography>
              ) : (
                // Loading skeleton
                Array.from({ length: 3 }, (_, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Skeleton variant="circular" width={8} height={8} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </Box>
                ))
              )}
            </Box>
          ) : activities.length > 0 ? (
            // Show real activities
            <List disablePadding>
              {activities.slice(0, 5).map((activity, index) => {
                // Safe date parsing with error handling
                let formattedDate = "Unknown date";
                try {
                  if (activity.timestamp) {
                    const date = new Date(activity.timestamp);
                    if (!isNaN(date.getTime())) {
                      formattedDate = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                  }
                } catch (error) {
                  console.warn("Invalid date format for activity:", activity.timestamp, error);
                }

                return (
                  <ListItem
                    key={activity.id || `activity-${index}`}
                    disablePadding
                    sx={{ mb: index < activities.length - 1 ? 1 : 0 }}
                  >
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 8, color: "primary.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description || "No description available"}
                      secondary={formattedDate}
                      slotProps={{
                        primary: { fontSize: "0.9rem" },
                        secondary: { fontSize: "0.8rem" },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            // No activities message
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
              Your recent tour activities will appear here.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
