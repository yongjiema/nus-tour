import React from "react";
import { Typography, Container, Box } from "@mui/material";

export const AcademicPrograms: React.FC = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom style={{ color: "#002147", fontWeight: "bold" }}>
        Academic Programs
      </Typography>
      <Typography variant="body1" gutterBottom style={{ color: "#FF6600", marginBottom: "20px" }}>
        Explore a wide variety of faculties and academic programs offered by NUS.
      </Typography>
      <Box>
        <Typography variant="body2" color="textSecondary">
          At NUS, we offer a wide range of programs across various faculties, catering to diverse interests and
          aspirations. Whether you're interested in engineering, medicine, business, or the arts, there's something for
          everyone.
        </Typography>
      </Box>
    </Container>
  );
};
