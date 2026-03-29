import apiClient from './api.client';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, Tokens } from '../types/auth.types';

export const authApi = {
  /**
   * Регистрация нового пользователя
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Логин пользователя
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Обновление токена (refresh token)
   */
  refresh: async (data: { refreshToken: string }): Promise<Tokens> => {
    const response = await apiClient.post<Tokens>('/auth/refresh', data);
    return response.data;
  },

  /**
   * Выход из системы (локальный)
   */
  logout: () => {
    localStorage.removeItem('sportlink_tokens');
  },
};

export default authApi;
