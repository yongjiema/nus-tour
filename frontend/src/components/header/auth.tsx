import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Box, Container, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { getOverlayBackground } from "../../theme/constants";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ColorModeContext } from "../../contexts/color-mode";

export const AuthHeader: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode: _mode, setMode: _setMode } = useContext(ColorModeContext);

  return (
    <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main, mb: 2 }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: theme.palette.secondary.main,
              cursor: "pointer",
              fontWeight: "bold",
              "&:hover": {
                color: theme.palette.secondary.light,
              },
            }}
            onClick={() => {
              void navigate("/");
            }}
          >
            NUS Tour
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={_setMode}
              aria-label="toggle light/dark mode"
              sx={{
                color: theme.palette.common.white,
                "&:hover": {
                  backgroundColor: getOverlayBackground(theme, "light"),
                },
              }}
            >
              {_mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
