import React from "react";
import { Box, Fade } from "@mui/material";

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
  "aria-controls"?: string;
  "aria-labelledby"?: string;
  role?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  const isActive = value === index;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      <Fade in={isActive} timeout={{ enter: 500, exit: 300 }}>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Fade>
    </div>
  );
};
