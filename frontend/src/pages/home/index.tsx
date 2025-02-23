import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import NUSPhoto from "../../assets/images/nus-campus.jpg";

export const Home: React.FC = () => {
  return (
    <Container maxWidth="lg" style={{ marginTop: "50px", textAlign: "center" }}>
      {/* Photo Section */}
      <Box style={{ marginBottom: "30px" }}>
        <img
          src={NUSPhoto}
          alt="NUS Campus"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        />
      </Box>

      {/* Introduction Section */}
      <Typography
        variant="h3"
        gutterBottom
        style={{ color: "#002147", fontWeight: "bold" }}
      >
        Welcome to NUS Tour
      </Typography>
      <Typography
        variant="h6"
        color="textSecondary"
        gutterBottom
        style={{ color: "#FF6600", marginBottom: "20px" }}
      >
        Discover, Learn, and Experience NUS through our guided campus tours.
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        style={{
          marginBottom: "40px",
          fontSize: "18px",
          lineHeight: "1.8",
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
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <Button
          variant="contained"
          style={{
            backgroundColor: "#002147",
            color: "#FFFFFF",
            padding: "10px 30px",
            fontSize: "18px",
            borderRadius: "0", // Make edges sharp
            boxShadow: "none",
            textTransform: "capitalize",
            width: "300px",
            height: "60px",
          }}
          href="/information"
        >
          Learn More About NUS
        </Button>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#FF6600",
            color: "#FFFFFF",
            padding: "10px 30px",
            fontSize: "18px",
            borderRadius: "0", // Make edges sharp
            boxShadow: "none",
            textTransform: "capitalize",
            width: "300px",
            height: "60px",
          }}
          href="/booking"
        >
          Book a Campus Tour
        </Button>
      </Box>
    </Container>
  );
};
