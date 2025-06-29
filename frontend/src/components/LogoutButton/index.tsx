import React from "react";
import { Button } from "@mui/material";
import { useLogout } from "@refinedev/core";

const LogoutButton: React.FC = () => {
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button variant="outlined" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
