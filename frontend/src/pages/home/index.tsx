import React from "react";
import { Box, Typography, Button, Container, useTheme } from "@mui/material";
import NUSPhoto from "../../assets/images/nus-campus.jpg";

export const Home: React.FC = () => {
  const theme = useTheme();
  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 6,
        textAlign: "center",
        px: { xs: 2, md: 0 },
      }}
    >
      {/* Photo Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          component="img"
          src={NUSPhoto}
          alt="NUS Campus"
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 2,
            boxShadow: 3,
          }}
        />
      </Box>

      {/* Introduction Section */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          fontWeight: "bold",
        }}
      >
        Welcome to NUS Tour
      </Typography>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: theme.palette.secondary.main, mb: 2 }}
      >
        Discover, Learn, and Experience NUS through our guided campus tours.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mb: 5,
          fontSize: "18px",
          lineHeight: 1.8,
          textAlign: "justify",
        }}
      >
        NUS is a world-renowned institution of higher learning, ranked among
        the top universities globally. Situated in the heart of Singapore, our
        campus is a vibrant hub of academic excellence, cutting-edge research,
        and cultural diversity. Our guided tours offer a unique opportunity to
        explore our iconic architecture, state-of-the-art facilities, and
        bustling student life. Whether you’re a prospective student, a visitor,
        or simply curious, join us to discover what makes NUS a beacon of
        inspiration and opportunity.
      </Typography>

      {/* Call-to-Action Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "#FFFFFF",
            px: 3,
            py: 1.5,
            fontSize: "18px",
            borderRadius: 0,
            boxShadow: "none",
            textTransform: "capitalize",
            width: { xs: "100%", sm: "300px" },
            height: "60px",
          }}
          href="/information"
        >
          Learn More About NUS
        </Button>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "#FF6600",
            color: "#FFFFFF",
            px: 3,
            py: 1.5,
            fontSize: "18px",
            borderRadius: 0,
            boxShadow: "none",
            textTransform: "capitalize",
            width: { xs: "100%", sm: "300px" },
            height: "60px",
          }}
          href="/booking"
        >
          Book a Campus Tour
        </Button>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: theme.palette.success.main,
            color: "#FFFFFF",
            px: 3,
            py: 1.5,
            fontSize: "18px",
            borderRadius: 0,
            boxShadow: "none",
            textTransform: "capitalize",
            width: { xs: "100%", sm: "300px" },
            height: "60px",
          }}
          href="/checkin"
        >
          Check In
        </Button>
      </Box>
    </Container>
  );
};
