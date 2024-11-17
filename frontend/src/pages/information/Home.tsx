import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  CardMedia,
} from "@mui/material";

const informationData = [
  {
    title: "Academic Programs",
    description: "Explore a wide variety of faculties and academic programs at NUS.",
    image: "https://placehold.co/600x400?text=Academic+Programs",
    link: "/information/academic-programs",
  },
  {
    title: "Campus Bus Routes",
    description: "Navigate the campus with ease using our efficient bus system.",
    image: "https://placehold.co/600x400?text=Bus+Routes",
    link: "/information/bus-routes",
  },
  {
    title: "Nearby Canteens",
    description: "Enjoy a variety of food options at our campus canteens.",
    image: "https://placehold.co/600x400?text=Canteens",
    link: "/information/canteens",
  },
  {
    title: "Convenience Stores",
    description: "Access essential items at our on-campus convenience stores.",
    image: "https://placehold.co/600x400?text=Convenience+Stores",
    link: "/information/convenience-stores",
  },
];

export const InformationHome: React.FC = () => {
  return (
    <Container maxWidth="lg" style={{ marginTop: "50px" }}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        style={{ color: "#002147", fontWeight: "bold" }}
      >
        Campus Information
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        align="center"
        gutterBottom
        style={{ color: "#FF6600" }}
      >
        Learn more about what NUS has to offer, from academic programs to essential campus
        facilities.
      </Typography>
      <Grid container spacing={4} style={{ marginTop: "30px" }}>
        {informationData.map((info, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={info.image}
                alt={info.title}
              />
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ color: "#002147", fontWeight: "bold" }}
                >
                  {info.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {info.description}
                </Typography>
                <Box marginTop={2}>
                  <Button
                    variant="contained"
                    size="small"
                    href={info.link}
                    style={{ backgroundColor: "#FF6600", color: "#FFFFFF" }}
                  >
                    Learn More
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
