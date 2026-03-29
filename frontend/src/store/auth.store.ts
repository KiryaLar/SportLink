import { create } from 'zustand';
import type { User, Tokens } from '../types/auth.types';
import { getAccessToken, saveTokens, clearTokens, refreshAccessToken, validateToken } from '../utils/token.utils';
import authApi from '../api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (tokens: Tokens) => void;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<void>;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (tokens: Tokens) => {
    saveTokens(tokens);
    set({ isAuthenticated: true, isLoading: false });
    
    // Загружаем информацию о пользователе
    fetchUserProfile();
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user: User) => {
    set({ user });
  },

  checkAuth: async () => {
    const isValid = validateToken();
    
    if (!isValid) {
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }

    // Токен валиден, загружаем профиль
    await fetchUserProfile();
    
    set({ isAuthenticated: true, isLoading: false });
    return true;
  },

  refreshToken: async () => {
    const tokensJson = localStorage.getItem('sportlink_tokens');
    if (!tokensJson) {
      get().logout();
      return;
    }

    try {
      const tokens: Tokens = JSON.parse(tokensJson);
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      
      set({ isAuthenticated: true });
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      get().logout();
      window.location.href = '/login';
    }
  },

  getAccessToken: () => {
    return getAccessToken();
  },
}));

/**
 * Загрузка профиля пользователя
 */
const fetchUserProfile = async () => {
  try {
    const profileApi = await import('../api/profile.api');
    const profile = await profileApi.default.getMyProfile();
    
    useAuthStore.getState().setUser({
      id: profile.keycloakUserId,
      email: profile.email,
      name: profile.name || '',
      roles: ['USER'], // TODO: Получить из токена
    });
  } catch (error) {
    console.error('[Auth] Failed to fetch user profile:', error);
  }
};

// Авто-обновление токена каждые 4 минуты
setInterval(() => {
  const state = useAuthStore.getState();
  if (state.isAuthenticated) {
    state.refreshToken().catch(console.error);
  }
}, 4 * 60 * 1000);
