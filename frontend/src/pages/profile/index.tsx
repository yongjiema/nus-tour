import React from "react";
import { Box, Typography, Avatar, Paper } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import type { AuthUser } from "../../types/auth.types";

const ProfilePage: React.FC = () => {
  const { data: user } = useGetIdentity<AuthUser>();

  if (!user) return null;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Avatar src={user.avatar} alt={displayName} sx={{ width: 64, height: 64 }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6" gutterBottom>
        Roles
      </Typography>
      <Typography variant="body2">{user.roles.join(", ")}</Typography>
    </Paper>
  );
};

export default ProfilePage;

export { ProfilePage };
