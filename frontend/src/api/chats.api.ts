import apiClient from './client'
import { ChatResponse, MessageResponse } from '../types'

export async function getChats(): Promise<ChatResponse[]> {
  const { data } = await apiClient.get<ChatResponse[]>('/chats')
  return data
}

export async function getChat(id: string): Promise<ChatResponse> {
  const { data } = await apiClient.get<ChatResponse>(`/chats/${id}`)
  return data
}

export async function getMessages(
  id: string,
  params?: { page?: number; size?: number }
): Promise<MessageResponse[]> {
  const { data } = await apiClient.get<MessageResponse[]>(`/chats/${id}/messages`, { params })
  return data
}

export async function sendMessage(id: string, content: string): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(`/chats/${id}/messages`, { content })
  return data
}

export async function markRead(id: string): Promise<void> {
  await apiClient.post(`/chats/${id}/read`)
}

export async function getUnreadCount(id: string): Promise<number> {
  const { data } = await apiClient.get<number>(`/chats/${id}/unread-count`)
  return data
}

export async function deleteChat(id: string): Promise<void> {
  await apiClient.delete(`/chats/${id}`)
}

export async function createDirectChat(participantId: string): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>('/chats/direct', null, {
    params: { participantId },
  })
  return data
}
