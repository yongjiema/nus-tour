import React from "react";
import { Paper, Typography, Box, Skeleton } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { getHoverShadow } from "../../theme/constants";

const StyledStatCard = styled(Paper)(({ theme }) => ({
  padding: "24px",
  borderRadius: "12px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: getHoverShadow(theme),
  },
}));

const IconWrapper: React.FC<{
  children: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
}> = ({ children, color }) => {
  return (
    <Box
      sx={{
        backgroundColor: `${color}.light`,
        borderRadius: "12px",
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px",
        "& svg": {
          fontSize: "24px",
          color: `${color}.main`,
        },
      }}
    >
      {children}
    </Box>
  );
};

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: "4px",
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "2rem",
  lineHeight: 1.2,
  color: theme.palette.text.primary,
}));

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
  testId?: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, testId, isLoading = false }) => {
  if (isLoading) {
    return <Skeleton variant="rounded" height={160} sx={{ borderRadius: "12px" }} animation="wave" />;
  }

  return (
    <StyledStatCard elevation={2}>
      <Box>
        <IconWrapper color={color}>{icon}</IconWrapper>
        <StatLabel variant="subtitle2">{title}</StatLabel>
      </Box>
      <StatValue variant="h3" data-testid={testId}>
        {value}
      </StatValue>
    </StyledStatCard>
  );
};

// New generic StatCardContainer for use with children
export interface StatCardContainerProps {
  children: React.ReactNode;
  elevation?: number;
  sx?: SxProps<Theme>;
}

export const StatCardContainer: React.FC<StatCardContainerProps> = ({ children, elevation = 2, sx }) => {
  return (
    <StyledStatCard elevation={elevation} sx={sx}>
      {children}
    </StyledStatCard>
  );
};

export default StatCard;
