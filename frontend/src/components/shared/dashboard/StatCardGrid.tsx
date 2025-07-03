import React from "react";
import { Grid2 as Grid, Skeleton } from "@mui/material";
import { StatCard } from "../../../components/dashboard/StatCard";

interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
}

interface StatCardGridProps {
  stats: StatItem[];
  isLoading?: boolean;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        </Grid>
      ))}
    </Grid>
  );
};
