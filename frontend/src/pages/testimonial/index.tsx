import React from "react";
import { useList } from "@refinedev/core";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Rating,
  Box,
  Avatar,
  CircularProgress,
  Divider,
  Alert,
  Grid2 as Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { formatDateDisplay } from "../../utils/dateUtils";

interface FeedbackUser {
  id: string;
  name: string;
}

interface FeedbackBooking {
  id: number;
  tourDate: string;
}

interface Feedback {
  id: number;
  rating: number;
  comments: string;
  user?: FeedbackUser;
  booking?: FeedbackBooking;
  createdAt: string;
}

const PageSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(6),
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(2),
}));

const QuoteIcon = styled(FormatQuoteIcon)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const TestimonialsPage: React.FC = () => {
  const { data, isLoading, isError } = useList<Feedback>({
    resource: "feedback",
    filters: [{ field: "isPublic", operator: "eq", value: true }],
    pagination: { current: 1, pageSize: 50 },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <Alert severity="error">Failed to load testimonials. Please try again later.</Alert>
      </Box>
    );
  }

  // After loading and error checks, Refine useList guarantees data structure
  const testimonials = data.data;
  const hasTestimonials = testimonials.length > 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          What Our Visitors Say
        </Typography>
        <PageSubtitle variant="subtitle1">
          Read testimonials from visitors who've experienced our campus tours
        </PageSubtitle>
      </Box>

      {hasTestimonials ? (
        <Grid container spacing={3}>
          {testimonials.map((feedback) => (
            <Grid size={{ xs: 12, md: 6 }} key={feedback.id}>
              <TestimonialCard elevation={2}>
                <CardContent>
                  <Box display="flex" mb={2}>
                    <UserAvatar>{feedback.user?.name ? feedback.user.name.charAt(0) : "V"}</UserAvatar>
                    <Box>
                      <Typography variant="subtitle1">{feedback.user?.name ?? "Visitor"}</Typography>
                      <Rating value={feedback.rating} readOnly size="small" />
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex">
                    <QuoteIcon />
                    <Typography variant="body1">{feedback.comments}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                    Tour Date: {formatDateDisplay(feedback.booking?.tourDate ?? feedback.createdAt)}
                  </Typography>
                </CardContent>
              </TestimonialCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          No testimonials available yet. Be the first to share your experience!
        </Alert>
      )}
    </Container>
  );
};

export default TestimonialsPage;

export { default as TestimonialsPage } from "./index";
