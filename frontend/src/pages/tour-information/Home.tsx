import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Backdrop,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from "@mui/material";
import { useList } from "@refinedev/core";
import { TourInfoDetails } from "../../components/tour/TourInfoDetails";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import SchoolIcon from "@mui/icons-material/School";

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
  dateOfCreate: Date;
  dateOfModify: Date;
}

export const TourInformationHome: React.FC = () => {
  const { data, isLoading, isError } = useList<TourInformation>({
    resource: "tourInformation",
  });
  const [showBackdrop, setShowBackdrop] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleBookingClick = () => {
    navigate("/booking");
  };

  useEffect(() => {
    // 当数据加载完成或发生错误时，关闭背景
    if (!isLoading || isError) {
      const timer = setTimeout(() => {
        setShowBackdrop(false);
      }, 500); // 添加轻微延迟，以确保平滑过渡

      return () => clearTimeout(timer);
    }
  }, [isLoading, isError]);

  // 处理加载状态
  if (isLoading) {
    return (
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  // 处理错误状态
  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Alert severity="error">
          Sorry, an error occurred while loading the tour information. Please try again later or contact the
          administrator.
        </Alert>
      </Container>
    );
  }

  // 处理数据为空的情况
  if (!data?.data || data.data.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Alert severity="info">There is currently no available tour information. Please check back later.</Alert>
      </Container>
    );
  }

  // 获取第一条旅游信息（通常只有一条记录）
  const tourInfo = data.data[0];

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 5 }, mb: 8 }}>
        {/* 页面标题部分 */}
        <Box
          sx={{
            position: "relative",
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            background: "linear-gradient(135deg, #012a5e 0%, #00408f 100%)",
            color: "white",
            boxShadow: "0 8px 32px rgba(0, 32, 71, 0.2)",
            overflow: "hidden",
          }}
        >
          {/* 背景装饰元素 */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -20,
              width: { xs: 150, md: 220 },
              height: { xs: 150, md: 220 },
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              zIndex: 0,
            }}
          />

          <Box position="relative" zIndex={1}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <SchoolIcon sx={{ fontSize: { xs: 32, md: 45 }, mr: 2 }} />
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "2rem", md: "3.25rem" },
                  mb: 0,
                  textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                }}
              >
                Campus Tour Information
              </Typography>
            </Box>

            <Typography
              variant="h5"
              align="center"
              sx={{
                fontSize: { xs: "1rem", md: "1.25rem" },
                opacity: 0.85,
                maxWidth: "80%",
                mx: "auto",
                mb: 4,
              }}
            >
              Learn how to visit the National University of Singapore campus
            </Typography>

            <Zoom in={true} timeout={1000} style={{ transitionDelay: "500ms" }}>
              <Box textAlign="center">
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<EventIcon />}
                  onClick={handleBookingClick}
                  sx={{
                    py: { xs: 1.2, md: 1.5 },
                    px: { xs: 3, md: 5 },
                    borderRadius: 10,
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    fontWeight: "bold",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    background: "linear-gradient(to right, #f0c14b, #e0a800)",
                    color: "#333",
                    "&:hover": {
                      background: "linear-gradient(to right, #e0a800, #d49600)",
                      boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                    },
                    textTransform: "none",
                  }}
                >
                  Book Campus Tour Now
                </Button>
              </Box>
            </Zoom>
          </Box>
        </Box>

        {/* 旅游信息内容部分 */}
        <Paper
          elevation={isMobile ? 1 : 3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
            boxShadow: isMobile ? 1 : "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <TourInfoDetails info={tourInfo} />
        </Paper>
      </Container>
    </Fade>
  );
};
