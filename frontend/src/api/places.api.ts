import apiClient from './client'
import {
  SportsPlaceResponse,
  SportsPlaceSummaryResponse,
  SportsPlaceCreateRequest,
  SportsPlaceUpdateRequest,
  SportsPlaceSearchRequest,
  PlaceStatus,
} from '../types'

export async function getPlaces(): Promise<SportsPlaceSummaryResponse[]> {
  const { data } = await apiClient.get<SportsPlaceSummaryResponse[]>('/sports-places')
  return data
}

export async function searchPlaces(req: SportsPlaceSearchRequest): Promise<SportsPlaceSummaryResponse[]> {
  const { data } = await apiClient.post<SportsPlaceSummaryResponse[]>('/sports-places/search', req)
  return data
}

export async function getPlace(id: string): Promise<SportsPlaceResponse> {
  const { data } = await apiClient.get<SportsPlaceResponse>(`/sports-places/${id}`)
  return data
}

export async function createPlace(req: SportsPlaceCreateRequest): Promise<SportsPlaceResponse> {
  const { data } = await apiClient.post<SportsPlaceResponse>('/sports-places', req)
  return data
}

export async function updatePlace(id: string, req: SportsPlaceUpdateRequest): Promise<SportsPlaceResponse> {
  const { data } = await apiClient.put<SportsPlaceResponse>(`/sports-places/${id}`, req)
  return data
}

export async function updatePlaceStatus(id: string, status: PlaceStatus): Promise<SportsPlaceResponse> {
  const { data } = await apiClient.patch<SportsPlaceResponse>(`/sports-places/${id}/status`, null, {
    params: { status },
  })
  return data
}

export async function deletePlace(id: string): Promise<void> {
  await apiClient.delete(`/sports-places/${id}`)
}
