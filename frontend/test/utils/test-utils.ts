import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTestQueryClient } from "./test-helpers";

// Create a proper MUI theme for testing
const testTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

// Simplified wrapper component with essential providers only
export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return React.createElement(
    BrowserRouter,
    {},
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        ThemeProvider,
        { theme: testTheme },
        React.createElement(
          LocalizationProvider,
          { dateAdapter: AdapterDayjs },
          React.createElement(CssBaseline),
          React.createElement("div", { "data-testid": "mock-refine-provider" }, children),
        ),
      ),
    ),
  );
};
