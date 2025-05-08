import React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import { styled } from "@mui/system";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import RateReviewIcon from "@mui/icons-material/RateReview";

const SectionTitle = styled(Typography)({
  fontWeight: "bold",
  color: "#002147",
  marginBottom: "16px",
});

const ActionCard = styled(Paper)(({ theme }) => ({
  padding: "16px",
  borderRadius: "12px",
  textAlign: "center",
  cursor: "pointer",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Direct value instead of theme.shadows
    backgroundColor: theme.palette.primary.light,
    "& .MuiTypography-root": {
      color: theme.palette.common.white,
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.common.white,
    },
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
  "& svg": {
    fontSize: "36px",
    color: theme.palette.primary.main,
  },
}));

const ActionText = styled(Typography)({
  fontWeight: "bold",
  fontSize: "1rem",
});

interface QuickActionsProps {
  navigate: (path: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = React.memo(({ navigate }) => {
  const actions = [
    {
      title: "Manage Bookings",
      icon: <EventNoteIcon />,
      path: "/admin/bookings",
      ariaLabel: "Navigate to booking management",
    },
    {
      title: "Manage Check-Ins",
      icon: <HowToRegIcon />,
      path: "/admin/check-ins",
      ariaLabel: "Navigate to check-in management",
    },
    {
      title: "View Feedback",
      icon: <RateReviewIcon />,
      path: "/admin/feedback",
      ariaLabel: "Navigate to feedback management",
    },
  ];

  return (
    <Box mt={5} mb={4}>
      <SectionTitle variant="h5" gutterBottom>
        Quick Actions
      </SectionTitle>
      <Grid container spacing={3}>
        {actions.map((action, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <ActionCard elevation={2} onClick={() => navigate(action.path)} aria-label={action.ariaLabel} role="button">
              <IconWrapper>{action.icon}</IconWrapper>
              <ActionText>{action.title}</ActionText>
            </ActionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

export default QuickActions;
