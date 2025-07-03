import React from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography, Card, CardContent, CardActions, Button, Grid2 as Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useGetIdentity } from "@refinedev/core";

// Icons
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HistoryIcon from "@mui/icons-material/History";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";

import type { AuthUser } from "../../../../types/auth.types";

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
  const { data: _user } = useGetIdentity<AuthUser>();

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

  // Quick stats/info cards
  const quickStats = [
    {
      label: "Upcoming Tours",
      value: "2", // This would come from actual data
      icon: <EventIcon />,
      color: "info" as const,
    },
    {
      label: "Completed Tours",
      value: "5", // This would come from actual data
      icon: <CheckCircleIcon />,
      color: "success" as const,
    },
    {
      label: "Total Bookings",
      value: "7", // This would come from actual data
      icon: <HistoryIcon />,
      color: "primary" as const,
    },
  ];

  return (
    <Box>
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
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
            Your recent tour activities will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
