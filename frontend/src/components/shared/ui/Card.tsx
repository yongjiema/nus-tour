import { styled } from "@mui/material/styles";
import { Card as MuiCard, Paper } from "@mui/material";

export const Card = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
}));

export const DashboardCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

export const StyledStatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.background.paper})`,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));
