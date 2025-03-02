import React from "react";
import {
  List, ListItem, Divider, Typography, Rating,
  Box, Chip, IconButton, Paper
} from "@mui/material";
import { useList, useUpdate } from "@refinedev/core";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const FeedbackList: React.FC = () => {
  const { data, isLoading, refetch } = useList({
    resource: "feedback",
    pagination: { current: 1, pageSize: 10 },
  });

  const { mutate: updateFeedback } = useUpdate();

  const handleToggleVisibility = (id: number, isCurrentlyPublic: boolean) => {
    updateFeedback(
      {
        resource: "feedback",
        id,
        values: { isPublic: !isCurrentlyPublic },
      },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Customer Feedback
        </Typography>
        <List>
          {data?.data.map((feedback: any) => (
            <React.Fragment key={feedback.id}>
              <ListItem alignItems="flex-start">
                <Box width="100%">
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Rating value={feedback.rating} readOnly />
                      <Typography color="textSecondary" variant="caption">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        label={feedback.booking?.tourName || "Tour"}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleToggleVisibility(feedback.id, feedback.isPublic)}
                      >
                        {feedback.isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" mt={1}>
                    {feedback.comments}
                  </Typography>
                  <Typography variant="subtitle2" mt={1}>
                    By: {feedback.user?.name || "Anonymous"}
                  </Typography>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default FeedbackList;
