import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Badge,
  Button,
  Divider,
  Skeleton,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event,
  Person,
  SportsSoccer,
  Chat,
  EmojiEvents,
  Delete,
  DoneAll,
  MarkChatRead,
} from '@mui/icons-material';
import { useNotificationsStore } from '../store/notifications.store';
import notificationsApi from '../api/notifications.api';
import type { Notification, NotificationType } from '../types/notifications.types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  MATCH_INVITE: <Event />,
  MATCH_JOINED: <Person />,
  MATCH_CANCELLED: <Event />,
  MATCH_STARTED: <SportsSoccer />,
  MATCH_FINISHED: <EmojiEvents />,
  REVIEW_RECEIVED: <EmojiEvents />,
  NEW_MESSAGE: <Chat />,
  CONTACT_REQUEST: <Person />,
  CONTACT_ACCEPTED: <Person />,
  SYSTEM: <NotificationsIcon />,
};

const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  MATCH_INVITE: 'Приглашение в матч',
  MATCH_JOINED: 'Новый участник',
  MATCH_CANCELLED: 'Матч отменён',
  MATCH_STARTED: 'Матч начался',
  MATCH_FINISHED: 'Матч завершён',
  REVIEW_RECEIVED: 'Новый отзыв',
  NEW_MESSAGE: 'Новое сообщение',
  CONTACT_REQUEST: 'Запрос в контакты',
  CONTACT_ACCEPTED: 'Контакт принят',
  SYSTEM: 'Системное',
};

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Polling для новых уведомлений (каждые 30 секунд)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    fetchUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    fetchUnreadCount();
    if (filter === 'unread') {
      fetchNotifications();
    }
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    fetchUnreadCount();
  };

  const handleDeleteAll = async () => {
    await notificationsApi.deleteAllNotifications();
    fetchNotifications();
    fetchUnreadCount();
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter((n) => n.status !== 'READ');
    }
    return notifications;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Только что';
    } else if (minutes < 60) {
      return `${minutes} мин. назад`;
    } else if (hours < 24) {
      return `${hours} ч. назад`;
    } else if (days < 7) {
      return `${days} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getMessagePreview = (notification: Notification) => {
    return notification.message;
  };

  if (isLoading && notifications.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Заголовок */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon sx={{ fontSize: 40 }} />
            <div>
              <Typography variant="h4" component="h1">
                Уведомления
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount > 0 ? (
                  <Badge badgeContent={unreadCount} color="error">
                    {unreadCount} непрочитанных
                  </Badge>
                ) : (
                  'Нет непрочитанных'
                )}
              </Typography>
            </div>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="Все"
              onClick={() => setFilter('all')}
              color={filter === 'all' ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="Непрочитанные"
              onClick={() => setFilter('unread')}
              color={filter === 'unread' ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>

        {/* Кнопки действий */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<MarkChatRead />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Отметить все как прочитанные
            </Button>

            <Button
              startIcon={<Delete />}
              onClick={handleDeleteAll}
              color="error"
              disabled={notifications.length === 0}
            >
              Удалить все
            </Button>
          </Box>
        </Paper>

        {/* Список уведомлений */}
        <Paper>
          <List sx={{ p: 0 }}>
            {getFilteredNotifications().length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {filter === 'unread' ? 'Нет непрочитанных уведомлений' : 'Нет уведомлений'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Когда у вас появятся новые уведомления, они появятся здесь
                </Typography>
              </Box>
            ) : (
              getFilteredNotifications().map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      bgcolor: notification.status !== 'READ' ? 'action.hover' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={notification.status !== 'READ' ? 'success' : 'default'}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {NOTIFICATION_ICONS[notification.type]}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {NOTIFICATION_LABELS[notification.type]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {getMessagePreview(notification)}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {notification.status !== 'READ' && (
                              <Button
                                size="small"
                                startIcon={<DoneAll />}
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Прочитать
                              </Button>
                            )}

                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(notification.id)}
                                sx={{ ml: 'auto' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < getFilteredNotifications().length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotificationsPage;
