import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PushPin as PinIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useOne, useUpdate } from '@refinedev/core';

// 定义通知对象接口
interface Notice {
  id: string;
  text: string;
  isPinned: boolean;
  date: string;
}

// 定义事件对象接口
interface Event {
  id: string;
  text: string;
  isPinned: boolean;
  date: string;
}

// 定义旅游信息接口
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

// 将字符串解析为通知或事件数组，格式: "id1:::text1:::isPinned1:::date1|||id2:::text2:::isPinned2:::date2"
const parseItems = (input: string): Notice[] | Event[] => {
  if (!input) return [];
  
  return input.split('|||').map(item => {
    const [id, text, isPinned, date] = item.split(':::');
    return {
      id: id || String(Date.now()),
      text: text || '',
      isPinned: isPinned === 'true',
      date: date || new Date().toISOString()
    };
  });
};

// 将通知或事件数组转换为存储格式字符串
const stringifyItems = (items: Notice[] | Event[]): string => {
  return items.map(item => 
    `${item.id}:::${item.text}:::${item.isPinned}:::${item.date}`
  ).join('|||');
};

// 主组件
const TourInfoManagement: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [editItem, setEditItem] = useState<Notice | Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // 获取旅游信息数据
  const { data, isLoading, refetch } = useOne<TourInformation>({
    resource: 'tourInformation',
    id: 1, // 假设只有一条旅游信息记录，ID为1
  });

  // 更新旅游信息数据的hook
  const { mutate } = useUpdate();

  // 当数据加载时，解析通知和事件
  useEffect(() => {
    if (data?.data) {
      setNotices(parseItems(data.data.latestNotice) as Notice[]);
      setEvents(parseItems(data.data.latestNewsEvent) as Event[]);
    }
  }, [data]);

  // 处理选项卡变更
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 添加新的通知或事件
  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem = {
      id: String(Date.now()),
      text: newItemText,
      isPinned,
      date: new Date().toISOString(),
    };

    if (activeTab === 0) {
      // 添加通知
      const updatedNotices = [...notices, newItem as Notice];
      setNotices(updatedNotices);
      updateTourInfo({ latestNotice: stringifyItems(updatedNotices) });
    } else {
      // 添加事件
      const updatedEvents = [...events, newItem as Event];
      setEvents(updatedEvents);
      updateTourInfo({ latestNewsEvent: stringifyItems(updatedEvents) });
    }

    // 重置表单
    setNewItemText('');
    setIsPinned(false);
    showSnackbar('Item added successfully', 'success');
  };

  // 删除通知或事件
  const handleDeleteItem = (id: string) => {
    if (activeTab === 0) {
      // 删除通知
      const updatedNotices = notices.filter(notice => notice.id !== id);
      setNotices(updatedNotices);
      updateTourInfo({ latestNotice: stringifyItems(updatedNotices) });
    } else {
      // 删除事件
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
      updateTourInfo({ latestNewsEvent: stringifyItems(updatedEvents) });
    }
    showSnackbar('Item deleted', 'success');
  };

  // 打开编辑对话框
  const handleEditClick = (item: Notice | Event) => {
    setEditItem(item);
    setNewItemText(item.text);
    setIsPinned(item.isPinned);
    setDialogOpen(true);
    setIsEditing(true);
  };

  // 保存编辑后的通知或事件
  const handleSaveEdit = () => {
    if (!editItem || !newItemText.trim()) return;
    
    const updatedItem = {
      ...editItem,
      text: newItemText,
      isPinned,
    };

    if (activeTab === 0) {
      // 更新通知
      const updatedNotices = notices.map(notice => 
        notice.id === editItem.id ? updatedItem as Notice : notice
      );
      setNotices(updatedNotices);
      updateTourInfo({ latestNotice: stringifyItems(updatedNotices) });
    } else {
      // 更新事件
      const updatedEvents = events.map(event => 
        event.id === editItem.id ? updatedItem as Event : event
      );
      setEvents(updatedEvents);
      updateTourInfo({ latestNewsEvent: stringifyItems(updatedEvents) });
    }

    // 关闭对话框和重置表单
    setDialogOpen(false);
    setNewItemText('');
    setIsPinned(false);
    setEditItem(null);
    setIsEditing(false);
    showSnackbar('Item updated successfully', 'success');
  };

  // 切换置顶状态
  const handleTogglePin = (id: string) => {
    if (activeTab === 0) {
      // 更新通知的置顶状态
      const updatedNotices = notices.map(notice => 
        notice.id === id ? { ...notice, isPinned: !notice.isPinned } : notice
      );
      setNotices(updatedNotices);
      updateTourInfo({ latestNotice: stringifyItems(updatedNotices) });
    } else {
      // 更新事件的置顶状态
      const updatedEvents = events.map(event => 
        event.id === id ? { ...event, isPinned: !event.isPinned } : event
      );
      setEvents(updatedEvents);
      updateTourInfo({ latestNewsEvent: stringifyItems(updatedEvents) });
    }
    showSnackbar('Pin status updated', 'success');
  };

  // 更新旅游信息到后端
  const updateTourInfo = (data: Partial<TourInformation>) => {
    mutate(
      {
        resource: 'tourInformation',
        id: 1, // 假设ID为1
        values: data,
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          console.error('Error updating tour information:', error);
          showSnackbar('Failed to update. Please try again.', 'error');
        }
      }
    );
  };

  // 显示提示消息
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setDialogOpen(false);
    setNewItemText('');
    setIsPinned(false);
    setEditItem(null);
    setIsEditing(false);
  };

  // 获取当前活动的项目列表
  const getActiveItems = () => {
    return activeTab === 0 ? notices : events;
  };

  // 渲染排序后的项目列表（置顶项目在前）
  const renderSortedItems = () => {
    const items = getActiveItems();
    // 先显示置顶项，然后是非置顶项，两组内部按日期倒序排列
    return [...items]
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .map((item) => (
        <ListItem key={item.id} sx={{ borderLeft: item.isPinned ? '4px solid #1976d2' : 'none' }}>
          <ListItemText
            primary={item.text}
            secondary={`Added: ${new Date(item.date).toLocaleDateString()}`}
            primaryTypographyProps={{ 
              style: { 
                fontWeight: item.isPinned ? 'bold' : 'normal',
              } 
            }}
          />
          <ListItemSecondaryAction>
            <IconButton 
              edge="end" 
              aria-label="pin"
              onClick={() => handleTogglePin(item.id)}
              color={item.isPinned ? "primary" : "default"}
            >
              <PinIcon />
            </IconButton>
            <IconButton 
              edge="end" 
              aria-label="edit"
              onClick={() => handleEditClick(item)}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              edge="end" 
              aria-label="delete" 
              onClick={() => handleDeleteItem(item.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ));
  };

  if (isLoading) {
    return <Box p={3}>Loading...</Box>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Tour Information Management
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Notices" />
          <Tab label="Events" />
        </Tabs>
        
        {/* 添加新项目的表单 */}
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Add New {activeTab === 0 ? 'Notice' : 'Event'}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label={`${activeTab === 0 ? 'Notice' : 'Event'} Text`}
                multiline
                rows={3}
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    color="primary"
                  />
                }
                label="Pin to Top"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                disabled={!newItemText.trim()}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* 项目列表 */}
      <Paper>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {activeTab === 0 ? 'Notices' : 'Events'} List
          </Typography>
          <Divider />
          <List>
            {getActiveItems().length === 0 ? (
              <ListItem>
                <ListItemText primary={`No ${activeTab === 0 ? 'notices' : 'events'} yet.`} />
              </ListItem>
            ) : (
              renderSortedItems()
            )}
          </List>
        </Box>
      </Paper>
      
      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onClose={handleCancelEdit} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit {activeTab === 0 ? 'Notice' : 'Event'}
        </DialogTitle>
        <DialogContent>
          <Box py={1}>
            <TextField
              fullWidth
              label="Text"
              multiline
              rows={3}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              variant="outlined"
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  color="primary"
                />
              }
              label="Pin to Top"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            color="primary" 
            variant="contained"
            disabled={!newItemText.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 提示消息 */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TourInfoManagement; 