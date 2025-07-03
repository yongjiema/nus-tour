import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ThemedLayoutV2, ThemedSiderV2 } from "@refinedev/mui";
import { CanAccess } from "@refinedev/core";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Box } from "@mui/material";
import AdminHeader from "../header/admin";
import Tooltip from "@mui/material/Tooltip";

// Admin-specific icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PeopleIcon from "@mui/icons-material/People";

import AnalyticsIcon from "@mui/icons-material/Analytics";
import SettingsIcon from "@mui/icons-material/Settings";

interface AdminNavigationItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  resource: string;
  action: string;
}

interface AdminNavigationSection {
  title: string;
  items: AdminNavigationItem[];
}

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();

  // Define admin-specific navigation sections
  const adminNavigationSections: AdminNavigationSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          label: "Overview",
          icon: <DashboardIcon />,
          path: "/admin",
          resource: "dashboard",
          action: "list",
        },
        {
          label: "Analytics",
          icon: <AnalyticsIcon />,
          path: "/admin/analytics",
          resource: "analytics",
          action: "list",
        },
      ],
    },
    {
      title: "Tour Management",
      items: [
        {
          label: "Manage Bookings",
          icon: <EventIcon />,
          path: "/admin/bookings",
          resource: "bookings",
          action: "list",
        },
        {
          label: "Check-ins",
          icon: <HowToRegIcon />,
          path: "/admin/check-ins",
          resource: "check-ins",
          action: "list",
        },
      ],
    },
    {
      title: "User Management",
      items: [
        {
          label: "Users",
          icon: <PeopleIcon />,
          path: "/admin/users",
          resource: "users",
          action: "list",
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          label: "Settings",
          icon: <SettingsIcon />,
          path: "/admin/settings",
          resource: "settings",
          action: "list",
        },
      ],
    },
  ];

  const renderAdminNavigationSection = (section: AdminNavigationSection, collapsed: boolean) => {
    // Create list item elements and skip entirely if nothing is accessible (edge-case)
    const renderedItems = section.items
      .map((item) => {
        const listButton = (
          <ListItemButton
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              margin: collapsed ? "2px auto" : "2px 8px",
              width: collapsed ? 48 : "auto",
              justifyContent: collapsed ? "center" : "flex-start",
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { backgroundColor: "primary.dark" },
                "& .MuiListItemIcon-root": { color: "primary.contrastText" },
              },
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: "center" }}>{item.icon}</ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    fontSize: "0.875rem",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  },
                }}
              />
            )}
          </ListItemButton>
        );

        return (
          <CanAccess key={item.path} resource={item.resource} action={item.action} fallback={null}>
            {collapsed ? (
              <Tooltip title={item.label} placement="right">
                {listButton}
              </Tooltip>
            ) : (
              listButton
            )}
          </CanAccess>
        );
      })
      .filter(Boolean);

    if (renderedItems.length === 0) return null;

    return (
      <Box key={section.title} sx={{ mb: 2 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: "0.7rem",
            }}
          >
            {section.title}
          </Typography>
        )}
        <List dense>{renderedItems}</List>
        <Divider sx={{ mx: 2, my: 1 }} />
      </Box>
    );
  };

  return (
    <ThemedLayoutV2
      Header={() => <AdminHeader />}
      Sider={() => (
        <ThemedSiderV2
          Title={({ collapsed }) => (
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "block",
                width: "100%",
              }}
              aria-label="Go to home page"
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: 2,
                  py: 1.5,
                  minHeight: 56,
                  width: "100%",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <HomeRoundedIcon
                  sx={{
                    fontSize: 24,
                    color: theme.palette.primary.main,
                  }}
                />
                {!collapsed && (
                  <Typography
                    variant="subtitle1"
                    noWrap
                    className="brand-text"
                    sx={{
                      ml: 1,
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                      transition: "color 0.2s ease-in-out",
                    }}
                  >
                    NUS Tour
                  </Typography>
                )}
              </Box>
            </Link>
          )}
          render={({ collapsed }) => (
            <Box sx={{ height: "100%", overflow: "auto" }}>
              {adminNavigationSections.map((sec) => renderAdminNavigationSection(sec, collapsed))}
            </Box>
          )}
        />
      )}
    >
      <Outlet />
    </ThemedLayoutV2>
  );
};
