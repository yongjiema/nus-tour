import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Info as InfoIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  FormatListBulleted as ListIcon,
  Update as UpdateIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

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

interface TourInfoDetailsProps {
  info: TourInformation;
}

export const TourInfoDetails: React.FC<TourInfoDetailsProps> = ({ info }) => {
  // 将指南和重要信息拆分为项目列表
  const guidelinesList = info.guidelines
    ? info.guidelines.split("\n").filter((line) => line.trim() !== "")
    : [];
  const importantInfoList = info.importantInformation
    ? info.importantInformation.split("\n").filter((line) => line.trim() !== "")
    : [];

  // 分割多条通知和事件（使用 ||| 作为分隔符）
  const noticesList = info.latestNotice
    ? info.latestNotice.split("|||").map(notice => notice.trim()).filter(notice => notice)
    : [];
  const eventsList = info.latestNewsEvent
    ? info.latestNewsEvent.split("|||").map(event => event.trim()).filter(event => event)
    : [];

  // 格式化更新日期
  const lastUpdated = new Date(info.updatedAt || info.dateOfModify);
  const formattedDate = lastUpdated.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box>
      {/* 主要信息部分 */}
      <Box mb={4}>
        <Typography variant="body1" paragraph>
          {info.tourInformation}
        </Typography>
      </Box>

      {/* 通知部分 */}
      {noticesList.length > 0 && (
        <Box mb={5}>
          <Box display="flex" alignItems="center" mb={2}>
            <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              Notices
            </Typography>
          </Box>
          
          {noticesList.map((notice, index) => (
            <Accordion 
              key={`notice-${index}`} 
              sx={{ mb: 1, "&:before": { display: "none" } }}
              defaultExpanded={index === 0}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`notice-${index}-content`}
                id={`notice-${index}-header`}
                sx={{ 
                  backgroundColor: "rgba(0, 32, 96, 0.04)",
                  borderLeft: "4px solid #002060", 
                }}
              >
                <Typography fontWeight="medium">
                  Notice {index + 1}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{notice}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* 事件部分 */}
      {eventsList.length > 0 && (
        <Box mb={5}>
          <Box display="flex" alignItems="center" mb={2}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              Events
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {eventsList.map((event, index) => (
              <Grid item xs={12} md={6} key={`event-${index}`}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1.5}>
                      <EventIcon color="secondary" sx={{ mr: 1, fontSize: "1.1rem" }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Event {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{event}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 联系信息 */}
      <Box 
        component={Paper} 
        variant="outlined" 
        sx={{ p: 3, mb: 4, bgcolor: "background.default" }}
      >
        <Typography variant="h5" gutterBottom sx={{ color: "primary.main" }}>
          Contact Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {info.contactPhoneNumber && (
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemIcon>
                <PhoneIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Phone" 
                secondary={info.contactPhoneNumber} 
                primaryTypographyProps={{ variant: "subtitle2" }}
              />
            </ListItem>
          )}

          {info.contactEmail && (
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemIcon>
                <EmailIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary={info.contactEmail} 
                primaryTypographyProps={{ variant: "subtitle2" }}
              />
            </ListItem>
          )}

          {info.address && (
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemIcon>
                <LocationIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Address" 
                secondary={info.address} 
                primaryTypographyProps={{ variant: "subtitle2" }}
              />
            </ListItem>
          )}
        </List>
      </Box>

      {/* 重要信息 */}
      {importantInfoList.length > 0 && (
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <InfoIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              Important Information
            </Typography>
          </Box>
          <Card variant="outlined">
            <CardContent>
              <List>
                {importantInfoList.map((item, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InfoIcon color="secondary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 参观指南 */}
      {guidelinesList.length > 0 && (
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <ListIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              Guidelines for Visiting
            </Typography>
          </Box>
          <Card variant="outlined">
            <CardContent>
              <List>
                {guidelinesList.map((item, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ListIcon color="secondary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 最后更新时间 */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="flex-end" 
        mt={3}
        sx={{ color: "text.secondary", fontSize: "0.875rem" }}
      >
        <UpdateIcon fontSize="small" sx={{ mr: 0.5 }} />
        <Typography variant="caption">
          Last Updated: {formattedDate}
        </Typography>
      </Box>
    </Box>
  );
}; 