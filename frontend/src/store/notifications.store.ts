import { create } from 'zustand';
import type { Notification } from '../types/notifications.types';
import notificationsApi from '../api/notifications.api';
import webSocketService from '../utils/websocket.service';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  setUnreadCount: (count: number) => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  connectWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) => {
    set({ notifications });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, status: 'READ' as const } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, status: 'READ' as const })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationsApi.getMyNotifications(0, 50);
      set({ notifications: data.content, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await notificationsApi.getNotificationsCount();
      set({ unreadCount: data.unreadCount });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  connectWebSocket: (token: string) => {
    // Подписка на уведомления через WebSocket
    webSocketService.subscribe<Notification>('/user/queue/notifications', (notification) => {
      console.log('[Notifications] New notification received:', notification);
      get().addNotification(notification);
    });
  },

  disconnectWebSocket: () => {
    webSocketService.unsubscribe('/user/queue/notifications');
  },
}));
