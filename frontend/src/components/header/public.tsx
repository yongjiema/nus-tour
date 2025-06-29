import React from "react";
import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import LoginButton from "../LoginButton";
import { useTheme } from "@mui/material/styles";
import { getThemeColor } from "../../theme/constants";

export const PublicHeader: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Public Header */}
      <AppBar position="static" style={{ backgroundColor: getThemeColor(theme, "NUS_BLUE") }}>
        <Container maxWidth="lg">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1 }}
              onClick={() => {
                void navigate("/");
              }}
              style={{
                color: getThemeColor(theme, "NUS_ORANGE"),
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
