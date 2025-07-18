import React from "react";
import { Typography, Container, Box } from "@mui/material";
import { getThemeColor } from "../../theme/constants";
import { useTheme } from "@mui/material/styles";

export const AcademicPrograms: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom style={{ color: getThemeColor(theme, "NUS_BLUE"), fontWeight: "bold" }}>
        Academic Programs
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        style={{ color: getThemeColor(theme, "NUS_ORANGE"), marginBottom: "20px" }}
      >
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
