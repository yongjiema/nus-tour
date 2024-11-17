import React from "react";
import { Typography, Container, Box } from "@mui/material";

export const Canteens: React.FC = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography
        variant="h4"
        gutterBottom
        style={{ color: "#002147", fontWeight: "bold" }}
      >
        Nearby Canteens
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        style={{ color: "#FF6600", marginBottom: "20px" }}
      >
        Discover a variety of food options at NUS canteens.
      </Typography>
      <Box>
        <Typography variant="body2" color="textSecondary">
          Enjoy a range of cuisines at our conveniently located canteens. From local
          delicacies to international flavors, NUS canteens have something to suit every
          taste and preference.
        </Typography>
      </Box>
    </Container>
  );
};
