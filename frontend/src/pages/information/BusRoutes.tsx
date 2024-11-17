import React from "react";
import { Typography, Container, Box } from "@mui/material";

export const BusRoutes: React.FC = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography
        variant="h4"
        gutterBottom
        style={{ color: "#002147", fontWeight: "bold" }}
      >
        Campus Bus Routes
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        style={{ color: "#FF6600", marginBottom: "20px" }}
      >
        Navigate the NUS campus easily using our bus services.
      </Typography>
      <Box>
        <Typography variant="body2" color="textSecondary">
          The campus bus system at NUS provides efficient and convenient transportation
          across different faculties, residential areas, and key landmarks. Check the
          schedule and plan your journey seamlessly.
        </Typography>
      </Box>
    </Container>
  );
};
