import React from "react";
import { Typography, Container, Box } from "@mui/material";
import { getThemeColor } from "../../theme/constants";
import { useTheme } from "@mui/material/styles";

export const Canteens: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom style={{ color: getThemeColor(theme, "NUS_BLUE"), fontWeight: "bold" }}>
        Campus Canteens
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        style={{ color: getThemeColor(theme, "NUS_ORANGE"), marginBottom: "20px" }}
      >
        Discover the diverse dining options available across NUS campus
      </Typography>
      <Box>
        <Typography variant="body2" color="textSecondary">
          Enjoy a range of cuisines at our conveniently located canteens. From local delicacies to international
          flavors, NUS canteens have something to suit every taste and preference.
        </Typography>
      </Box>
    </Container>
  );
};
