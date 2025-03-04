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
  PushPin as PinIcon
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

// 定义通知或事件项的接口
interface InfoItem {
  id: string;
  text: string;
  isPinned: boolean;
  date: string;
}

// 解析字符串格式的通知和事件
const parseItems = (input: string): InfoItem[] => {
  if (!input) return [];
  
  try {
    if (input.includes(':::')) {
      // 新格式: "id1:::text1:::isPinned1:::date1|||id2:::text2:::isPinned2:::date2"
      return input.split('|||').map(item => {
        const [id, text, isPinned, date] = item.split(':::');
        return {
          id: id || `item-${Math.random().toString(36).substr(2, 9)}`,
          text: text || '',
          isPinned: isPinned === 'true',
          date: date || new Date().toISOString()
        };
      }).filter(item => item.text.trim() !== '');
    } else {
      // 向后兼容旧格式（单个文本，用|||分隔）
      return input.split('|||')
        .filter(text => text.trim() !== '')
        .map(text => ({
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          text,
          isPinned: false,
          date: new Date().toISOString()
        }));
    }
  } catch (error) {
    console.error('Error parsing items:', error);
    // 如果解析失败，作为一个单独的项目返回
    return [{
      id: `item-${Math.random().toString(36).substr(2, 9)}`,
      text: input,
      isPinned: false,
      date: new Date().toISOString()
    }];
  }
};

export const TourInfoDetails: React.FC<TourInfoDetailsProps> = ({ info }) => {
  // 解析通知和事件
  const noticeItems = parseItems(info.latestNotice);
  const eventItems = parseItems(info.latestNewsEvent);
  
  // 排序处理：置顶项在前，然后按日期排序
  const sortItems = (items: InfoItem[]) => {
    return [...items].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };
  
  const sortedNotices = sortItems(noticeItems);
  const sortedEvents = sortItems(eventItems);

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return '(Unknown date)';
    }
  };

  // 将指南和重要信息拆分为项目列表
  const guidelinesList = info.guidelines
    ? info.guidelines.split("\n").filter((line) => line.trim() !== "")
    : [];
  const importantInfoList = info.importantInformation
    ? info.importantInformation.split("\n").filter((line) => line.trim() !== "")
    : [];

  return (
    <Box>
      {/* 主要信息部分 */}
      <Box mb={4}>
        <Typography variant="body1" paragraph>
          {info.tourInformation}
        </Typography>
      </Box>

      {/* 通知部分 */}
      {sortedNotices.length > 0 && (
        <Box mb={5}>
          <Box display="flex" alignItems="center" mb={2}>
            <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              Notices
            </Typography>
          </Box>
          
          {sortedNotices.map((notice, index) => (
            <Accordion 
              key={notice.id} 
              sx={{ 
                mb: 1, 
                "&:before": { display: "none" },
                borderLeft: notice.isPinned ? '4px solid #FF6600' : 'none'
              }}
              defaultExpanded={index === 0}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`notice-${index}-content`}
                id={`notice-${index}-header`}
                sx={{ 
                  backgroundColor: "rgba(0, 32, 96, 0.04)",
                }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  {notice.isPinned && (
                    <PinIcon sx={{ mr: 1, color: '#FF6600' }} fontSize="small" />
                  )}
                  <Typography fontWeight={notice.isPinned ? "bold" : "medium"}>
                    Notice {index + 1}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 'auto', opacity: 0.7 }}>
                    {formatDate(notice.date)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{notice.text}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* 事件部分 */}
      {sortedEvents.length > 0 && (
        <Box mb={5}>
          <Box display="flex" alignItems="center" mb={2}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              Events & News
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {sortedEvents.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: event.isPinned ? '2px solid #FF6600' : 'none',
                    boxShadow: event.isPinned ? '0 4px 8px rgba(255, 102, 0, 0.2)' : undefined
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {event.isPinned && <PinIcon sx={{ mr: 1, color: '#FF6600' }} fontSize="small" />}
                      <Typography variant="h6" gutterBottom fontWeight={event.isPinned ? "bold" : "medium"}>
                        Event {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      {event.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.date)}
                    </Typography>
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
          Last Updated: {info.updatedAt ? new Date(info.updatedAt).toLocaleString() : 'Unknown'}
        </Typography>
      </Box>
    </Box>
  );
}; 