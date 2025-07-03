import React from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import FeedbackIcon from "@mui/icons-material/Feedback";
import HistoryIcon from "@mui/icons-material/History";
import { formatDateDisplay } from "../../../../utils/dateUtils";
import type { ActivityItem } from "../../../../types/api.types";
import { getSubtleBackground } from "../../../../theme/constants";
import { SectionTitle } from "../../../../components/shared/ui";

const ActivityContainer = styled(Paper)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
}));

const ActivityHeader = styled(Box)(({ theme }) => ({
  padding: "16px 24px",
  backgroundColor: getSubtleBackground(theme, "medium"),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ActivityList = styled(List)(({ theme }) => ({
  maxHeight: "400px",
  overflowY: "auto",
  padding: 0,
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.paper,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[600] : theme.palette.grey[400],
    borderRadius: "3px",
  },
}));

const ActivityListItem = styled(ListItem)(({ theme }) => ({
  borderLeft: "4px solid transparent",
  paddingLeft: "20px",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: getSubtleBackground(theme, "light"),
  },
  "&:not(:last-child)": {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

// Fixed Avatar component to correctly type the color prop
const ActivityAvatar = styled(Avatar)<{ color?: string }>(({ theme, color }) => ({
  backgroundColor: color ?? theme.palette.primary.main,
  width: 36,
  height: 36,
}));

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = React.memo(({ activities, isLoading }) => {
  const theme = useTheme();

  // Function to determine the icon and color for each activity type
  const getActivityDetails = (type: string) => {
    switch (type) {
      case "booking":
        return {
          icon: <EventIcon />,
          label: "Booking",
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
        };
      case "feedback":
        return {
          icon: <FeedbackIcon />,
          label: "Feedback",
          color: theme.palette.info.main,
          borderColor: theme.palette.info.main,
        };
      default:
        return {
          icon: <PersonIcon />,
          label: "User",
          color: theme.palette.warning.main,
          borderColor: theme.palette.warning.main,
        };
    }
  };

  return (
    <Box mt={5} mb={4}>
      <SectionTitle variant="h5" gutterBottom>
        <HistoryIcon /> Recent Activity
      </SectionTitle>

      <ActivityContainer elevation={2}>
        <ActivityHeader>
          <Typography variant="h6" sx={{ fontWeight: "medium", color: "text.primary" }}>
            Latest Updates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Recent activities and events from your tour operations
          </Typography>
        </ActivityHeader>

        {isLoading ? (
          <List>
            {Array.from(new Array(4)).map((_, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  <Skeleton variant="circular" width={36} height={36} animation="wave" />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton width="70%" height={24} animation="wave" />}
                  secondary={<Skeleton width="40%" height={16} animation="wave" />}
                />
                <Skeleton width="60px" height={24} animation="wave" />
              </ListItem>
            ))}
          </List>
        ) : activities.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Alert
              severity="info"
              sx={{
                mb: 2,
                backgroundColor: theme.palette.mode === "dark" ? `${theme.palette.info.main}20` : undefined,
                color: theme.palette.text.primary,
                "& .MuiAlert-icon": {
                  color: theme.palette.info.main,
                },
              }}
            >
              No recent activity to display
            </Alert>
            <Typography variant="body2" color="text.secondary">
              New activities will appear here as they happen
            </Typography>
          </Box>
        ) : (
          <ActivityList aria-label="Recent activities list">
            {activities.map((activity) => {
              const { icon, label, color, borderColor } = getActivityDetails(activity.type);
              const formattedTime = formatDateDisplay(activity.timestamp.toString());
              const activityId = typeof activity.id === "string" ? activity.id : String(activity.id);
              return (
                <ActivityListItem key={activityId} sx={{ borderLeftColor: borderColor }}>
                  <ListItemIcon>
                    <ActivityAvatar color={color}>{icon}</ActivityAvatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.primary">
                          {activity.description}
                        </Typography>
                        <Chip
                          label={label}
                          size="small"
                          sx={{
                            bgcolor: `${color}20`,
                            color: color,
                            fontWeight: "medium",
                            height: "22px",
                          }}
                        />
                      </Box>
                    }
                    secondary={<TimeStamp>{formattedTime}</TimeStamp>}
                  />
                </ActivityListItem>
              );
            })}
          </ActivityList>
        )}
      </ActivityContainer>
    </Box>
  );
});

RecentActivity.displayName = "RecentActivity";
export default RecentActivity;
