import React from "react";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLogout } from "@refinedev/core";
import { useTheme } from "@mui/material/styles";
import {
  getOverlayBackground,
  getHoverOverlayBackground,
  getOverlayBorder,
  getButtonShadow,
  TRANSITIONS,
} from "../theme/constants";

const LogoutButton: React.FC = () => {
  const { mutate: logout } = useLogout();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outlined"
      startIcon={<LogoutIcon />}
      sx={{
        backgroundColor: getOverlayBackground(theme, "medium"),
        color: theme.palette.common.white,
        borderColor: getOverlayBorder(theme, "medium"),
        fontWeight: "bold",
        px: 2,
        py: 1,
        transition: TRANSITIONS.short,
        "&:hover": {
          backgroundColor: getHoverOverlayBackground(theme, "medium"),
          transform: "translateY(-1px)",
          boxShadow: getButtonShadow(theme, "medium"),
        },
        "&:active": {
          transform: "translateY(0)",
        },
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
