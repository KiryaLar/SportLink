import apiClient from './client'
import { LoginRequest, RegisterRequest } from '../types'

interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', req)
  return data
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', req)
  return data
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken })
}
