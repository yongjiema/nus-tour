import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box, Skeleton } from "@mui/material";

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

interface InformationCardProps {
  info: Information;
  imagePath: string;
  isImageLoading: boolean;
  onLearnMore: (info: Information) => void;
}

export const InformationCard: React.FC<InformationCardProps> = ({ info, imagePath, isImageLoading, onLearnMore }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      {isImageLoading ? (
        <Skeleton variant="rectangular" height={200} animation="wave" sx={{ bgcolor: "grey.200" }} />
      ) : (
        <CardMedia
          component="img"
          height="200"
          image={imagePath || "/assets/images/default.jpg"}
          alt={info.title}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom style={{ color: "#002147", fontWeight: "bold" }}>
          {info.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {info.description}
        </Typography>
        <Box marginTop={2}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onLearnMore(info)}
            style={{ backgroundColor: "#FF6600", color: "#FFFFFF" }}
          >
            了解更多
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
