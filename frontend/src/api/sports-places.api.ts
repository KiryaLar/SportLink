import apiClient from './api.client';
import type { SportsPlace, SportsPlaceCreateRequest, SportsPlaceSearchRequest } from '../types/sports-places.types';

export const sportsPlacesApi = {
  /**
   * Получить все площадки
   */
  getAllPlaces: async (): Promise<SportsPlace[]> => {
    const response = await apiClient.get<SportsPlace[]>('/sports-places');
    return response.data;
  },

  /**
   * Получить площадку по ID
   */
  getPlaceById: async (id: number): Promise<SportsPlace> => {
    const response = await apiClient.get<SportsPlace>(`/sports-places/${id}`);
    return response.data;
  },

  /**
   * Поиск площадок
   */
  searchPlaces: async (request: SportsPlaceSearchRequest): Promise<SportsPlace[]> => {
    const response = await apiClient.post<SportsPlace[]>('/sports-places/search', request);
    return response.data;
  },

  /**
   * Создать площадку
   */
  createPlace: async (data: SportsPlaceCreateRequest): Promise<SportsPlace> => {
    const response = await apiClient.post<SportsPlace>('/sports-places', data);
    return response.data;
  },

  /**
   * Обновить площадку
   */
  updatePlace: async (id: number, data: Partial<SportsPlaceCreateRequest>): Promise<SportsPlace> => {
    const response = await apiClient.put<SportsPlace>(`/sports-places/${id}`, data);
    return response.data;
  },

  /**
   * Удалить площадку
   */
  deletePlace: async (id: number): Promise<void> => {
    await apiClient.delete(`/sports-places/${id}`);
  },
};

export default sportsPlacesApi;
