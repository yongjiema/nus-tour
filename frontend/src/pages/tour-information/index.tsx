import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  LocationOn as LocationOnIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const TourInformation: React.FC = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/booking");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* 标题部分 */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            color: "#002147",
            fontWeight: "bold",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
          }}
        >
          NUS Campus Tour
        </Typography>
        <Typography
          variant="h5"
          color="textSecondary"
          sx={{ mb: 4, color: "#FF6600" }}
        >
          探索新加坡国立大学的魅力之旅
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Grid container spacing={4}>
        {/* 左侧信息 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "#002147" }}>
              游览概览
            </Typography>
            <Typography paragraph>
              新加坡国立大学校园游览为您提供独特的机会，深入了解我们世界一流的教育设施和丰富的校园文化。
              在专业导游的带领下，您将参观标志性建筑、了解学校历史，体验NUS的学术氛围。
            </Typography>
          </Paper>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#002147" }}>
                游览亮点
              </Typography>
              <List>
                {[
                  "参观标志性的大学城和教学楼",
                  "了解NUS的悠久历史和发展历程",
                  "体验现代化的学习设施",
                  "探索学生活动中心和休闲场所",
                  "与在校学生交流互动的机会",
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: "#FF6600" }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 右侧信息卡片 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: "sticky", top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#002147" }}>
                游览详情
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="时长"
                    secondary="约2小时"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="团体规模"
                    secondary="最多15人/团"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="集合地点"
                    secondary="NUS访客中心"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="语言"
                    secondary="英语/中文"
                  />
                </ListItem>
              </List>
              <Box mt={3}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleBookNow}
                  sx={{
                    backgroundColor: "#FF6600",
                    "&:hover": {
                      backgroundColor: "#cc5200",
                    },
                  }}
                >
                  立即预订
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 注意事项 */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "#002147" }}>
          温馨提示
        </Typography>
        <Typography component="div">
          <List>
            {[
              "请提前15分钟到达集合地点",
              "建议穿着舒适的步行鞋",
              "游览期间请遵守校园规章制度",
              "请携带饮用水和防晒用品",
              "如遇恶劣天气，游览可能会调整或取消",
            ].map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <InfoIcon sx={{ color: "#FF6600" }} />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Typography>
      </Paper>
    </Container>
  );
}; 