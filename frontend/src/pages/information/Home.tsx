import React from "react";
import { Box, Typography, Card, CardContent, Button, Container, CardMedia, Grid2 as Grid } from "@mui/material";
import { getThemeColor, getCardShadow } from "../../theme/constants";
import { useTheme } from "@mui/material/styles";

import academicProgramsImage from "../../assets/images/academics.jpg";
import busRoutesImage from "../../assets/images/bus-routes.jpg";
import canteensImage from "../../assets/images/canteens.jpg";
import convenienceStoresImage from "../../assets/images/convenience-stores.jpg";
import parkingImage from "../../assets/images/parking.jpg";
import nusNewsImage from "../../assets/images/news.jpg";

const informationData = [
  {
    title: "Academic Programs",
    description: "Explore a wide variety of faculties and academic programs at NUS.",
    image: academicProgramsImage,
    link: "https://www.nus.edu.sg/nusbulletin/ay202223/programmes/",
  },
  {
    title: "Campus Bus Routes",
    description: "Navigate the campus with ease using our efficient bus system.",
    image: busRoutesImage,
    link: "https://uci.nus.edu.sg/oca/mobilityservices/getting-around-nus/",
  },
  {
    title: "Nearby Canteens",
    description: "Enjoy a variety of food options at our campus canteens.",
    image: canteensImage,
    link: "https://uci.nus.edu.sg/oca/retail-dining/food-and-beverages/",
  },
  {
    title: "Convenience Stores",
    description: "Access essential items at our on-campus convenience stores.",
    image: convenienceStoresImage,
    link: "https://uci.nus.edu.sg/oca/retail-dining/retail/",
  },

  {
    title: "Parking Information",
    description: "Learn more about parking facilities and rates on campus.",
    image: parkingImage,
    link: "https://uci.nus.edu.sg/oca/mobilityservices/parking-information/",
  },
  {
    title: "NUS news",
    description: "Stay updated with the latest news and events happening at NUS.",
    image: nusNewsImage,
    link: "https://news.nus.edu.sg/",
  },
];

export const InformationPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" style={{ marginTop: "50px" }}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        style={{ color: getThemeColor(theme, "NUS_BLUE"), fontWeight: "bold" }}
      >
        Campus Information
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        align="center"
        gutterBottom
        style={{ color: getThemeColor(theme, "NUS_ORANGE") }}
      >
        Learn more about what NUS has to offer, from academic programs to essential campus facilities.
      </Typography>
      <Grid container spacing={4} style={{ marginTop: "30px" }}>
        {informationData.map((info, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: getCardShadow(theme),
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
            >
              <CardMedia component="img" height="140" image={info.image} alt={info.title} />
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ color: getThemeColor(theme, "NUS_BLUE"), fontWeight: "bold" }}
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
                    target="_blank" // Opens link in a new tab
                    rel="noopener noreferrer" // Improves security
                    style={{ backgroundColor: getThemeColor(theme, "NUS_ORANGE"), color: theme.palette.common.white }}
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
