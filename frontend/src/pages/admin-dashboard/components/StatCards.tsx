import React from "react";
import { Grid, Paper, Typography, Box, Skeleton } from "@mui/material";
import { styled } from "@mui/system";
import { DashboardStats } from "../../../types/api.types";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RateReviewIcon from "@mui/icons-material/RateReview";

const StatCard = styled(Paper)(({ theme }) => ({
  padding: "24px",
  borderRadius: "12px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0px 8px 24px rgba(0, 33, 71, 0.15)",
  },
}));

const IconWrapper = styled(Box)<{
  color?: "primary" | "secondary" | "success" | "warning" | "info" | "error" | string;
}>(({ theme, color = "primary" }) => {
  // Get the appropriate color from theme based on the color prop
  let backgroundColor = theme.palette.primary.light;
  let iconColor = theme.palette.primary.main;

  // Handle color variants safely
  if (color === "primary") {
    backgroundColor = theme.palette.primary.light;
    iconColor = theme.palette.primary.main;
  } else if (color === "secondary") {
    backgroundColor = theme.palette.secondary.light;
    iconColor = theme.palette.secondary.main;
  } else if (color === "success") {
    backgroundColor = theme.palette.success.light;
    iconColor = theme.palette.success.main;
  } else if (color === "warning") {
    backgroundColor = theme.palette.warning.light;
    iconColor = theme.palette.warning.main;
  } else if (color === "info") {
    backgroundColor = theme.palette.info.light;
    iconColor = theme.palette.info.main;
  } else if (color === "error") {
    backgroundColor = theme.palette.error.light;
    iconColor = theme.palette.error.main;
  }

  return {
    backgroundColor: backgroundColor,
    borderRadius: "12px",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    "& svg": {
      fontSize: "24px",
      color: iconColor,
    },
  };
});

const StatLabel = styled(Typography)({
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "text.secondary",
  marginBottom: "4px",
});

const StatValue = styled(Typography)({
  fontWeight: "bold",
  fontSize: "2rem",
  lineHeight: 1.2,
});

interface StatCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

// Component for statistics cards
const StatCards: React.FC<StatCardsProps> = React.memo(({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={160} sx={{ borderRadius: "12px" }} animation="wave" />
          </Grid>
        ))}
      </Grid>
    );
  }

  const statItems = [
    {
      icon: <CalendarMonthIcon />,
      label: "Total Bookings",
      value: stats.totalBookings,
      color: "primary",
      testId: "total-bookings",
    },
    {
      icon: <PersonIcon />,
      label: "Pending Check-Ins",
      value: stats.pendingCheckIns,
      color: "warning",
      testId: "pending-check-ins",
    },
    {
      icon: <DoneAllIcon />,
      label: "Completed Tours",
      value: stats.completedTours,
      color: "success",
      testId: "completed-tours",
    },
    {
      icon: <RateReviewIcon />,
      label: "Feedbacks Received",
      value: stats.feedbacks,
      color: "info",
      testId: "feedbacks",
    },
  ] as const;

  return (
    <Grid container spacing={3}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard elevation={2}>
            <Box>
              <IconWrapper color={item.color}>{item.icon}</IconWrapper>
              <StatLabel variant="subtitle2">{item.label}</StatLabel>
            </Box>
            <StatValue variant="h3" color={`${item.color}.main`} data-testid={item.testId}>
              {item.value}
            </StatValue>
          </StatCard>
        </Grid>
      ))}
    </Grid>
  );
});

export default StatCards;
