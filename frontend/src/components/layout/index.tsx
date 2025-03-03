import React from "react";
import { Box } from "@mui/material";

export const CustomLayout: React.FC<{ Header: React.FC; children: React.ReactNode }> = ({
  Header,
  children,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <Header />
      <Box
        component="main"
        sx={{
          p: { xs: 1, md: 2, lg: 3 },
          width: "100%",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 