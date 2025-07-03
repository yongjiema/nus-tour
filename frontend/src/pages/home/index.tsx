import React from "react";
import { Box, Typography, Container, CardMedia, Tooltip } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import { useIsAuthenticated } from "@refinedev/core";
import NUSPhoto from "../../assets/images/nus-campus.jpg";
import { getThemeColor } from "../../theme/constants";
import { PageTitle, Subtitle } from "../../components/shared/ui";

const BodyText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  fontSize: "18px",
  lineHeight: 1.8,
  textAlign: "justify",
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

const ActionButton = styled("button")(({ theme, color = "primary" }) => {
  const getColor = () => {
    switch (color) {
      case "orange":
        return getThemeColor(theme, "NUS_ORANGE");
      case "green":
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return {
    backgroundColor: getColor(),
    color: theme.palette.common.white,
    padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
    fontSize: "18px",
    borderRadius: 0,
    boxShadow: "none",
    textTransform: "capitalize",
    width: "300px",
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
    border: "none",
    cursor: "pointer",
    "&:hover": {
      backgroundColor:
        color === "orange"
          ? getThemeColor(theme, "NUS_ORANGE_DARK")
          : color === "green"
          ? theme.palette.success.dark
          : theme.palette.primary.dark,
      textDecoration: "none",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  };
});

export const Home: React.FC = () => {
  const theme = useTheme();
  const { data: authData } = useIsAuthenticated();
  const navigate = useNavigate();

  // Extract authentication status and user data from the data object
  const isAuthenticated = authData?.authenticated === true;
  const authDataWithRoles = authData as { roles?: string[] } | undefined;
  const userRoles = Array.isArray(authDataWithRoles?.roles) ? authDataWithRoles.roles : [];
  const isAdmin = userRoles.includes("ADMIN");
  const isUser = userRoles.includes("USER");

  // Different routing based on user roles
  // - Admin + User roles: Allow access to user features (booking/check-in)
  // - Admin only: Redirect to admin dashboard for management
  // - User only: Standard user dashboard access
  // - Unauthenticated: Store redirect intention and send to login
  const handleBookingClick = () => {
    if (isAuthenticated) {
      // If admin has both roles, prefer user dashboard for booking
      if (isAdmin && isUser) {
        void navigate("/u?tab=book-tour");
      } else if (isAdmin && !isUser) {
        // Admin-only: redirect to admin dashboard with a note about booking management
        void navigate("/admin");
      } else {
        // Regular user
        void navigate("/u?tab=book-tour");
      }
    } else {
      // Store the intended destination for after login
      sessionStorage.setItem("redirectAfterLogin", "/u?tab=book-tour");
      void navigate("/login");
    }
  };

  const handleCheckinClick = () => {
    if (isAuthenticated) {
      // If admin has both roles, prefer user dashboard for check-in
      if (isAdmin && isUser) {
        void navigate("/u?tab=check-in");
      } else if (isAdmin && !isUser) {
        // Admin-only: redirect to admin dashboard
        void navigate("/admin");
      } else {
        // Regular user
        void navigate("/u?tab=check-in");
      }
    } else {
      // Store the intended destination for after login
      sessionStorage.setItem("redirectAfterLogin", "/u?tab=check-in");
      void navigate("/login");
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 6,
        textAlign: "center",
        px: { xs: 2, md: 0 },
      }}
    >
      {/* Hero Image Section */}
      <CardMedia
        component="img"
        image={NUSPhoto}
        alt="NUS Campus"
        sx={{
          width: "100%",
          height: "auto",
          marginBottom: 4,
        }}
      />
      {/* Introduction Section */}
      <PageTitle variant="h3" gutterBottom>
        Welcome to NUS Tour
      </PageTitle>

      <Subtitle
        variant="h6"
        gutterBottom
        sx={{
          // Use responsive font sizes with better scaling
          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
          lineHeight: { xs: 1.4, sm: 1.5 },
          // Ensure consistent spacing
          maxWidth: "700px",
          mx: "auto",
          textAlign: "center",
          mb: 3, // Use consistent margin bottom
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>Discover, Learn, and Experience NUS</span>{" "}
        <span style={{ whiteSpace: "nowrap" }}>through our guided campus tours.</span>
      </Subtitle>

      <BodyText variant="body1">
        NUS is a world-renowned institution of higher learning, ranked among the top universities globally. Situated in
        the heart of Singapore, our campus is a vibrant hub of academic excellence, cutting-edge research, and cultural
        diversity. Our guided tours offer a unique opportunity to explore our iconic architecture, state-of-the-art
        facilities, and bustling student life. Whether you're a prospective student, a visitor, or simply curious, join
        us to discover what makes NUS a beacon of inspiration and opportunity.
      </BodyText>

      {/* Call-to-Action Section */}
      <ButtonContainer>
        <Link to="/information" style={{ textDecoration: "none" }}>
          <ActionButton color="primary">Learn More About NUS</ActionButton>
        </Link>

        <Tooltip
          title={
            isAuthenticated && isAdmin && !isUser
              ? "Go to admin dashboard to manage all bookings"
              : isAuthenticated && isAdmin && isUser
              ? "Book a tour (you'll access the user dashboard)"
              : "Book a tour"
          }
          arrow
        >
          <ActionButton onClick={handleBookingClick} color="orange">
            {isAuthenticated && isAdmin && !isUser ? "Manage Bookings" : "Book a Campus Tour"}
          </ActionButton>
        </Tooltip>

        <Tooltip
          title={
            isAuthenticated && isAdmin && !isUser
              ? "Go to admin dashboard to manage check-ins"
              : isAuthenticated && isAdmin && isUser
              ? "Check in to your tour (you'll access the user dashboard)"
              : "Check in to your tour"
          }
          arrow
        >
          <ActionButton onClick={handleCheckinClick} color="green">
            {isAuthenticated && isAdmin && !isUser ? "Manage Check-ins" : "Check In"}
          </ActionButton>
        </Tooltip>
      </ButtonContainer>
      <footer
        style={{
          marginTop: "50px",
          marginBottom: "50px",
          textAlign: "center",
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="body2" color="textSecondary" align="center">
          &copy; {new Date().getFullYear()} NUS Tour. All rights reserved.
        </Typography>
      </footer>
    </Container>
  );
};
