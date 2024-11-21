import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Button onClick={handleLogout} variant="contained" color="secondary">
      Logout
    </Button>
  );
};

export default LogoutButton;
