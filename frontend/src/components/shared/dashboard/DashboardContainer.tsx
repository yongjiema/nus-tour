import React from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledDashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: "100%",
  margin: "0 auto",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

interface DashboardContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  sx?: SxProps<Theme>;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ children, sx }) => {
  return <StyledDashboardContainer sx={sx}>{children}</StyledDashboardContainer>;
};
