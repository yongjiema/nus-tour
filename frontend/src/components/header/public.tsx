import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

export const PublicHeader: React.FC = () => {
  return (
    <Box>
      {/* Public Header */}
      <AppBar position="static" style={{ backgroundColor: "#002147" }}>
        <Container maxWidth="lg">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1 }}
              onClick={() => (window.location.href = "/")}
              style={{ color: "#FF6600", cursor: "pointer", fontWeight: "bold" }}
            >
              NUS Tour
            </Typography>
            <Button color="inherit" href="/information" style={{ color: "#FFFFFF" }}>
              Information
            </Button>
            <Button color="inherit" href="/booking" style={{ color: "#FFFFFF" }}>
              Book a Tour
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Content */}
      <Container maxWidth="lg" style={{ marginTop: "30px" }}>
        <Outlet />
      </Container>
    </Box>
  );
};
