import React from "react";
import { Typography, Container, Box } from "@mui/material";
import { getThemeColor } from "../../theme/constants";
import { useTheme } from "@mui/material/styles";

export const BusRoutes: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom style={{ color: getThemeColor(theme, "NUS_BLUE"), fontWeight: "bold" }}>
        Campus Bus Routes
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        style={{ color: getThemeColor(theme, "NUS_ORANGE"), marginBottom: "20px" }}
      >
        Navigate the NUS campus easily using our bus services.
      </Typography>
      <Box>
        <Typography variant="body2" color="textSecondary">
          The campus bus system at NUS provides efficient and convenient transportation across different faculties,
          residential areas, and key landmarks. Check the schedule and plan your journey seamlessly.
        </Typography>
      </Box>
    </Container>
  );
};
