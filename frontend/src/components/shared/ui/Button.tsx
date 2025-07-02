import { styled } from "@mui/material/styles";
import { Button as MuiButton } from "@mui/material";
import { Link } from "react-router-dom";
import type { ButtonProps } from "@mui/material";

// Base button component with theme integration
export const Button = styled(MuiButton)<ButtonProps>(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 3),
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
  },
}));

// Action button variant - used in dashboards and forms
export const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[6],
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.text.disabled,
  },
}));

// Submit button variant - optimized for forms
export const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  padding: theme.spacing(2, 4),
  fontSize: "1.1rem",
  fontWeight: 700,
  "&:hover": {
    backgroundColor: theme.palette.success.dark,
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[6],
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.text.disabled,
  },
}));

// Link button variant - for navigation
export const LinkButton = styled(Link)<{ color?: string }>(({ theme, color = "primary" }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(1),
  textDecoration: "none",
  fontWeight: 600,
  textTransform: "none",
  transition: "all 0.2s ease-in-out",
  backgroundColor: color === "primary" ? theme.palette.primary.main : theme.palette.secondary.main,
  color: color === "primary" ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
  "&:hover": {
    backgroundColor: color === "primary" ? theme.palette.primary.dark : theme.palette.secondary.dark,
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
    textDecoration: "none",
  },
}));
