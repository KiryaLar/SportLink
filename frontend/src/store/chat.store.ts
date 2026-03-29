import { create } from 'zustand';
import type { Chat, Message } from '../types/messaging.types';
import messagingApi from '../api/messaging.api';
import webSocketService from '../utils/websocket.service';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;

  // Actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: number, chat: Partial<Chat>) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setUnreadCount: (count: number) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: number) => Promise<void>;
  sendMessage: (chatId: number, content: string) => Promise<void>;
  markAsRead: (chatId: number) => Promise<void>;
  connectWebSocket: (token: string) => Promise<void>;
  disconnectWebSocket: () => void;
  subscribeToChat: (chatId: number) => void;
  unsubscribeFromChat: (chatId: number) => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8085/ws-chat';

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isConnected: false,

  setChats: (chats) => {
    set({ chats });
  },

  addChat: (chat) => {
    set((state) => ({ chats: [chat, ...state.chats] }));
  },

  updateChat: (chatId, chat) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, ...chat } : c
      ),
    }));
  },

  setCurrentChat: (chat) => {
    set({ currentChat: chat });
  },

  setMessages: (messages) => {
    set({ messages });
  },

  addMessage: (message) => {
    set((state) => {
      // Обновляем последнее сообщение в чате
      const updatedChats = state.chats.map((chat) =>
        chat.id === message.chatId
          ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
          : chat
      );

      // Сортируем чаты по последнему сообщению
      updatedChats.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return {
        messages: [...state.messages, message],
        chats: updatedChats,
      };
    });
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const chats = await messagingApi.getMyChats();
      set({ chats, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      set({ isLoading: false });
    }
  },

  fetchMessages: async (chatId: number) => {
    set({ isLoading: true });
    try {
      const data = await messagingApi.getChatMessages(chatId, 0, 50);
      // Разворачиваем сообщения (новые внизу)
      set({ messages: data.content.reverse(), isLoading: false });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (chatId: number, content: string) => {
    try {
      const message = await messagingApi.sendMessage(chatId, { content });
      // Отправляем через WebSocket
      webSocketService.send(`/app/chat/${chatId}/message`, {
        content,
        chatId,
      });
      get().addMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  markAsRead: async (chatId: number) => {
    try {
      await messagingApi.markChatAsRead(chatId);
      get().updateChat(chatId, { lastMessage: { status: 'READ' } as any });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  connectWebSocket: async (token: string) => {
    try {
      await webSocketService.connect({
        url: WS_URL,
        token,
        onConnect: () => {
          set({ isConnected: true });
          console.log('[Chat] WebSocket connected');
        },
        onDisconnect: () => {
          set({ isConnected: false });
          console.log('[Chat] WebSocket disconnected');
        },
        onError: (error) => {
          console.error('[Chat] WebSocket error:', error);
        },
      });
    } catch (error) {
      console.error('[Chat] Failed to connect WebSocket:', error);
    }
  },

  disconnectWebSocket: () => {
    webSocketService.disconnect();
    set({ isConnected: false });
  },

  subscribeToChat: (chatId: number) => {
    const destination = `/topic/chat/${chatId}`;
    
    webSocketService.subscribe<Message>(destination, (message) => {
      console.log('[Chat] New message received:', message);
      get().addMessage(message);
    });
  },

  unsubscribeFromChat: (chatId: number) => {
    const destination = `/topic/chat/${chatId}`;
    webSocketService.unsubscribe(destination);
  },
}));
