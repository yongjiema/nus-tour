import React from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const LoginButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    void navigate("/login");
  };

  return (
    <Button variant="contained" color="primary" onClick={handleLogin}>
      Login
    </Button>
  );
};

export default LoginButton;
