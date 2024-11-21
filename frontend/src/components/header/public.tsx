import React from "react";
import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import LoginButton from "../LoginButton";

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
              style={{
                color: "#FF6600",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              NUS Tour
            </Typography>
            <Box>
              <LoginButton />
            </Box>
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
