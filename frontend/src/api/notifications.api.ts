import apiClient from './api.client';
import type { Notification, NotificationCount } from '../types/notifications.types';

export const notificationsApi = {
  /**
   * Получить мои уведомления
   */
  getMyNotifications: async (page: number = 0, size: number = 50): Promise<{ content: Notification[]; total: number }> => {
    const response = await apiClient.get<{ content: Notification[]; total: number }>('/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Получить непрочитанные уведомления
   */
  getUnreadNotifications: async (page: number = 0, size: number = 50): Promise<{ content: Notification[]; total: number }> => {
    const response = await apiClient.get<{ content: Notification[]; total: number }>('/notifications/unread', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Получить количество уведомлений
   */
  getNotificationsCount: async (): Promise<NotificationCount> => {
    const response = await apiClient.get<NotificationCount>('/notifications/count');
    return response.data;
  },

  /**
   * Получить уведомление по ID
   */
  getNotificationById: async (id: number): Promise<Notification> => {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Отметить уведомление как прочитанное
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  /**
   * Отметить все уведомления как прочитанные
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  /**
   * Удалить уведомление
   */
  deleteNotification: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Удалить все уведомления
   */
  deleteAllNotifications: async (): Promise<void> => {
    await apiClient.delete('/notifications');
  },
};

export default notificationsApi;
