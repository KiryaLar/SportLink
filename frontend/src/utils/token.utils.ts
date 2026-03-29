import type { Tokens } from '../types/auth.types';
import apiClient from '../api/api.client';

const TOKEN_REFRESH_THRESHOLD = 60 * 1000; // Обновлять за 1 минуту до истечения

/**
 * Проверка, истёк ли токен
 */
export const isTokenExpired = (expiresAt: number): boolean => {
  return Date.now() >= expiresAt;
};

/**
 * Проверка, нужно ли обновлять токен
 */
export const shouldRefreshToken = (expiresAt: number): boolean => {
  return Date.now() >= expiresAt - TOKEN_REFRESH_THRESHOLD;
};

/**
 * Обновление access токена через refresh токен
 */
export const refreshAccessToken = async (refreshToken: string): Promise<Tokens> => {
  try {
    const response = await apiClient.post<Tokens>('/auth/refresh', {
      refreshToken,
    });

    const newTokens: Tokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken || refreshToken,
      expiresAt: Date.now() + response.data.expiresIn * 1000,
    };

    // Сохраняем новые токены
    localStorage.setItem('sportlink_tokens', JSON.stringify(newTokens));

    return newTokens;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

/**
 * Получение текущего access токена с авто-обновлением
 */
export const getAccessToken = (): string | null => {
  const tokensJson = localStorage.getItem('sportlink_tokens');
  if (!tokensJson) {
    return null;
  }

  try {
    const tokens: Tokens = JSON.parse(tokensJson);

    // Если токен истёк
    if (isTokenExpired(tokens.expiresAt)) {
      console.log('[Token] Access token expired');
      return null;
    }

    // Если нужно обновить токен
    if (shouldRefreshToken(tokens.expiresAt)) {
      console.log('[Token] Refreshing access token...');
      // Запускаем обновление в фоне
      refreshAccessToken(tokens.refreshToken).catch((err) => {
        console.error('[Token] Background refresh failed:', err);
        // Logout если не удалось обновить
        localStorage.removeItem('sportlink_tokens');
        window.location.href = '/login';
      });
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('[Token] Error parsing tokens:', error);
    return null;
  }
};

/**
 * Сохранение токенов
 */
export const saveTokens = (tokens: Tokens): void => {
  localStorage.setItem('sportlink_tokens', JSON.stringify(tokens));
};

/**
 * Очистка токенов (logout)
 */
export const clearTokens = (): void => {
  localStorage.removeItem('sportlink_tokens');
};

/**
 * Проверка валидности токена
 */
export const validateToken = (): boolean => {
  const tokensJson = localStorage.getItem('sportlink_tokens');
  if (!tokensJson) {
    return false;
  }

  try {
    const tokens: Tokens = JSON.parse(tokensJson);
    return !isTokenExpired(tokens.expiresAt);
  } catch (error) {
    console.error('[Token] Error validating token:', error);
    return false;
  }
};
