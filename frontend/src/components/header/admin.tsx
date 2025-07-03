import React, { useContext, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuOpenIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useGetIdentity, useLogout, useIsAuthenticated } from "@refinedev/core";
import { useThemedLayoutContext } from "@refinedev/mui";
import { ColorModeContext } from "../../contexts/color-mode";
import { getOverlayBackground, getDropShadow } from "../../theme/constants";
import type { AuthUser } from "../../types/auth.types";

const AdminHeader: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { siderCollapsed, setSiderCollapsed } = useThemedLayoutContext();
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: isAuthenticated } = useIsAuthenticated();
  const { data: user } = useGetIdentity<AuthUser>();
  const { mutate: logout } = useLogout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const displayName = useMemo(() => {
    if (!user) return "User";
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return full || user.email.split("@")[0] || "User";
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
  const handleDashboard = () => {
    handleMenuClose();
    void navigate("/profile");
  };

  return (
    <AppBar position="sticky" color="primary" enableColorOnDark>
      <Toolbar sx={{ minHeight: 56 }}>
        {/* Sider toggle */}
        <IconButton
          aria-label="toggle navigation"
          edge="start"
          onClick={() => {
            setSiderCollapsed(!siderCollapsed);
          }}
          sx={{
            mr: 2,
            color: theme.palette.common.white,
            "&:hover": { backgroundColor: getOverlayBackground(theme, "light") },
          }}
        >
          <MenuOpenIcon />
        </IconButton>
        {/* Title */}
        <Typography
          variant="subtitle1"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: theme.palette.secondary.main,
            cursor: "pointer",
            mr: 2,
            transition: "color 0.2s ease-in-out",
            "&:hover": {
              color: theme.palette.secondary.light,
            },
          }}
          onClick={() => {
            void navigate("/admin");
          }}
        >
          NUS Tour Admin
        </Typography>
        {/* Theme Toggle */}
        <IconButton
          onClick={setMode}
          aria-label="toggle theme"
          sx={{
            color: theme.palette.common.white,
            mr: 1,
            "&:hover": { backgroundColor: getOverlayBackground(theme, "light") },
          }}
        >
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        {/* User Menu */}
        {isAuthenticated && user && (
          <>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                color: theme.palette.common.white,
                "&:hover": { backgroundColor: getOverlayBackground(theme, "light") },
              }}
            >
              <Avatar
                src={user.avatar}
                alt={displayName}
                sx={{ width: 32, height: 32, border: `2px solid ${theme.palette.secondary.main}` }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    overflow: "visible",
                    filter: getDropShadow(theme, "medium"),
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
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleDashboard}>
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
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
