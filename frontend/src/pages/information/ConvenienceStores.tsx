import React from "react";
import { Typography, Container, Box } from "@mui/material";
import { getThemeColor } from "../../theme/constants";
import { useTheme } from "@mui/material/styles";

export const ConvenienceStores: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom style={{ color: getThemeColor(theme, "NUS_BLUE"), fontWeight: "bold" }}>
        Convenience Stores
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        style={{ color: getThemeColor(theme, "NUS_ORANGE"), marginBottom: "20px" }}
      >
        Find convenience stores and essential services on campus
      </Typography>
      <Box>
        <Typography variant="body2" color="textSecondary">
          NUS convenience stores provide quick access to daily essentials, snacks, and more. Perfect for students,
          staff, and visitors alike.
        </Typography>
      </Box>
    </Container>
  );
};
