import React from "react";
import { Box, Typography, Container, CardMedia } from "@mui/material";
import { styled } from "@mui/material/styles";
import NUSPhoto from "../../assets/images/nus-campus.jpg";

// Styled components for consistent UI
const PageTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: "bold",
  marginBottom: theme.spacing(1),
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  marginBottom: theme.spacing(2),
}));

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

const ActionButton = styled("a")(({ theme, color = "primary" }) => {
  const getColor = () => {
    switch (color) {
      case "orange":
        return "#FF6600";
      case "green":
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return {
    backgroundColor: getColor(),
    color: "#FFFFFF",
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
    "&:hover": {
      backgroundColor:
        color === "orange" ? "#E05A00" : color === "green" ? theme.palette.success.dark : theme.palette.primary.dark,
      textDecoration: "none",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  };
});

export const Home: React.FC = () => {
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

      <Subtitle variant="h6" gutterBottom>
        Discover, Learn, and Experience NUS through our guided campus tours.
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
        <ActionButton href="/information" color="primary">
          Learn More About NUS
        </ActionButton>

        <ActionButton href="/register" color="orange">
          Book a Campus Tour
        </ActionButton>

        <ActionButton href="/checkin" color="green">
          Check In
        </ActionButton>
      </ButtonContainer>
    </Container>
  );
};
