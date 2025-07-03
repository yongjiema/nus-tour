import React from "react";
import { Box, Typography, Paper, Grid2 as Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import RateReviewIcon from "@mui/icons-material/RateReview";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { SectionTitle } from "../../../../components/shared/ui";
import { TRANSITIONS } from "../../../../theme/constants";

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
  transition: `all ${TRANSITIONS.short}`,
  "&:hover": {
    transform: "translateY(-4px)",
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[8],
    "& .MuiTypography-root": {
      color: theme.palette.primary.contrastText,
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: "8px",
  "& .MuiSvgIcon-root": {
    fontSize: "2rem",
    color: theme.palette.primary.main,
    transition: `color ${TRANSITIONS.short}`,
  },
}));

const ActionText = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "1rem",
  color: theme.palette.text.primary,
  transition: `color ${TRANSITIONS.short}`,
}));

interface QuickActionsProps {
  navigate: (path: string) => void | Promise<void>;
}

const QuickActions: React.FC<QuickActionsProps> = ({ navigate }) => {
  const actions = [
    {
      title: "Manage Bookings",
      icon: <EventNoteIcon />,
      path: "/admin/bookings",
    },
    {
      title: "Manage Check-Ins",
      icon: <HowToRegIcon />,
      path: "/admin/check-ins",
    },
    {
      title: "View Feedback",
      icon: <RateReviewIcon />,
      path: "/admin/feedback",
    },
  ];

  return (
    <Box mt={4} mb={4}>
      <SectionTitle variant="h5" gutterBottom>
        Quick Actions
      </SectionTitle>
      <Grid container spacing={3}>
        {actions.map((action, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <ActionCard
              elevation={2}
              onClick={() => void navigate(action.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void navigate(action.path);
                }
              }}
              aria-label={`Navigate to ${action.title}`}
            >
              <IconWrapper>{action.icon}</IconWrapper>
              <ActionText variant="body1">{action.title}</ActionText>
            </ActionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

QuickActions.displayName = "QuickActions";
export default QuickActions;
