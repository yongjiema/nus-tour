import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2 } from "@refinedev/mui";
import AdminHeader from "../header/admin";
import HomeIcon from "@mui/icons-material/Home";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

export const UserLayout: React.FC = () => {
  const location = useLocation();
  const menuItems = [
    {
      label: "Dashboard",
      icon: <HomeIcon />,
      path: "/dashboard/user",
    },
    {
      label: "My Bookings",
      icon: <BookOnlineIcon />,
      path: "/dashboard/user/bookings",
    },
  ];

  return (
    <ThemedLayoutV2
      Header={() => <AdminHeader />}
      Sider={() => (
        <ThemedSiderV2
          fixed
          Title={({ collapsed }) => <ThemedTitleV2 collapsed={collapsed} text="NUS Tour" icon={<LocationOnIcon />} />}
          render={() => (
            <List>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          )}
        />
      )}
    >
      <Outlet />
    </ThemedLayoutV2>
  );
};
