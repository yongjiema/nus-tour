import React, { useEffect, useState } from "react";
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
import axios from 'axios';

interface Information {
  id: number;
  order: number;
  title: string;
  description: string;
  hyperlink: string;
  image: string;
  modifiedBy: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const InformationHome: React.FC = () => {
  const [informationData, setInformationData] = useState<Information[]>([]);

  useEffect(() => {
    const fetchInformation = async () => {
      try {
        const response = await axios.get('http://localhost:3000/information');
        setInformationData(response.data);
      } catch (error) {
        console.error('Error fetching information:', error);
      }
    };

    fetchInformation();
  }, []);

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
        Learn more about what NUS has to offer, from academic programs to
        essential campus facilities.
      </Typography>
      <Grid container spacing={4} style={{ marginTop: "30px" }}>
        {informationData.map((info) => (
          <Grid item xs={12} sm={6} md={4} key={info.id}>
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
                    href={info.hyperlink}
                    target="_blank" // Opens link in a new tab
                    rel="noopener noreferrer" // Improves security
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