import { Box, Card, Chip, Typography, Paper, Grid2 as Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  getThemeColor,
  getCardShadow,
  getElevatedShadow,
  getHoverElevatedShadow,
  getCardHoverShadow,
  getStrongHoverShadow,
} from "../../theme/constants";

export const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: "medium",
  borderRadius: "16px",
  boxShadow: getCardShadow(theme),
}));

export const DashboardCard = styled(Card)(({ theme }) => ({
  padding: "24px",
  borderRadius: "12px",
  boxShadow: getElevatedShadow(theme),
  marginBottom: "20px",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: getHoverElevatedShadow(theme),
  },
}));

export const TabPanelContainer = styled(Box)(() => ({
  padding: "24px 0",
}));

export const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: "600",
  marginBottom: "16px",
  color: getThemeColor(theme, "NUS_BLUE"),
}));

export const StatsGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const StatPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: getCardHoverShadow(theme),
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: getStrongHoverShadow(theme),
  },
}));

export const TabsContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: getCardHoverShadow(theme),
  overflow: "hidden",
  marginBottom: theme.spacing(4),
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  textAlign: "center",
}));

export const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));
