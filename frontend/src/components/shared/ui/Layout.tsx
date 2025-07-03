import { styled } from "@mui/material/styles";
import { Container as MuiContainer, Box } from "@mui/material";

export const Container = styled(MuiContainer)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: "500px",
  margin: "0 auto",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

export const PageContainer = styled(Container)(({ theme }) => ({
  maxWidth: "lg",
  [theme.breakpoints.up("lg")]: {
    maxWidth: "1200px",
  },
}));

export const CenteredContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  padding: theme.spacing(4),
}));
