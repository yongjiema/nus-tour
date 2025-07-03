import React, { useContext, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useLogout } from "@refinedev/core";
import LoginButton from "../LoginButton";
import { useTheme } from "@mui/material/styles";
import { getOverlayBackground, getDropShadow } from "../../theme/constants";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { ColorModeContext } from "../../contexts/color-mode";
import type { AuthUser } from "../../types/auth.types";

export const PublicHeader: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode: _mode, setMode: _setMode } = useContext(ColorModeContext);
  const { mutate: logout } = useLogout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object" && "email" in parsed && "roles" in parsed) {
          const userData = parsed as AuthUser;
          if (Array.isArray(userData.roles)) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

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
    // Navigate to appropriate dashboard based on user role
    if (user.roles.includes("ADMIN")) {
      void navigate("/dashboard/admin");
    } else {
      void navigate("/dashboard/user");
    }
  };

  return (
    <Box>
      {/* Public Header */}
      <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
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

              {/* Show user menu if authenticated, otherwise show login button */}
              {user ? (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{
                      ml: 1,
                      color: theme.palette.common.white,
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
                      Dashboard
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
              ) : (
                <LoginButton />
              )}
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
