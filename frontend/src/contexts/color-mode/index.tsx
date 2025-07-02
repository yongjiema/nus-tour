import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "../../theme/muiTheme";
import React, { type PropsWithChildren, useEffect, useState, useMemo, useCallback } from "react";
import { ColorModeContext } from "./context";

const STORAGE_KEY = "colorMode";

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Initialize state with system preference or stored value
  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      const storedMode = localStorage.getItem(STORAGE_KEY);
      if (storedMode === "light" || storedMode === "dark") {
        return storedMode;
      }

      // Fallback to system preference
      const isSystemPreferenceDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return isSystemPreferenceDark ? "dark" : "light";
    } catch (error) {
      console.warn("Failed to read color mode from localStorage:", error);
      return "light";
    }
  });

  // Persist mode changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Failed to save color mode to localStorage:", error);
    }
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no user preference is stored
      const storedMode = localStorage.getItem(STORAGE_KEY);
      if (!storedMode) {
        setMode(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Memoized toggle function
  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      setMode: toggleColorMode,
      mode,
    }),
    [toggleColorMode, mode],
  );

  // Memoized theme selection
  const theme = useMemo(() => {
    return mode === "light" ? lightTheme : darkTheme;
  }, [mode]);

  return (
    <ColorModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Re-export the context for convenience
export { ColorModeContext } from "./context";
