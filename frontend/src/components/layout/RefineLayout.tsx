import React from "react";
import { ThemedLayoutV2, RefineThemes } from "@refinedev/mui";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { getThemeColor } from "../../theme/constants";

interface RefineLayoutProps {
  children: React.ReactNode;
}

export const RefineLayout: React.FC<RefineLayoutProps> = ({ children }) => {
  const theme = useTheme();

  // Create a custom theme based on our existing theme and Refine themes
  const refineTheme = React.useMemo(() => {
    return createTheme({
      ...RefineThemes.Blue,
      palette: {
        ...RefineThemes.Blue.palette,
        primary: {
          main: getThemeColor(theme, "NUS_BLUE"),
          dark: getThemeColor(theme, "NUS_BLUE"),
          light: getThemeColor(theme, "NUS_BLUE"),
        },
        secondary: {
          main: getThemeColor(theme, "NUS_ORANGE"),
          dark: getThemeColor(theme, "NUS_ORANGE"),
          light: getThemeColor(theme, "NUS_ORANGE"),
        },
      },
    });
  }, [theme]);

  return (
    <ThemeProvider theme={refineTheme}>
      <ThemedLayoutV2>{children}</ThemedLayoutV2>
    </ThemeProvider>
  );
};
