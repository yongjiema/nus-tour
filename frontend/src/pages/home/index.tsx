import React from "react";
import { Box, Typography, Button, Container, Grid } from "@mui/material";

export const Home: React.FC = () => {
  return (
    <Container maxWidth="lg" style={{ marginTop: "50px", textAlign: "center" }}>
      <Typography
        variant="h3"
        gutterBottom
        style={{ color: "#002147", fontWeight: "bold" }}
      >
        Welcome to NUS Tour
      </Typography>
      <Typography
        variant="h6"
        color="textSecondary"
        gutterBottom
        style={{ color: "#FF6600" }}
      >
        Discover, Learn, and Experience NUS through our guided campus tours.
      </Typography>
      <Grid container spacing={4} style={{ marginTop: "30px" }}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            style={{ backgroundColor: "#FF6600", color: "#FFFFFF" }}
            href="/information"
          >
            Learn More
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            style={{
              borderColor: "#002147",
              color: "#002147",
            }}
            href="/booking"
          >
            Book a Tour
          </Button>
        </Grid>
      </Grid>
      <Box
        style={{
          marginTop: "50px",
          backgroundColor: "#F5F5F5",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <Typography variant="body1" color="textSecondary">
          Explore the scenic beauty, rich history, and cutting-edge facilities
          of NUS. Start your journey today!
        </Typography>
      </Box>
    </Container>
  );
};
