import React, { useEffect } from "react";
import { Box, Grid, Paper, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { authProvider } from "../../authProvider";

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const result = await authProvider.check();
      if (!result.authenticated) {
        if (result.redirectTo) {
          navigate(result.redirectTo);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <Typography variant="h6">Total Bookings</Typography>
            <Typography variant="h4">120</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <Typography variant="h6">Pending Check-Ins</Typography>
            <Typography variant="h4">8</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <Typography variant="h6">Completed Tours</Typography>
            <Typography variant="h4">95</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <Typography variant="h6">Feedbacks Received</Typography>
            <Typography variant="h4">45</Typography>
          </StatCard>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/admin/bookings")}
            >
              Manage Bookings
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/admin/check-ins")}
            >
              Manage Check-Ins
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => navigate("/admin/policies")}
            >
              Update Policies
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/admin/tour-info")}
            >
              Manage Tour Information
            </Button>
          </Grid>
        </Grid>
      </Box>
    </DashboardContainer>
  );
};

export default AdminDashboard;
