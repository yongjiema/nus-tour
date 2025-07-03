// Theme constants for consistent color usage across the application
export const THEME_COLORS = {
  // Official NUS Brand Colors (from https://nus.edu.sg/identity/guidelines/corporate-colours)
  NUS_BLUE: "#003D7C", // Official NUS Blue - Pantone 294
  NUS_ORANGE: "#EF7C00", // Official NUS Orange - Pantone 152
  NUS_ORANGE_DARK: "#CC6F00", // Darker shade for hover states
  NUS_GOLD: "#B8860B", // NUS Gold for accents
  NUS_SILVER: "#C0C0C0", // NUS Silver for accents

  // Semantic colors that adapt to theme
  BRAND_PRIMARY: "primary.main",
  BRAND_SECONDARY: "secondary.main",
  TEXT_PRIMARY: "text.primary",
  TEXT_SECONDARY: "text.secondary",
  BACKGROUND_PAPER: "background.paper",
  BACKGROUND_DEFAULT: "background.default",
} as const;

// Design system constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const TRANSITIONS = {
  short: "0.2s ease-in-out",
  medium: "0.3s ease-in-out",
  long: "0.5s ease-in-out",
} as const;

import type { Theme } from "@mui/material/styles";

// Theme-aware color getters
export const getThemeColor = (theme: Theme, colorKey: keyof typeof THEME_COLORS) => {
  const color = THEME_COLORS[colorKey];

  // If it's a theme palette reference, resolve it
  if (typeof color === "string" && color.includes(".")) {
    const [palette, shade] = color.split(".");
    // Access palette key dynamically with a safe fallback
    const paletteObj = (theme.palette as unknown as Record<string, unknown>)[palette];
    if (paletteObj && typeof paletteObj === "object" && shade in paletteObj) {
      // Use 'as' assertion for palette object
      return (paletteObj as Record<string, string>)[shade];
    }
    return color;
  }

  return color;
};

// Theme-aware spacing getter
export const getSpacing = (theme: Theme, size: keyof typeof SPACING) => {
  return theme.spacing(SPACING[size] / 8); // MUI uses 8px base
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

// Loading overlay background that adapts to theme
export const getLoadingOverlayBackground = (theme: Theme) => {
  return theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)";
};

// NEW: Overlay utilities for buttons and interactive elements
export const getOverlayBackground = (_theme: Theme, intensity: "light" | "medium" | "strong" = "light") => {
  switch (intensity) {
    case "light":
      return `rgba(255, 255, 255, 0.1)`;
    case "medium":
      return `rgba(255, 255, 255, 0.15)`;
    case "strong":
      return `rgba(255, 255, 255, 0.25)`;
    default:
      return `rgba(255, 255, 255, 0.1)`;
  }
};

// NEW: Hover overlay backgrounds for interactive elements
export const getHoverOverlayBackground = (_theme: Theme, intensity: "light" | "medium" | "strong" = "medium") => {
  switch (intensity) {
    case "light":
      return `rgba(255, 255, 255, 0.15)`;
    case "medium":
      return `rgba(255, 255, 255, 0.25)`;
    case "strong":
      return `rgba(255, 255, 255, 0.35)`;
    default:
      return `rgba(255, 255, 255, 0.25)`;
  }
};

// NEW: Border overlay colors for transparent borders
export const getOverlayBorder = (_theme: Theme, intensity: "light" | "medium" = "light") => {
  switch (intensity) {
    case "light":
      return `rgba(255, 255, 255, 0.2)`;
    case "medium":
      return `rgba(255, 255, 255, 0.3)`;
    default:
      return `rgba(255, 255, 255, 0.2)`;
  }
};

// NEW: Dark overlay backgrounds for elements on light backgrounds
export const getDarkOverlayBackground = (_theme: Theme, intensity: "light" | "medium" | "strong" = "light") => {
  switch (intensity) {
    case "light":
      return `rgba(0, 0, 0, 0.1)`;
    case "medium":
      return `rgba(0, 0, 0, 0.2)`;
    case "strong":
      return `rgba(0, 0, 0, 0.3)`;
    default:
      return `rgba(0, 0, 0, 0.1)`;
  }
};

// NEW: Shadow utilities with proper theme-aware colors
export const getButtonShadow = (theme: Theme, depth: "light" | "medium" | "strong" = "medium") => {
  if (theme.palette.mode === "dark") {
    switch (depth) {
      case "light":
        return "0 2px 4px rgba(0, 0, 0, 0.2)";
      case "medium":
        return "0 4px 8px rgba(0, 0, 0, 0.2)";
      case "strong":
        return "0 6px 12px rgba(0, 0, 0, 0.3)";
      default:
        return "0 4px 8px rgba(0, 0, 0, 0.2)";
    }
  } else {
    switch (depth) {
      case "light":
        return "0 2px 4px rgba(0, 0, 0, 0.1)";
      case "medium":
        return "0 4px 8px rgba(0, 0, 0, 0.15)";
      case "strong":
        return "0 6px 12px rgba(0, 0, 0, 0.2)";
      default:
        return "0 4px 8px rgba(0, 0, 0, 0.15)";
    }
  }
};

// NEW: Drop shadow filter utility for CSS filters
export const getDropShadow = (theme: Theme, depth: "light" | "medium" | "strong" = "medium") => {
  if (theme.palette.mode === "dark") {
    switch (depth) {
      case "light":
        return "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))";
      case "medium":
        return "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.5))";
      case "strong":
        return "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.6))";
      default:
        return "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.5))";
    }
  } else {
    switch (depth) {
      case "light":
        return "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))";
      case "medium":
        return "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.15))";
      case "strong":
        return "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.2))";
      default:
        return "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.15))";
    }
  }
};
