import React from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const LoginButton: React.FC = () => {
  const theme = useTheme();

  return (
    <Button
      component={Link}
      to="/login"
      variant="contained"
      color="secondary"
      sx={{
        fontWeight: "bold",
        px: 3,
        py: 1,
        "&:hover": {
          backgroundColor: theme.palette.secondary.dark,
          transform: "translateY(-1px)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
      }}
    >
      LOGIN
    </Button>
  );
};

export default LoginButton;
