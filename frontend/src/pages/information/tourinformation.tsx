import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
} from "@mui/material";
import axios from 'axios';

interface TourInformation {
  id: number;
  tourInformation: string;
  latestNotice: string;
  latestNewsEvent: string;
  contactPhoneNumber: string;
  contactEmail: string;
  address: string;
  guidelines: string;
  importantInformation: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TourInformationPage: React.FC = () => {
  const [tourInformationData, setTourInformationData] = useState<TourInformation[]>([]);

  useEffect(() => {
    const fetchTourInformation = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tourinformation');
        setTourInformationData(response.data);
      } catch (error) {
        console.error('Error fetching tour information:', error);
      }
    };

    fetchTourInformation();
  }, []);

  return (
    <Container maxWidth="lg" style={{ marginTop: "50px" }}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        style={{ color: "#002147", fontWeight: "bold" }}
      >
        Tour Information
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        align="center"
        gutterBottom
        style={{ color: "#FF6600" }}
      >
        Find the latest tour information, notices, news/events, and contact details.
      </Typography>
      <Grid container spacing={4} style={{ marginTop: "30px" }}>
        {tourInformationData.map((info) => (
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
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ color: "#002147", fontWeight: "bold" }}
                >
                  {info.tourInformation}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Latest Notice:</strong> {info.latestNotice}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Latest News/Event:</strong> {info.latestNewsEvent}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Contact Phone Number:</strong> {info.contactPhoneNumber}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Contact Email:</strong> {info.contactEmail}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Address:</strong> {info.address}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Guidelines:</strong> {info.guidelines}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Important Information:</strong> {info.importantInformation}
                </Typography>
                <Box marginTop={2}>
                  <Button
                    variant="contained"
                    size="small"
                    href={`mailto:${info.contactEmail}`}
                    style={{ backgroundColor: "#FF6600", color: "#FFFFFF" }}
                  >
                    Contact
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