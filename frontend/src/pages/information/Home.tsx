import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
} from "@mui/material";
import { useList } from "@refinedev/core";
import { getAssetPath, preloadImages } from "../../utils/assetUtils";
import { useNavigate } from "react-router-dom";
import { InformationCard } from "../../components/cards/InformationCard";

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

interface ImageState {
  [key: string]: string;
}

export const InformationHome: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useList<Information>({
    resource: "information",
  });
  const [imagePaths, setImagePaths] = useState<ImageState>({});
  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const loadImages = async () => {
      if (data?.data) {
        // 初始化所有图片的加载状态
        const loadingState: {[key: number]: boolean} = {};
        data.data.forEach(info => {
          loadingState[info.id] = true;
        });
        setImageLoading(loadingState);

        // 预加载所有图片
        const imagePaths = await preloadImages(data.data.map(info => info.image));
        const newImagePaths: ImageState = {};
        
        // 处理每个图片的加载
        for (const info of data.data) {
          try {
            const path = await getAssetPath(info.image);
            newImagePaths[info.id] = path;
            setImageLoading(prev => ({
              ...prev,
              [info.id]: false
            }));
          } catch (error) {
            console.error(`Error loading image for ${info.title}:`, error);
            newImagePaths[info.id] = '/assets/images/default.jpg';
            setImageLoading(prev => ({
              ...prev,
              [info.id]: false
            }));
          }
        }
        
        setImagePaths(newImagePaths);
      }
    };

    loadImages();
  }, [data]);

  const handleLearnMore = (info: Information) => {
    if (info.title.toLowerCase().includes('tour')) {
      navigate('/tour-information');
    } else {
      window.open(info.hyperlink, '_blank', 'noopener noreferrer');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Failed to load</div>;
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: "50px" }}>
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          style={{ color: "#002147", fontWeight: "bold" }}
        >
          Campus Information
        </Typography>
        <Typography variant="h5" color="textSecondary">
          Explore Different Aspects of National University of Singapore
        </Typography>
      </Box>

      <Grid container spacing={4} style={{ marginTop: "30px" }}>
        {data?.data.map((info) => (
          <Grid item xs={12} sm={6} md={4} key={info.id}>
            <InformationCard
              info={info}
              imagePath={imagePaths[info.id]}
              isImageLoading={imageLoading[info.id]}
              onLearnMore={handleLearnMore}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};