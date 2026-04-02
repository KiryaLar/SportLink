import apiClient from './client'
import {
  ProfileResponse,
  ProfileSummaryResponse,
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ContactResponse,
  ContactStatus,
} from '../types'

export async function getMyProfile(): Promise<ProfileResponse> {
  const { data } = await apiClient.get<ProfileResponse>('/profiles/my')
  return data
}

export async function getProfile(id: string): Promise<ProfileResponse> {
  const { data } = await apiClient.get<ProfileResponse>(`/profiles/${id}`)
  return data
}

export async function getAllProfiles(): Promise<ProfileSummaryResponse[]> {
  const { data } = await apiClient.get<ProfileSummaryResponse[]>('/profiles')
  return data
}

export async function searchProfiles(params: {
  sport?: string
  city?: string
  minLevel?: number
  maxLevel?: number
}): Promise<ProfileSummaryResponse[]> {
  const { data } = await apiClient.get<ProfileSummaryResponse[]>('/profiles/search', { params })
  return data
}

export async function createProfile(req: ProfileCreateRequest): Promise<ProfileResponse> {
  const { data } = await apiClient.post<ProfileResponse>('/profiles', req)
  return data
}

export async function updateMyProfile(req: ProfileUpdateRequest): Promise<ProfileResponse> {
  const { data } = await apiClient.put<ProfileResponse>('/profiles/my', req)
  return data
}

export async function getMyContacts(): Promise<ContactResponse[]> {
  const { data } = await apiClient.get<ContactResponse[]>('/profiles/my/contacts')
  return data
}

export async function addContact(profileId: string): Promise<ContactResponse> {
  const { data } = await apiClient.post<ContactResponse>(`/profiles/${profileId}/contact`)
  return data
}

export async function updateContactStatus(
  contactId: string,
  status: ContactStatus
): Promise<ContactResponse> {
  const { data } = await apiClient.put<ContactResponse>(
    `/profiles/contacts/${contactId}/status`,
    null,
    { params: { status } }
  )
  return data
}

export async function removeContact(contactId: string): Promise<void> {
  await apiClient.delete(`/profiles/contacts/${contactId}`)
}
