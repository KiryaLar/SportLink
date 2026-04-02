import apiClient from './client'
import { Page, AdminStatistics } from '../types'

export interface AdminUser {
  id: string
  email: string
  name: string
  roles: string[]
  status: 'ACTIVE' | 'BLOCKED'
  createdAt: string
}

export interface AdminMatch {
  id: string
  title: string
  sport: string
  organizerId: string
  status: string
  currentParticipants: number
  maxParticipants: number
  scheduledAt: string
  createdAt: string
}

export interface AdminPlace {
  id: string
  name: string
  address: string
  status: string
  placeType: string
  createdAt: string
}

export interface AdminComplaint {
  id: string
  reporterProfileId: string
  targetProfileId: string
  complaintType: string
  complaintText: string
  status: string
  createdAt: string
}

export async function getUsers(params?: { page?: number; size?: number }): Promise<Page<AdminUser>> {
  const { data } = await apiClient.get<Page<AdminUser>>('/admin/users', { params })
  return data
}

export async function blockUser(id: string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/block`)
}

export async function unblockUser(id: string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/unblock`)
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}

export async function getAdminMatches(params?: { page?: number; size?: number }): Promise<Page<AdminMatch>> {
  const { data } = await apiClient.get<Page<AdminMatch>>('/admin/matches', { params })
  return data
}

export async function cancelMatch(id: string): Promise<void> {
  await apiClient.post(`/admin/matches/${id}/cancel`)
}

export async function deleteAdminMatch(id: string): Promise<void> {
  await apiClient.delete(`/admin/matches/${id}`)
}

export async function getAdminPlaces(params?: { page?: number; size?: number }): Promise<Page<AdminPlace>> {
  const { data } = await apiClient.get<Page<AdminPlace>>('/admin/places', { params })
  return data
}

export async function approvePlace(id: string): Promise<void> {
  await apiClient.post(`/admin/places/${id}/approve`)
}

export async function rejectPlace(id: string): Promise<void> {
  await apiClient.post(`/admin/places/${id}/reject`)
}

export async function getComplaints(params?: { page?: number; size?: number }): Promise<Page<AdminComplaint>> {
  const { data } = await apiClient.get<Page<AdminComplaint>>('/admin/complaints', { params })
  return data
}

export async function resolveComplaint(id: string): Promise<void> {
  await apiClient.post(`/admin/complaints/${id}/resolve`, null, {
    params: { decision: 'RESOLVED' },
  })
}

export async function rejectComplaint(id: string): Promise<void> {
  await apiClient.post(`/admin/complaints/${id}/reject`)
}

export async function getStatistics(): Promise<AdminStatistics> {
  const { data } = await apiClient.get<AdminStatistics>('/admin/statistics')
  return data
}
