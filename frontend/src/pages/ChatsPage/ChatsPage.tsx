import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Badge,
  Divider,
  TextField,
  Button,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  Search,
  Person,
  SportsSoccer,
} from '@mui/icons-material';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import webSocketService from '../../utils/websocket.service';

export const ChatsPage: React.FC = () => {
  const {
    chats,
    currentChat,
    messages,
    isLoading,
    isConnected,
    fetchChats,
    fetchMessages,
    sendMessage,
    setCurrentChat,
    setMessages,
    subscribeToChat,
    unsubscribeFromChat,
  } = useChatStore();

  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Подключаемся к WebSocket
    const token = localStorage.getItem('sportlink_tokens');
    if (token) {
      const tokens = JSON.parse(token);
      if (tokens.accessToken) {
        useChatStore.getState().connectWebSocket(tokens.accessToken);
      }
    }

    // Загружаем чаты
    fetchChats();

    return () => {
      useChatStore.getState().disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    // Прокрутка к последнему сообщению
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatSelect = (chat: typeof chats[0]) => {
    if (currentChat?.id === chat.id) return;

    // Отписываемся от предыдущего чата
    if (currentChat) {
      unsubscribeFromChat(currentChat.id);
    }

    setCurrentChat(chat);
    fetchMessages(chat.id);
    subscribeToChat(chat.id);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChat) return;

    try {
      await sendMessage(currentChat.id, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return formatTime(dateString);
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const getChatTitle = (chat: typeof chats[0]) => {
    if (chat.chatType === 'MATCH') {
      return `Матч #${chat.matchId}`;
    }
    // Для личных чатов - имя собеседника
    return 'Личный чат';
  };

  const getChatIcon = (chat: typeof chats[0]) => {
    if (chat.chatType === 'MATCH') {
      return <SportsSoccer />;
    }
    return <Person />;
  };

  if (isLoading && chats.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={600} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, height: 'calc(100vh - 100px)' }}>
        <Paper
          sx={{
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {/* Список чатов */}
          <Box
            sx={{
              width: 360,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Заголовок */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Чаты</Typography>
                <Chip
                  label={isConnected ? 'Online' : 'Offline'}
                  color={isConnected ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                placeholder="Поиск..."
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Box>

            {/* Список */}
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {chats.map((chat) => (
                <React.Fragment key={chat.id}>
                  <ListItem
                    button
                    selected={currentChat?.id === chat.id}
                    onClick={() => handleChatSelect(chat)}
                    sx={{
                      py: 2,
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                      >
                        <Avatar>{getChatIcon(chat)}</Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {getChatTitle(chat)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(chat.updatedAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {chat.lastMessage?.content || 'Нет сообщений'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}

              {chats.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Alert severity="info">Нет активных чатов</Alert>
                </Box>
              )}
            </List>
          </Box>

          {/* Окно чата */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {currentChat ? (
              <>
                {/* Заголовок чата */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar>{getChatIcon(currentChat)}</Avatar>
                  <Box>
                    <Typography variant="h6">{getChatTitle(currentChat)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentChat.participants.length} участников
                    </Typography>
                  </Box>
                </Box>

                {/* Сообщения */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                  }}
                >
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;

                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '60%',
                            bgcolor: isOwn ? 'primary.main' : 'grey.200',
                            color: isOwn ? 'primary.contrastText' : 'text.primary',
                            borderRadius: 2,
                            p: 1.5,
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              color: isOwn ? 'primary.light' : 'text.secondary',
                            }}
                          >
                            {formatTime(message.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Ввод сообщения */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <IconButton>
                    <AttachFile />
                  </IconButton>

                  <TextField
                    fullWidth
                    placeholder="Введите сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    multiline
                    maxRows={4}
                    size="small"
                  />

                  <IconButton>
                    <EmojiEmotions />
                  </IconButton>

                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'text.secondary',
                }}
              >
                <SportsSoccer sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">Выберите чат для начала общения</Typography>
                <Typography variant="body2">
                  Все сообщения защищены сквозным шифрованием
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatsPage;
