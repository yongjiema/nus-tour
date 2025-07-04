import { styled } from "@mui/material/styles";
import { Typography as MuiTypography } from "@mui/material";
import type { TypographyProps } from "@mui/material";

// Base typography component
export const Typography = styled(MuiTypography)<TypographyProps>(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
}));

// Page title variant - used for main page headings
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2.5rem",
  fontWeight: 700,
  color: theme.palette.primary.main,
  textAlign: "center",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    fontSize: "2rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.75rem",
  },
}));

// Section title variant - used for section headings with NUS branding
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  fontSize: "2rem",
  position: "relative",
  display: "flex",
  alignItems: "center",
  "& svg": {
    marginRight: "8px",
    color: theme.palette.primary.main,
  },
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

// Section header variant - smaller section headings
export const SectionHeader = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
}));

// Subtitle variant
export const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  color: theme.palette.text.secondary,
  textAlign: "center",
  maxWidth: "600px",
  margin: `0 auto ${theme.spacing(3)}`,
  [theme.breakpoints.down("sm")]: {
    fontSize: "1rem",
  },
}));

// Body text variant
export const BodyText = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  lineHeight: 1.6,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}));

// Caption variant for small text
export const Caption = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  fontStyle: "italic",
}));
