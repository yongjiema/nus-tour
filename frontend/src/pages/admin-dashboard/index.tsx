import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, Button, CircularProgress, Alert, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { authProvider } from "../../authProvider";
import { useApiUrl, useCustom } from "@refinedev/core";
import RefreshIcon from '@mui/icons-material/Refresh';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { formatDateDisplay } from "../../utils/dateUtils";
import { useErrorHandler } from "../../utils/errorHandler";
import { UserRole } from "../../types/auth.types";
import { DashboardStats, DashboardApiResponse, ActivityItem, ActivityApiResponse } from "../../types/api.types";

// Import individual components from recharts for better tree-shaking
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Styled components
const DashboardContainer = styled(Box)({
  padding: '24px',
});

const SectionTitle = styled(Typography)({
  fontWeight: 'bold',
  color: '#002147', // NUS blue
  marginBottom: '16px',
});

const StatCard = styled(Paper)({
  padding: '16px',
  textAlign: "center",
  color: 'text.secondary',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  }
});

const StatValue = styled(Typography)({
  fontWeight: 'bold',
  color: 'primary.main',
  marginTop: '8px',
});

const ActionButton = styled(Button)({
  textTransform: 'none',
  fontWeight: 'bold',
});

const ChartContainer = styled(Paper)({
  padding: '16px',
  height: '100%',
});

// Component for statistics cards
const StatCards: React.FC<{ stats: DashboardStats, isLoading: boolean }> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard elevation={3}>
          <Typography variant="h6">Total Bookings</Typography>
          <StatValue variant="h4">{stats.totalBookings}</StatValue>
        </StatCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard elevation={3}>
          <Typography variant="h6">Pending Check-Ins</Typography>
          <StatValue variant="h4">{stats.pendingCheckIns}</StatValue>
        </StatCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard elevation={3}>
          <Typography variant="h6">Completed Tours</Typography>
          <StatValue variant="h4">{stats.completedTours}</StatValue>
        </StatCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard elevation={3}>
          <Typography variant="h6">Feedbacks Received</Typography>
          <StatValue variant="h4">{stats.feedbacks}</StatValue>
        </StatCard>
      </Grid>
    </Grid>
  );
};

// Component for quick action buttons
const QuickActions: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => (
  <Box mt={4}>
    <SectionTitle variant="h5" gutterBottom>Quick Actions</SectionTitle>
    <Grid container spacing={2}>
      <Grid item>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => navigate("/admin/bookings")}
        >
          Manage Bookings
        </ActionButton>
      </Grid>
      <Grid item>
        <ActionButton
          variant="contained"
          color="secondary"
          onClick={() => navigate("/admin/check-ins")}
        >
          Manage Check-Ins
        </ActionButton>
      </Grid>
      <Grid item>
        <ActionButton
          variant="contained"
          onClick={() => navigate("/admin/feedback")}
        >
          View Feedback
        </ActionButton>
      </Grid>
    </Grid>
  </Box>
);

// Component for the statistics chart
const BookingChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => (
  <Box mt={4}>
    <SectionTitle variant="h5" gutterBottom>Booking Statistics</SectionTitle>
    <ChartContainer>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#003D7C" /> {/* NUS blue */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  </Box>
);

// Component for recent activity list
const RecentActivity: React.FC<{
  activities: ActivityItem[],
  isLoading: boolean
}> = ({ activities, isLoading }) => (
  <Box mt={4}>
    <SectionTitle variant="h5" gutterBottom>Recent Activity</SectionTitle>
    <Paper>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !activities || activities.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="info">No recent activity to display</Alert>
        </Box>
      ) : (
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id}>
              <ListItemIcon>
                {activity.type === 'booking' ? <EventIcon /> :
                 activity.type === 'feedback' ? <FeedbackIcon /> :
                 <PersonIcon />}
              </ListItemIcon>
              <ListItemText
                primary={activity.description}
                secondary={formatDateDisplay(activity.timestamp.toString())}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  </Box>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = useApiUrl();
  const { handleError } = useErrorHandler();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingCheckIns: 0,
    completedTours: 0,
    feedbacks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Using Refine's useCustom hook for data fetching
  const { data: apiResponse, isLoading, error, refetch } = useCustom<{ data: DashboardStats }>({
    url: `${apiUrl}/admin/dashboard/stats`,
    method: "get",
    queryOptions: {
      retry: 1,
      onError: (error) => {
        console.error("Dashboard stats error:", error);
        handleError(error);
      }
    }
  });

  const {
    data: activityResponse,
    isLoading: activityLoading,
    refetch: refetchActivity
  } = useCustom<{ data: ActivityItem[] }>({
    url: `${apiUrl}/admin/dashboard/recent-activity`,
    method: "get",
    queryOptions: {
      retry: 1,
      onError: (error) => {
        console.error("Recent activity error:", error);
        handleError(error);
      }
    }
  });

  useEffect(() => {
    console.log('Dashboard stats response:', apiResponse);
    if (apiResponse?.data?.data) {
      console.log('Stats data:', apiResponse.data.data);
      const stats = apiResponse.data.data;
      setDashboardStats({
        totalBookings: stats.totalBookings,
        pendingCheckIns: stats.pendingCheckIns,
        completedTours: stats.completedTours,
        feedbacks: stats.feedbacks,
      });
    }
  }, [apiResponse]);

  useEffect(() => {
    console.log('Activity response:', activityResponse);
    if (activityResponse?.data) {
      // Ensure we're getting an array and handle empty data case
      const activities = Array.isArray(activityResponse.data) ? activityResponse.data : [];
      setRecentActivity(activities);
    }
  }, [activityResponse]);

  const handleRefresh = () => {
    refetch();
    refetchActivity();
  };

  const chartData = [
    { name: 'Total Bookings', value: dashboardStats.totalBookings },
    { name: 'Pending Check-Ins', value: dashboardStats.pendingCheckIns },
    { name: 'Completed Tours', value: dashboardStats.completedTours },
    { name: 'Feedbacks', value: dashboardStats.feedbacks },
  ];

  return (
    <DashboardContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <SectionTitle variant="h4">Admin Dashboard</SectionTitle>
        <ActionButton
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          variant="outlined"
        >
          Refresh Data
        </ActionButton>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to load dashboard statistics. Please try again.
        </Alert>
      ) : (
        <StatCards stats={dashboardStats} isLoading={isLoading} />
      )}

      <QuickActions navigate={navigate} />

      <BookingChart data={chartData} />

      <RecentActivity
        activities={recentActivity}
        isLoading={activityLoading}
      />
    </DashboardContainer>
  );
};

export default AdminDashboard;
