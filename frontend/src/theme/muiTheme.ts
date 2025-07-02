import { createTheme } from "@mui/material/styles";
import { THEME_COLORS } from "./constants";

/**
 * Light theme following official NUS brand guidelines with WCAG AA compliance.
 */
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: THEME_COLORS.NUS_BLUE,
      light: "#336699",
      dark: "#002B5C",
      contrastText: "#ffffff",
    },
    secondary: {
      main: THEME_COLORS.NUS_ORANGE,
      light: "#FF9933",
      dark: THEME_COLORS.NUS_ORANGE_DARK,
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#f8f9fa",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#666666",
    },
    error: {
      main: "#d32f2f",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ff9800",
      contrastText: "#ffffff",
    },
    info: {
      main: THEME_COLORS.NUS_BLUE,
      contrastText: "#ffffff",
    },
    success: {
      main: "#2e7d32",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease-in-out",
        },
      },
    },
  },
});

/**
 * Dark theme variant maintaining NUS identity with proper contrast for accessibility.
 */
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: THEME_COLORS.NUS_ORANGE,
      light: "#FF9933",
      dark: THEME_COLORS.NUS_ORANGE_DARK,
      contrastText: "#ffffff",
    },
    secondary: {
      main: THEME_COLORS.NUS_BLUE,
      light: "#336699",
      dark: "#002B5C",
      contrastText: "#ffffff",
    },
    background: {
      default: "#121212", // Material-UI dark default
      paper: "#1e1e1e", // Darker paper for better contrast
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    error: {
      main: "#f44336",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ff9800",
      contrastText: "#ffffff",
    },
    info: {
      main: THEME_COLORS.NUS_ORANGE,
      contrastText: "#ffffff",
    },
    success: {
      main: "#4caf50",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease-in-out",
        },
      },
    },
  },
});
