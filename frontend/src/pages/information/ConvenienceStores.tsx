import React from "react";
import { Typography, Container, Box } from "@mui/material";

export const ConvenienceStores: React.FC = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography
        variant="h4"
        gutterBottom
        style={{ color: "#002147", fontWeight: "bold" }}
      >
        Convenience Stores
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        style={{ color: "#FF6600", marginBottom: "20px" }}
      >
        Access essential items at our convenience stores.
      </Typography>
      <Box>
        <Typography variant="body2" color="textSecondary">
          NUS convenience stores provide quick access to daily essentials, snacks, and
          more. Perfect for students, staff, and visitors alike.
        </Typography>
      </Box>
    </Container>
  );
};
