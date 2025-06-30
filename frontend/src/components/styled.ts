import { styled } from "@mui/material/styles";
import { Paper, Button, Typography } from "@mui/material";
import { getThemeColor } from "../theme/constants";

export const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.shadows[3],
}));

export const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: `${theme.spacing(1.25)} ${theme.spacing(3)}`,
  fontSize: "16px",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  color: getThemeColor(theme, "NUS_BLUE"),
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: theme.spacing(3),
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: getThemeColor(theme, "NUS_ORANGE"),
  color: theme.palette.common.white,
  padding: theme.spacing(1.25),
  fontSize: "16px",
  "&:hover": {
    backgroundColor: getThemeColor(theme, "NUS_ORANGE_DARK"),
  },
}));

export const DashboardCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  padding: theme.spacing(1.25),
  fontWeight: "bold",
  textTransform: "none",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));
