import apiClient from './api.client';
import type { Profile, ProfileCreateRequest, ProfileUpdateRequest, Contact, Complaint } from '../types/profile.types';

export const profileApi = {
  /**
   * Получить текущий профиль
   */
  getMyProfile: async (): Promise<Profile> => {
    const response = await apiClient.get<Profile>('/profiles/my');
    return response.data;
  },

  /**
   * Получить профиль по ID
   */
  getProfileById: async (id: number): Promise<Profile> => {
    const response = await apiClient.get<Profile>(`/profiles/${id}`);
    return response.data;
  },

  /**
   * Создать профиль
   */
  createProfile: async (data: ProfileCreateRequest): Promise<Profile> => {
    const response = await apiClient.put<Profile>('/profiles/my', data);
    return response.data;
  },

  /**
   * Обновить профиль
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<Profile> => {
    const response = await apiClient.put<Profile>('/profiles/my', data);
    return response.data;
  },

  /**
   * Поиск профилей
   */
  searchProfiles: async (params: {
    sport?: string;
    city?: string;
    minLevel?: number;
    maxLevel?: number;
  }): Promise<Profile[]> => {
    const response = await apiClient.get<Profile[]>('/profiles/search', { params });
    return response.data;
  },

  /**
   * Получить мои контакты
   */
  getMyContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get<Contact[]>('/profiles/my/contacts');
    return response.data;
  },

  /**
   * Отправить запрос в контакты
   */
  sendContactRequest: async (contactId: number): Promise<Contact> => {
    const response = await apiClient.post<Contact>(`/profiles/${contactId}/contact`);
    return response.data;
  },

  /**
   * Обновить статус контакта
   */
  updateContactStatus: async (contactId: number, status: 'PENDING' | 'ACCEPTED' | 'BLOCKED'): Promise<Contact> => {
    const response = await apiClient.put<Contact>(`/profiles/contacts/${contactId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  /**
   * Удалить контакт
   */
  deleteContact: async (contactId: number): Promise<void> => {
    await apiClient.delete(`/profiles/contacts/${contactId}`);
  },

  /**
   * Создать жалобу
   */
  createComplaint: async (data: { targetProfileId: number; complaintType: string; complaintText: string }): Promise<Complaint> => {
    const response = await apiClient.post<Complaint>('/complaints', data);
    return response.data;
  },
};

export default profileApi;
