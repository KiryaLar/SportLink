import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Skeleton,
  Tabs,
  Tab,
  Chip,
  Paper,
  IconButton,
  Divider,
} from '@mui/material'
import {
  Notifications as NotifIcon,
  SportsSoccer as MatchIcon,
  RateReview as ReviewIcon,
  Chat as ChatIcon,
  PersonAdd as ContactIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  getUnreadNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from '../api/notifications.api'
import { notificationWS } from '../lib/websocket'
import { getTokens } from '../api/client'
import { NotificationResponse, NotificationType } from '../types'
import EmptyState from '../components/common/EmptyState'

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  MATCH_INVITE: <MatchIcon />,
  MATCH_JOINED: <MatchIcon />,
  MATCH_CANCELLED: <MatchIcon />,
  MATCH_STARTED: <MatchIcon />,
  MATCH_FINISHED: <MatchIcon />,
  REVIEW_RECEIVED: <ReviewIcon />,
  NEW_MESSAGE: <ChatIcon />,
  CONTACT_REQUEST: <ContactIcon />,
  CONTACT_ACCEPTED: <ContactIcon />,
  SYSTEM: <InfoIcon />,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  MATCH_INVITE: '#4361EE',
  MATCH_JOINED: '#22C55E',
  MATCH_CANCELLED: '#EF4444',
  MATCH_STARTED: '#F59E0B',
  MATCH_FINISHED: '#64748B',
  REVIEW_RECEIVED: '#F59E0B',
  NEW_MESSAGE: '#38BDF8',
  CONTACT_REQUEST: '#9333EA',
  CONTACT_ACCEPTED: '#22C55E',
  SYSTEM: '#64748B',
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const { data: allNotifs, isLoading: allLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => getNotifications({ page: 0, size: 100 }),
    enabled: tab === 'all',
  })

  const { data: unreadNotifs, isLoading: unreadLoading } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => getUnreadNotifications({ page: 0, size: 100 }),
    enabled: tab === 'unread',
  })

  const notifications = tab === 'all' ? (allNotifs ?? []) : (unreadNotifs ?? [])
  const isLoading = tab === 'all' ? allLoading : unreadLoading

  // WebSocket for real-time notifications
  useEffect(() => {
    const tokens = getTokens()
    if (!tokens?.accessToken) return

    notificationWS.connect(tokens.accessToken).then(() => {
      return notificationWS.subscribe((notif) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        toast(`${notif.title}: ${notif.message}`, { icon: '🔔' })
      })
    }).catch(() => {})

    return () => {
      notificationWS.disconnect()
    }
  }, [])

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      toast.success('Все уведомления прочитаны')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => toast.error('Ошибка'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => toast.error('Не удалось удалить'),
  })

  const handleNotificationClick = (notif: NotificationResponse) => {
    if (notif.status !== 'READ') {
      markReadMutation.mutate(notif.id)
    }
    if (notif.entityId && notif.entityType) {
      switch (notif.entityType) {
        case 'MATCH':
          navigate(`/matches/${notif.entityId}`)
          break
        case 'PROFILE':
          navigate(`/profile/${notif.entityId}`)
          break
        case 'CHAT':
          navigate(`/chats`)
          break
      }
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { locale: ru, addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Уведомления
        </Typography>
        <Button
          startIcon={<DoneAllIcon />}
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending}
          size="small"
        >
          Прочитать все
        </Button>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 1 }}>
          <Tab value="all" label="Все" />
          <Tab
            value="unread"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Непрочитанные
                {(unreadNotifs?.length ?? 0) > 0 && (
                  <Chip
                    label={unreadNotifs?.length}
                    size="small"
                    color="error"
                    sx={{ height: 18, fontSize: '0.6875rem' }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Notifications list */}
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, mb: 1 }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Box sx={{ flex: 1 }}>
              <Skeleton height={18} width="60%" />
              <Skeleton height={14} width="80%" />
            </Box>
          </Box>
        ))
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<NotifIcon sx={{ fontSize: 40 }} />}
          title="Нет уведомлений"
          description="Здесь будут появляться уведомления о матчах, сообщениях и других событиях"
        />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <List disablePadding>
            {notifications.map((notif, index) => {
              const isUnread = notif.status !== 'READ'
              const icon = TYPE_ICONS[notif.type]
              const color = TYPE_COLORS[notif.type]

              return (
                <React.Fragment key={notif.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      bgcolor: isUnread ? 'rgba(67,97,238,0.04)' : 'transparent',
                      cursor: 'pointer',
                      pr: 6,
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => handleNotificationClick(notif)}
                    secondaryAction={
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMutation.mutate(notif.id)
                        }}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${color}18`,
                          color,
                          width: 44,
                          height: 44,
                        }}
                      >
                        {icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={isUnread ? 700 : 500}>
                            {notif.title}
                          </Typography>
                          {isUnread && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatTime(notif.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              )
            })}
          </List>
        </Paper>
      )}
    </Box>
  )
}
