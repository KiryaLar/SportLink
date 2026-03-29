import apiClient from './api.client';
import type { Match, MatchCreateRequest, MatchUpdateRequest, MatchParticipant, MatchSearchRequest } from '../types/matches.types';

export const matchesApi = {
  /**
   * Получить все матчи
   */
  getAllMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get<Match[]>('/matches');
    return response.data;
  },

  /**
   * Получить матч по ID
   */
  getMatchById: async (id: number): Promise<Match> => {
    const response = await apiClient.get<Match>(`/matches/${id}`);
    return response.data;
  },

  /**
   * Поиск матчей
   */
  searchMatches: async (request: MatchSearchRequest): Promise<Match[]> => {
    const response = await apiClient.post<Match[]>('/matches/search', request);
    return response.data;
  },

  /**
   * Получить мои организованные матчи
   */
  getMyOrganizedMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get<Match[]>('/matches/organizer/my');
    return response.data;
  },

  /**
   * Создать матч
   */
  createMatch: async (data: MatchCreateRequest): Promise<Match> => {
    const response = await apiClient.post<Match>('/matches', data);
    return response.data;
  },

  /**
   * Обновить матч
   */
  updateMatch: async (id: number, data: MatchUpdateRequest): Promise<Match> => {
    const response = await apiClient.put<Match>(`/matches/${id}`, data);
    return response.data;
  },

  /**
   * Обновить статус матча
   */
  updateMatchStatus: async (id: number, status: string): Promise<Match> => {
    const response = await apiClient.patch<Match>(`/matches/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  /**
   * Удалить матч
   */
  deleteMatch: async (id: number): Promise<void> => {
    await apiClient.delete(`/matches/${id}`);
  },

  /**
   * Получить участников матча
   */
  getMatchParticipants: async (matchId: number): Promise<MatchParticipant[]> => {
    const response = await apiClient.get<MatchParticipant[]>(`/matches/${matchId}/participants`);
    return response.data;
  },

  /**
   * Присоединиться к матчу
   */
  joinMatch: async (matchId: number): Promise<MatchParticipant> => {
    const response = await apiClient.post<MatchParticipant>(`/matches/${matchId}/join`);
    return response.data;
  },

  /**
   * Покинуть матч
   */
  leaveMatch: async (matchId: number): Promise<void> => {
    await apiClient.post(`/matches/${matchId}/leave`);
  },

  /**
   * Подтвердить участника
   */
  confirmParticipant: async (participantId: number): Promise<void> => {
    await apiClient.post(`/matches/participants/${participantId}/confirm`);
  },

  /**
   * Удалить участника
   */
  removeParticipant: async (participantId: number): Promise<void> => {
    await apiClient.delete(`/matches/participants/${participantId}`);
  },
};

export default matchesApi;
