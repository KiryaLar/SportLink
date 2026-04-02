import { create } from 'zustand'
import { ProfileResponse, AuthTokens } from '../types'
import { login as loginApi, register as registerApi } from '../api/auth.api'
import { getMyProfile } from '../api/profiles.api'
import { getTokens, setTokens, clearTokens } from '../api/client'

interface JwtPayload {
  sub?: string
  email?: string
  name?: string
  realm_access?: { roles?: string[] }
  resource_access?: Record<string, { roles?: string[] }>
  exp?: number
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload)) as JwtPayload
  } catch {
    return null
  }
}

function isAdmin(payload: JwtPayload | null): boolean {
  if (!payload) return false
  const realmRoles = payload.realm_access?.roles ?? []
  if (realmRoles.includes('REALM_ADMIN') || realmRoles.includes('admin')) return true
  const resourceRoles = Object.values(payload.resource_access ?? {}).flatMap((r) => r.roles ?? [])
  return resourceRoles.includes('admin')
}

interface AuthState {
  user: ProfileResponse | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setProfile: (profile: ProfileResponse) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,

  login: async (email, password) => {
    const res = await loginApi({ email, password })
    const tokens: AuthTokens = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: Date.now() + res.expiresIn * 1000,
    }
    setTokens(tokens)
    const payload = decodeJwt(res.accessToken)
    set({ tokens, isAuthenticated: true, isAdmin: isAdmin(payload) })
    try {
      const profile = await getMyProfile()
      set({ user: profile })
    } catch {
      // profile may not exist yet
    }
  },

  register: async (data) => {
    const res = await registerApi(data)
    const tokens: AuthTokens = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: Date.now() + res.expiresIn * 1000,
    }
    setTokens(tokens)
    const payload = decodeJwt(res.accessToken)
    set({ tokens, isAuthenticated: true, isAdmin: isAdmin(payload) })
    try {
      const profile = await getMyProfile()
      set({ user: profile })
    } catch {
      // profile may not exist yet
    }
  },

  logout: () => {
    clearTokens()
    set({ user: null, tokens: null, isAuthenticated: false, isAdmin: false })
  },

  checkAuth: async () => {
    set({ isLoading: true })
    const tokens = getTokens()
    if (!tokens || !tokens.accessToken) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    if (tokens.expiresAt && tokens.expiresAt < Date.now()) {
      clearTokens()
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    const payload = decodeJwt(tokens.accessToken)
    set({ tokens, isAuthenticated: true, isAdmin: isAdmin(payload) })
    try {
      const profile = await getMyProfile()
      set({ user: profile, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setProfile: (profile) => {
    set({ user: profile })
  },
}))
