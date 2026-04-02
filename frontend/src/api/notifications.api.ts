import apiClient from './client'
import { NotificationResponse, NotificationCount } from '../types'

export async function getNotifications(params?: {
  page?: number
  size?: number
}): Promise<NotificationResponse[]> {
  const { data } = await apiClient.get<NotificationResponse[]>('/notifications', { params })
  return data
}

export async function getUnreadNotifications(params?: {
  page?: number
  size?: number
}): Promise<NotificationResponse[]> {
  const { data } = await apiClient.get<NotificationResponse[]>('/notifications/unread', { params })
  return data
}

export async function getCount(): Promise<NotificationCount> {
  const { data } = await apiClient.get<NotificationCount>('/notifications/count')
  return data
}

export async function markRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await apiClient.post('/notifications/read-all')
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`/notifications/${id}`)
}
