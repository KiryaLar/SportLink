import apiClient from './api.client';
import type { Review, ReviewCreateRequest, UserRating } from '../types/rating.types';

export const ratingApi = {
  /**
   * Получить рейтинг пользователя
   */
  getUserRating: async (userId: string): Promise<UserRating> => {
    const response = await apiClient.get<UserRating>(`/ratings/users/${userId}`);
    return response.data;
  },

  /**
   * Получить отзывы пользователя
   */
  getUserReviews: async (userId: string, page: number = 0, size: number = 10): Promise<{ content: Review[]; total: number }> => {
    const response = await apiClient.get<{ content: Review[]; total: number }>(`/ratings/users/${userId}/reviews`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Получить отзывы по типу
   */
  getReviewsByType: async (userId: string, type: 'SKILL' | 'BEHAVIOR' | 'RELIABILITY'): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/ratings/users/${userId}/reviews/type`, {
      params: { type },
    });
    return response.data;
  },

  /**
   * Получить отзывы матча
   */
  getMatchReviews: async (matchId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/ratings/matches/${matchId}/reviews`);
    return response.data;
  },

  /**
   * Создать отзыв
   */
  createReview: async (data: ReviewCreateRequest): Promise<Review> => {
    const response = await apiClient.post<Review>('/ratings', data);
    return response.data;
  },

  /**
   * Удалить отзыв (ADMIN)
   */
  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/ratings/${reviewId}`);
  },
};

export default ratingApi;
