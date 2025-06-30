// Theme constants for consistent color usage across the application
export const THEME_COLORS = {
  // NUS Brand Colors
  NUS_BLUE: "#002147",
  NUS_ORANGE: "#FF6600",
  NUS_ORANGE_DARK: "#E05A00",

  // Semantic colors that adapt to theme
  BRAND_PRIMARY: "primary.main",
  BRAND_SECONDARY: "secondary.main",
  TEXT_PRIMARY: "text.primary",
  TEXT_SECONDARY: "text.secondary",
  BACKGROUND_PAPER: "background.paper",
  BACKGROUND_DEFAULT: "background.default",
} as const;

import type { Theme } from "@mui/material/styles";

// Theme-aware color getters
export const getThemeColor = (theme: Theme, colorKey: keyof typeof THEME_COLORS) => {
  const color = THEME_COLORS[colorKey];

  // If it's a theme palette reference, resolve it
  if (color.includes(".")) {
    const [palette, shade] = color.split(".");
    const paletteObj = theme.palette[palette as keyof typeof theme.palette];
    if (paletteObj && shade in paletteObj) {
      return paletteObj[shade as keyof typeof paletteObj];
    }
    return color;
  }

  return color;
};

// Shadow utilities that adapt to theme
export const getThemeShadow = (theme: Theme, level = 4) => {
  return theme.shadows[level] ?? theme.shadows[4];
};

// Hover shadow that adapts to theme
export const getHoverShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0px 8px 24px rgba(0, 0, 0, 0.3)" : "0px 8px 24px rgba(0, 33, 71, 0.15)";
};

// Comprehensive shadow utilities for different use cases
export const getCardShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0 2px 5px rgba(0,0,0,0.2)" : "0 2px 5px rgba(0,0,0,0.08)";
};

export const getElevatedShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)";
};

export const getHoverElevatedShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.15)";
};

export const getCardHoverShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0 6px 18px rgba(0,0,0,0.3)" : "0 6px 18px rgba(0,0,0,0.06)";
};

export const getStrongHoverShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0 8px 25px rgba(0,0,0,0.4)" : "0 8px 25px rgba(0,0,0,0.09)";
};

export const getAlertShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)";
};

export const getStatCardHoverShadow = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "0 10px 25px rgba(0,0,0,0.4)" : "0 10px 25px rgba(0,0,0,0.15)";
};

// Background utilities for subtle overlays
export const getSubtleBackground = (theme: Theme, intensity: "light" | "medium" = "light") => {
  if (theme.palette.mode === "dark") {
    return intensity === "light" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)";
  } else {
    return intensity === "light" ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.04)";
  }
};
