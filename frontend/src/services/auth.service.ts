/**
 * Auth Service - работа с аутентификацией и регистрацией
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class AuthService {
  private readonly STORAGE_KEY = 'sportlink_tokens';
  private readonly PROFILE_SETUP_KEY = 'sportlink_profile_setup_required';

  /**
   * Регистрация нового пользователя
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка регистрации' }));
      throw new Error(error.message || `Ошибка: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Логин пользователя
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка входа' }));
      throw new Error(error.message || `Ошибка: ${response.status}`);
    }

    const data: LoginResponse = await response.json();
    
    // Сохраняем токены
    this.saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresIn * 1000,
    });

    // Помечаем, что可能需要 настройка профиля
    this.setProfileSetupRequired(true);

    return data;
  }

  /**
   * Выход из системы
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROFILE_SETUP_KEY);
  }

  /**
   * Получение access токена
   */
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    if (!tokens) return null;

    // Проверяем, не истёк ли токен
    if (Date.now() >= tokens.expiresAt) {
      // Токен истёк - пробуем refresh
      // TODO: реализовать refresh token logic
      this.logout();
      return null;
    }

    return tokens.accessToken;
  }

  /**
   * Проверка авторизации
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Получение заголовков для авторизованных запросов
   */
  getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Проверка, требуется ли настройка профиля
   */
  isProfileSetupRequired(): boolean {
    return localStorage.getItem(this.PROFILE_SETUP_KEY) === 'true';
  }

  /**
   * Установка флага настройки профиля
   */
  setProfileSetupRequired(required: boolean): void {
    if (required) {
      localStorage.setItem(this.PROFILE_SETUP_KEY, 'true');
    } else {
      localStorage.removeItem(this.PROFILE_SETUP_KEY);
    }
  }

  /**
   * Проверка, минимальный ли профиль у пользователя
   */
  async checkProfileSetup(): Promise<{ isMinimal: boolean; profile: any | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/my`, {
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return { isMinimal: true, profile: null };
      }

      if (!response.ok) {
        throw new Error('Ошибка получения профиля');
      }

      const profile = await response.json();
      
      // Профиль минимальный, если нет видов спорта
      const isMinimal = !profile.sports || profile.sports.length === 0;
      
      if (!isMinimal) {
        this.setProfileSetupRequired(false);
      }

      return { isMinimal, profile };
    } catch (error) {
      console.error('Error checking profile:', error);
      return { isMinimal: true, profile: null };
    }
  }

  private saveTokens(tokens: Tokens): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
  }

  private getTokens(): Tokens | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
