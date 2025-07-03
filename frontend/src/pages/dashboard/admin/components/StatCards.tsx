import React from "react";
import { Grid2 as Grid } from "@mui/material";
import { StatCard } from "../../../../components/dashboard";
import type { DashboardStats } from "../../../../types/api.types";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RateReviewIcon from "@mui/icons-material/RateReview";

interface StatCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

// Component for statistics cards
const StatCards: React.FC<StatCardsProps> = React.memo(({ stats, isLoading }) => {
  const statItems = [
    {
      icon: <CalendarMonthIcon />,
      label: "Total Bookings",
      value: stats.totalBookings,
      color: "primary" as const,
      testId: "total-bookings",
    },
    {
      icon: <PersonIcon />,
      label: "Pending Check-Ins",
      value: stats.pendingCheckIns,
      color: "warning" as const,
      testId: "pending-check-ins",
    },
    {
      icon: <DoneAllIcon />,
      label: "Completed Tours",
      value: stats.completedTours,
      color: "success" as const,
      testId: "completed-tours",
    },
    {
      icon: <RateReviewIcon />,
      label: "Feedbacks Received",
      value: stats.feedbacks,
      color: "info" as const,
      testId: "feedbacks",
    },
  ] as const;

  return (
    <Grid container spacing={3}>
      {statItems.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <StatCard
            title={item.label}
            value={item.value}
            icon={item.icon}
            color={item.color}
            testId={item.testId}
            isLoading={isLoading}
          />
        </Grid>
      ))}
    </Grid>
  );
});

export default StatCards;
