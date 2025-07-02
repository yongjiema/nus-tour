import React, { useContext, useMemo } from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useGetIdentity, useLogout } from "@refinedev/core";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { ColorModeContext } from "../../../contexts/color-mode";
import { getOverlayBackground, getDropShadow, TRANSITIONS } from "../../../theme/constants";
import type { AuthUser } from "../../../types/auth.types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = "Dashboard", subtitle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user } = useGetIdentity<AuthUser>();
  const { mutate: logout } = useLogout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Create display name from user data
  const displayName = useMemo(() => {
    if (!user) return "User";
    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    return fullName || user.email.split("@")[0] || "User";
  }, [user]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleProfileClick = () => {
    handleMenuClose();
    // Navigate to profile page when implemented
    console.log("Profile clicked");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.palette.primary.main,
          boxShadow: theme.shadows[2],
        }}
        component="header"
        role="banner"
      >
        <Container maxWidth="lg">
          <Toolbar>
            {/* Logo/Brand */}
            <Typography
              variant="h6"
              component="h1"
              sx={{
                flexGrow: 1,
                color: theme.palette.secondary.main,
                cursor: "pointer",
                fontWeight: "bold",
                transition: TRANSITIONS.short,
                "&:hover": {
                  color: theme.palette.secondary.light,
                },
                "&:focus": {
                  outline: `2px solid ${theme.palette.secondary.light}`,
                  outlineOffset: "2px",
                },
              }}
              onClick={() => void navigate("/")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void navigate("/");
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Go to home"
            >
              NUS Tour
            </Typography>

            {/* Right side controls */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
              component="nav"
              role="navigation"
              aria-label="User navigation"
            >
              {/* Theme toggle */}
              <IconButton
                onClick={setMode}
                aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
                sx={{
                  color: theme.palette.common.white,
                  transition: TRANSITIONS.short,
                  "&:hover": {
                    backgroundColor: getOverlayBackground(theme, "light"),
                    transform: "scale(1.1)",
                  },
                  "&:focus": {
                    outline: `2px solid ${theme.palette.secondary.light}`,
                    outlineOffset: "2px",
                  },
                }}
              >
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {/* User menu */}
              {user && (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{
                      ml: 1,
                      color: theme.palette.common.white,
                      transition: TRANSITIONS.short,
                      "&:hover": {
                        backgroundColor: getOverlayBackground(theme, "light"),
                      },
                    }}
                    aria-controls={anchorEl ? "user-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={anchorEl ? "true" : undefined}
                    aria-label="User account menu"
                  >
                    <Avatar
                      src={user.avatar}
                      alt={displayName}
                      sx={{
                        width: 32,
                        height: 32,
                        border: `2px solid ${theme.palette.secondary.main}`,
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="user-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    slotProps={{
                      paper: {
                        elevation: 3,
                        sx: {
                          overflow: "visible",
                          filter: getDropShadow(theme, "medium"),
                          mt: 1.5,
                          minWidth: 200,
                          "& .MuiAvatar-root": {
                            width: 24,
                            height: 24,
                            ml: -0.5,
                            mr: 1,
                          },
                          "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                          },
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    {/* User info header */}
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {displayName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                    <Divider />

                    {/* Menu items */}
                    <MenuItem onClick={handleProfileClick}>
                      <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
        }}
        component="main"
        role="main"
      >
        {/* Page Header */}
        {(title || subtitle) && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Page Content */}
        <Box sx={{ flex: 1 }}>{children}</Box>
      </Container>
    </Box>
  );
};
