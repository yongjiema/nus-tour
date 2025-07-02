import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getSubtleBackground } from "../../../theme/constants";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, icon, actions }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        background: getSubtleBackground(theme, "light"),
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <Box display="flex" alignItems="center">
        {icon && <Box sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 42 }}>{icon}</Box>}
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.dark">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {actions && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: { xs: 2, sm: 0 },
            alignSelf: { xs: "flex-end", sm: "center" },
          }}
        >
          {actions}
        </Box>
      )}
    </Paper>
  );
};
