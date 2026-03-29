import apiClient from './api.client';
import type { Chat, Message, SendMessageRequest, CreateDirectChatRequest } from '../types/messaging.types';

export const messagingApi = {
  /**
   * Получить мои чаты
   */
  getMyChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>('/chats');
    return response.data;
  },

  /**
   * Получить прямые чаты
   */
  getDirectChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>('/chats/direct');
    return response.data;
  },

  /**
   * Получить чаты матчей
   */
  getMatchChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>('/chats/match');
    return response.data;
  },

  /**
   * Получить чат по ID
   */
  getChatById: async (id: number): Promise<Chat> => {
    const response = await apiClient.get<Chat>(`/chats/${id}`);
    return response.data;
  },

  /**
   * Получить сообщения чата
   */
  getChatMessages: async (chatId: number, page: number = 0, size: number = 50): Promise<{ content: Message[]; total: number }> => {
    const response = await apiClient.get<{ content: Message[]; total: number }>(`/chats/${chatId}/messages`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Отправить сообщение
   */
  sendMessage: async (chatId: number, data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post<Message>(`/chats/${chatId}/messages`, data);
    return response.data;
  },

  /**
   * Отметить чат как прочитанный
   */
  markChatAsRead: async (chatId: number): Promise<void> => {
    await apiClient.post(`/chats/${chatId}/read`);
  },

  /**
   * Получить количество непрочитанных
   */
  getUnreadCount: async (chatId: number): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>(`/chats/${chatId}/unread-count`);
    return response.data;
  },

  /**
   * Удалить чат
   */
  deleteChat: async (chatId: number): Promise<void> => {
    await apiClient.delete(`/chats/${chatId}`);
  },

  /**
   * Создать/получить прямой чат
   */
  createDirectChat: async (data: CreateDirectChatRequest): Promise<Chat> => {
    const response = await apiClient.post<Chat>('/chats/direct', null, {
      params: { participantId: data.participantId },
    });
    return response.data;
  },
};

export default messagingApi;
