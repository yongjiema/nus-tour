import React, { ReactNode } from "react";
import { Box, Container, AppBar, Toolbar, Typography, Button } from "@mui/material";
import LogoutButton from "./LogoutButton";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Admin Header with Public Header styling */}
      <AppBar position="static" style={{ backgroundColor: "#002147" }}>
        <Container maxWidth="lg">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1 }}
              onClick={() => navigate("/admin")}
              style={{
                color: "#FF6600",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              NUS Tour
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                component={Link}
                to="/admin"
                variant="contained"
                color={location.pathname === "/admin" ? "secondary" : "primary"}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/admin/bookings"
                variant="contained"
                color={location.pathname === "/admin/bookings" ? "secondary" : "primary"}
              >
                Bookings
              </Button>
              <Button
                component={Link}
                to="/admin/check-ins"
                variant="contained"
                color={location.pathname === "/admin/check-ins" ? "secondary" : "primary"}
              >
                Check-ins
              </Button>
              <LogoutButton />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
};
