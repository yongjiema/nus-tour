import { Box, Button, Card, Chip, Typography, Paper, Grid } from "@mui/material";
import { styled } from "@mui/system";

export const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: "1200px",
  margin: "0 auto",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

export const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: "medium",
  borderRadius: "16px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.dark,
  fontSize: "2rem",
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: 0,
    width: "60px",
    height: "4px",
    backgroundColor: theme.palette.secondary.main,
    borderRadius: "2px",
  },
}));

export const DashboardCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  height: "100%",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)", // Direct value instead of theme.shadows
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  fontWeight: "bold",
  textTransform: "none",
  padding: theme.spacing(1, 3),
  borderRadius: "24px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
  },
}));

export const StatsGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.09)",
  },
}));

export const TabsContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
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
