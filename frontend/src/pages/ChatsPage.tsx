import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  Paper,
  Skeleton,
} from '@mui/material'
import {
  Send as SendIcon,
  Chat as ChatIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { getChats, getMessages, sendMessage as sendMessageApi, markRead } from '../api/chats.api'
import { useAuthStore } from '../store/auth.store'
import { chatWS } from '../lib/websocket'
import { getTokens } from '../api/client'
import UserAvatar from '../components/common/UserAvatar'
import EmptyState from '../components/common/EmptyState'
import { ChatResponse, MessageResponse } from '../types'

function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Вчера'
  return format(date, 'd MMM', { locale: ru })
}

function formatMessageTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm')
}

export default function ChatsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [wsConnected, setWsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    refetchInterval: 30000,
  })

  const { data: initialMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedChatId],
    queryFn: () => getMessages(selectedChatId!, { page: 0, size: 50 }),
    enabled: !!selectedChatId,
    staleTime: 0,
  })

  useEffect(() => {
    if (initialMessages) {
      setMessages([...initialMessages].reverse())
    }
  }, [initialMessages])

  // Connect WebSocket
  useEffect(() => {
    const tokens = getTokens()
    if (!tokens?.accessToken) return

    chatWS.connect(tokens.accessToken).then(() => {
      setWsConnected(true)
    }).catch((err) => {
      console.warn('[ChatsPage] WS connect failed:', err)
    })

    return () => {
      chatWS.disconnect()
    }
  }, [])

  // Subscribe to current chat
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    if (selectedChatId && wsConnected) {
      const unsub = chatWS.subscribe(selectedChatId, (msg) => {
        setMessages((prev) => [...prev, msg])
        scrollToBottom()
      })
      unsubscribeRef.current = unsub
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [selectedChatId, wsConnected])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessageApi(selectedChatId!, content),
    onSuccess: (msg) => {
      setMessages((prev) => [...prev, msg])
      setMessageInput('')
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      scrollToBottom()
    },
    onError: () => toast.error('Не удалось отправить сообщение'),
  })

  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId)
    setMessages([])
    try {
      await markRead(chatId)
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] })
    } catch {}
  }

  const handleSend = () => {
    const content = messageInput.trim()
    if (!content || !selectedChatId) return
    sendMutation.mutate(content)
  }

  const selectedChat = chats?.find((c) => c.id === selectedChatId)

  const getChatName = (chat: ChatResponse): string => {
    if (chat.name) return chat.name
    const other = chat.participants.find((p) => p.userId !== user?.id)
    return other?.name ?? 'Чат'
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 128px)', overflow: 'hidden' }}>
      {/* Left: chat list */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: selectedChatId ? 0 : '100%', md: 320 },
          display: { xs: selectedChatId ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          mr: { md: 2 },
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            Сообщения
          </Typography>
        </Box>

        {chatsLoading ? (
          <Box sx={{ p: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, p: 1.5, mb: 0.5 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton height={18} width="70%" />
                  <Skeleton height={14} width="50%" />
                </Box>
              </Box>
            ))}
          </Box>
        ) : !chats || chats.length === 0 ? (
          <Box sx={{ p: 3, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Нет чатов
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflow: 'auto', flex: 1 }}>
            {chats.map((chat) => {
              const chatName = getChatName(chat)
              const isActive = selectedChatId === chat.id
              return (
                <ListItem key={chat.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectChat(chat.id)}
                    selected={isActive}
                    sx={{
                      px: 2,
                      py: 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.light' },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <UserAvatar name={chatName} size={44} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {chatName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {chat.lastMessage?.content ?? 'Нет сообщений'}
                        </Typography>
                      }
                    />
                    {chat.lastMessage && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
                        {formatChatTime(chat.lastMessage.createdAt)}
                      </Typography>
                    )}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Paper>

      {/* Right: messages */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: selectedChatId ? '1px solid' : 'none',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {!selectedChatId ? (
          <EmptyState
            icon={<ChatIcon sx={{ fontSize: 40 }} />}
            title="Выберите чат"
            description="Выберите чат из списка слева, чтобы начать общение"
          />
        ) : (
          <>
            {/* Chat header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: 'background.paper',
              }}
            >
              <UserAvatar name={selectedChat ? getChatName(selectedChat) : ''} size={40} />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedChat ? getChatName(selectedChat) : ''}
                </Typography>
              </Box>
            </Box>

            {/* Messages area */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: '#F8FAFF',
              }}
            >
              {messagesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <Skeleton width={200} height={44} sx={{ borderRadius: 3 }} />
                  </Box>
                ))
              ) : messages.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Нет сообщений. Напишите первым!
                  </Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          px: 2,
                          py: 1,
                          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          bgcolor: isMine ? 'primary.main' : 'background.paper',
                          color: isMine ? 'white' : 'text.primary',
                          boxShadow: 1,
                        }}
                      >
                        <Typography variant="body2">{msg.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.25,
                            fontSize: '0.6875rem',
                          }}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input area */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end',
              }}
            >
              <TextField
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Написать сообщение..."
                multiline
                maxRows={4}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!messageInput.trim() || sendMutation.isPending}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': { bgcolor: 'action.disabledBackground' },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
