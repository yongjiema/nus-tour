import React from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";

const AnimatedSection = styled(Box)(() => ({
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

interface SectionWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  sx?: SxProps<Theme>;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, sx }) => {
  return <AnimatedSection sx={sx}>{children}</AnimatedSection>;
};
