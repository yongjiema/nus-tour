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
import axios from "axios";
import { defineConfig } from "../../config/defineConfig";

const config = defineConfig();

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
  const [informationData, setInformationData] = useState<Information[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [imagePaths, setImagePaths] = useState<ImageState>({});
  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("正在从API获取数据...");
        const response = await axios.get(`${config.apiBaseUrl}/information`);
        console.log("API响应:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setInformationData(response.data);
          setIsError(false);
        } else {
          console.error("API返回的数据格式不正确:", response.data);
          setIsError(true);
        }
      } catch (error) {
        console.error("获取数据失败:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (informationData.length > 0) {
        // 初始化所有图片的加载状态
        const loadingState: {[key: number]: boolean} = {};
        informationData.forEach(info => {
          loadingState[info.id] = true;
        });
        setImageLoading(loadingState);

        // 预加载所有图片
        const imagePaths = await preloadImages(informationData.map(info => info.image));
        const newImagePaths: ImageState = {};
        
        // 处理每个图片的加载
        for (const info of informationData) {
          try {
            const path = await getAssetPath(info.image);
            newImagePaths[info.id] = path;
            setImageLoading(prev => ({
              ...prev,
              [info.id]: false
            }));
          } catch (error) {
            console.error(`Error loading image for ${info.title}:`, error);
            newImagePaths[info.id] = 'https://via.placeholder.com/400x300?text=No+Image';
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
  }, [informationData]);

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
        {informationData.map((info) => (
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