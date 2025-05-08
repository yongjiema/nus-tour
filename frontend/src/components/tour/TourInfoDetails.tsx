import React, { useEffect, useState } from "react";
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
  Button,
} from "@mui/material";
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
  PushPin as PinIcon,
  ArrowForward as ArrowForwardIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";

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

interface NewsEvent {
  id: number;
  type: string;
  date: string;
  headline: string;
  link: string;
  createdAt: string;
  updatedAt: string;
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
    if (input.includes(":::")) {
      // 新格式: "id1:::text1:::isPinned1:::date1|||id2:::text2:::isPinned2:::date2"
      return input
        .split("|||")
        .map((item) => {
          const [id, text, isPinned, date] = item.split(":::");
          return {
            id: id || `item-${Math.random().toString(36).substr(2, 9)}`,
            text: text || "",
            isPinned: isPinned === "true",
            date: date || new Date().toISOString(),
          };
        })
        .filter((item) => item.text.trim() !== "");
    } else {
      // 向后兼容旧格式（单个文本，用|||分隔）
      return input
        .split("|||")
        .filter((text) => text.trim() !== "")
        .map((text) => ({
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          text,
          isPinned: false,
          date: new Date().toISOString(),
        }));
    }
  } catch (error) {
    console.error("Error parsing items:", error);
    // 如果解析失败，作为一个单独的项目返回
    return [
      {
        id: `item-${Math.random().toString(36).substr(2, 9)}`,
        text: input,
        isPinned: false,
        date: new Date().toISOString(),
      },
    ];
  }
};

export const TourInfoDetails: React.FC<TourInfoDetailsProps> = ({ info }) => {
  // 状态变量来存储从API获取的新闻和事件
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取新闻和事件数据
  useEffect(() => {
    const fetchNewsAndEvents = async () => {
      try {
        setLoading(true);

        // 添加延迟以确保API服务器已启动（仅用于开发）
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 添加时间戳防止浏览器缓存
        const timestamp = new Date().getTime();

        // 使用最新的端口
        const apiBaseUrl = "http://localhost:3456";

        console.log("正在请求API:", `${apiBaseUrl}/api/news-events/news?t=${timestamp}`);

        const [newsResponse, eventsResponse] = await Promise.all([
          axios.get<NewsEvent[]>(`${apiBaseUrl}/api/news-events/news?t=${timestamp}`),
          axios.get<NewsEvent[]>(`${apiBaseUrl}/api/news-events/events?t=${timestamp}`),
        ]);

        console.log("获取的新闻数据:", newsResponse.data);
        console.log("获取的活动数据:", eventsResponse.data);

        if (newsResponse.data.length > 0) {
          setNews(newsResponse.data);
        } else {
          console.log("使用备用新闻数据");
          // 如果API返回空数据，使用备用数据
          setNews([
            {
              id: 1,
              type: "news",
              date: new Date().toISOString(),
              headline: "模拟新闻：NUS迎接2025新学年",
              link: "https://news.nus.edu.sg/",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              type: "news",
              date: new Date().toISOString(),
              headline: "模拟新闻：NUS在全球大学排名中位居前列",
              link: "https://news.nus.edu.sg/",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        }

        if (eventsResponse.data.length > 0) {
          setEvents(eventsResponse.data);
        } else {
          console.log("使用备用活动数据");
          // 如果API返回空数据，使用备用数据
          setEvents([
            {
              id: 3,
              type: "event",
              date: new Date().toISOString(),
              headline: "模拟活动：NUS艺术节2025",
              link: "https://osa.nus.edu.sg/events/",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 4,
              type: "event",
              date: new Date().toISOString(),
              headline: "模拟活动：2025毕业典礼",
              link: "https://osa.nus.edu.sg/events/",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching news and events:", error);
        console.log("使用备用数据");

        // 在API请求失败时使用备用数据
        setNews([
          {
            id: 1,
            type: "news",
            date: new Date().toISOString(),
            headline: "模拟新闻：NUS迎接2025新学年",
            link: "https://news.nus.edu.sg/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            type: "news",
            date: new Date().toISOString(),
            headline: "模拟新闻：NUS在全球大学排名中位居前列",
            link: "https://news.nus.edu.sg/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);

        setEvents([
          {
            id: 3,
            type: "event",
            date: new Date().toISOString(),
            headline: "模拟活动：NUS艺术节2025",
            link: "https://osa.nus.edu.sg/events/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 4,
            type: "event",
            date: new Date().toISOString(),
            headline: "模拟活动：2025毕业典礼",
            link: "https://osa.nus.edu.sg/events/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsAndEvents();
  }, []);

  // 向后兼容：如果API请求失败，则使用旧的格式化数据
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

  // 显示数据源选择
  const displayNews =
    news.length > 0
      ? news
      : [
          {
            id: 1,
            type: "news",
            date: new Date().toISOString(),
            headline: "模拟新闻：NUS迎接2025新学年",
            link: "https://news.nus.edu.sg/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            type: "news",
            date: new Date().toISOString(),
            headline: "模拟新闻：NUS在全球大学排名中位居前列",
            link: "https://news.nus.edu.sg/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

  const displayEvents =
    events.length > 0
      ? events
      : [
          {
            id: 3,
            type: "event",
            date: new Date().toISOString(),
            headline: "模拟活动：NUS艺术节2025",
            link: "https://osa.nus.edu.sg/events/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 4,
            type: "event",
            date: new Date().toISOString(),
            headline: "模拟活动：2025毕业典礼",
            link: "https://osa.nus.edu.sg/events/",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

  // 限制显示的通知和事件数量
  const limitedNotices = displayNews.slice(0, 5);
  const limitedEvents = displayEvents.slice(0, 5);

  // 是否显示"查看更多"链接
  const hasMoreNotices = news.length > 5;
  const hasMoreEvents = events.length > 5;

  // 添加一个状态，用于跟踪每个通知的展开状态
  const [expandedNotices, setExpandedNotices] = React.useState<string[]>([]);
  const [noticeExpanded, setNoticeExpanded] = React.useState(true);
  const [eventExpanded, setEventExpanded] = React.useState(true);

  // 切换通知的展开状态
  const handleToggleNotice = (noticeId: string) => {
    setExpandedNotices((prev) =>
      prev.includes(noticeId) ? prev.filter((id) => id !== noticeId) : [...prev, noticeId],
    );
  };

  // 切换通知面板的展开状态
  const handleToggleNoticePanel = () => {
    setNoticeExpanded(!noticeExpanded);
  };

  // 切换事件面板的展开状态
  const handleToggleEventPanel = () => {
    setEventExpanded(!eventExpanded);
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "(Unknown date)";
    }
  };

  // 将指南和重要信息拆分为项目列表
  const guidelinesList = info.guidelines ? info.guidelines.split("\n").filter((line) => line.trim() !== "") : [];
  const importantInfoList = info.importantInformation
    ? info.importantInformation.split("\n").filter((line) => line.trim() !== "")
    : [];

  return (
    <Box>
      {/* 主要信息部分 */}
      <Box mb={5}>
        <Typography variant="h4" gutterBottom sx={{ color: "primary.main", fontWeight: "medium" }}>
          Tour Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" paragraph>
          {info.tourInformation}
        </Typography>
      </Box>

      {/* 通知部分 - 可折叠面板 */}
      <Box mb={5}>
        <Accordion
          expanded={noticeExpanded}
          onChange={handleToggleNoticePanel}
          sx={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: "8px !important",
            "&:before": { display: "none" },
            mb: 2,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "rgba(0, 32, 96, 0.04)" }}>
            <Box display="flex" alignItems="center" width="100%">
              <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" sx={{ color: "primary.main" }}>
                Latest News ({limitedNotices.length})
              </Typography>
              <Link
                component="a"
                href="https://news.nus.edu.sg/"
                target="_blank"
                sx={{
                  ml: "auto",
                  mr: 3,
                  display: "flex",
                  alignItems: "center",
                  color: "primary.main",
                  "&:hover": { textDecoration: "none" },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  阅读更多
                </Typography>
                <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Link>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" mb={2}>
              最新的校园新闻和公告
            </Typography>

            {loading ? (
              <Typography>正在加载新闻...</Typography>
            ) : limitedNotices.length > 0 ? (
              limitedNotices.map((item, index) => (
                <Accordion
                  key={item.id || index}
                  expanded={expandedNotices.includes(String(item.id))}
                  onChange={() => handleToggleNotice(String(item.id))}
                  sx={{
                    mb: 2,
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${item.id}-content`}
                    id={`panel-${item.id}-header`}
                    sx={{
                      backgroundColor: index === 0 ? "rgba(233, 30, 99, 0.08)" : "rgba(0, 32, 96, 0.02)",
                    }}
                  >
                    <Box display="flex" alignItems="center" width="100%">
                      {index === 0 && (
                        <PinIcon color="secondary" fontSize="small" sx={{ mr: 1, transform: "rotate(45deg)" }} />
                      )}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: index === 0 ? "medium" : "regular",
                          color: index === 0 ? "secondary.main" : "inherit",
                        }}
                      >
                        {item.headline}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", mr: 2 }}>
                        {formatDate(item.date)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {item.headline}
                    </Typography>
                    <Button
                      component="a"
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={<OpenInNewIcon />}
                      sx={{ mt: 1 }}
                    >
                      查看详情
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography color="text.secondary">暂无最新新闻</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* 事件部分 - 可折叠面板 */}
      <Box mb={5}>
        <Accordion
          expanded={eventExpanded}
          onChange={handleToggleEventPanel}
          sx={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: "8px !important",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "rgba(0, 32, 96, 0.04)" }}>
            <Box display="flex" alignItems="center" width="100%">
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" sx={{ color: "primary.main" }}>
                Campus Events ({limitedEvents.length})
              </Typography>
              <Link
                component="a"
                href="https://osa.nus.edu.sg/events/"
                target="_blank"
                sx={{
                  ml: "auto",
                  mr: 3,
                  display: "flex",
                  alignItems: "center",
                  color: "primary.main",
                  "&:hover": { textDecoration: "none" },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  阅读更多
                </Typography>
                <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Link>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" mb={2}>
              校园即将举行的活动和事件
            </Typography>

            {loading ? (
              <Typography>正在加载活动...</Typography>
            ) : (
              <Grid container spacing={2}>
                {limitedEvents.length > 0 ? (
                  limitedEvents.map((event, index) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id || index}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          border: index === 0 ? "2px solid" : "1px solid",
                          borderColor: index === 0 ? "secondary.main" : "divider",
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box display="flex" alignItems="flex-start" mb={1}>
                            {index === 0 && (
                              <PinIcon color="secondary" fontSize="small" sx={{ mr: 1, transform: "rotate(45deg)" }} />
                            )}
                            <Typography
                              variant="subtitle1"
                              gutterBottom
                              sx={{
                                fontWeight: index === 0 ? "medium" : "regular",
                                color: index === 0 ? "secondary.main" : "inherit",
                              }}
                            >
                              {event.headline}
                            </Typography>
                          </Box>
                          <Box mt={2} display="flex" flexDirection="column" gap={1}>
                            <Chip
                              icon={<UpdateIcon fontSize="small" />}
                              label={formatDate(event.date)}
                              size="small"
                              variant="outlined"
                            />
                            <Button
                              component="a"
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outlined"
                              size="small"
                              color="primary"
                              startIcon={<OpenInNewIcon />}
                              sx={{ mt: 1 }}
                            >
                              查看详情
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography color="text.secondary">暂无即将举行的活动</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* 联系信息 */}
      <Box component={Paper} variant="outlined" sx={{ p: 3, mb: 4, bgcolor: "background.default" }}>
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
      <Box display="flex" alignItems="center" justifyContent="flex-end" mt={3}>
        <UpdateIcon fontSize="small" color="action" sx={{ mr: 1, opacity: 0.6 }} />
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(info.updatedAt).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};
