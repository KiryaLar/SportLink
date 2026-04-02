import apiClient from './client'
import {
  MatchResponse,
  MatchSummaryResponse,
  MatchCreateRequest,
  MatchUpdateRequest,
  MatchSearchRequest,
  MatchStatus,
  MatchParticipantResponse,
} from '../types'

export async function getMatches(): Promise<MatchSummaryResponse[]> {
  const { data } = await apiClient.get<MatchSummaryResponse[]>('/matches')
  return data
}

export async function searchMatches(req: MatchSearchRequest): Promise<MatchSummaryResponse[]> {
  const { data } = await apiClient.post<MatchSummaryResponse[]>('/matches/search', req)
  return data
}

export async function getMatch(id: string): Promise<MatchResponse> {
  const { data } = await apiClient.get<MatchResponse>(`/matches/${id}`)
  return data
}

export async function getMyMatches(): Promise<MatchSummaryResponse[]> {
  const { data } = await apiClient.get<MatchSummaryResponse[]>('/matches/organizer/my')
  return data
}

export async function createMatch(req: MatchCreateRequest): Promise<MatchResponse> {
  const { data } = await apiClient.post<MatchResponse>('/matches', req)
  return data
}

export async function updateMatch(id: string, req: MatchUpdateRequest): Promise<MatchResponse> {
  const { data } = await apiClient.put<MatchResponse>(`/matches/${id}`, req)
  return data
}

export async function updateMatchStatus(id: string, status: MatchStatus): Promise<MatchResponse> {
  const { data } = await apiClient.patch<MatchResponse>(`/matches/${id}/status`, null, {
    params: { status },
  })
  return data
}

export async function deleteMatch(id: string): Promise<void> {
  await apiClient.delete(`/matches/${id}`)
}

export async function getParticipants(id: string): Promise<MatchParticipantResponse[]> {
  const { data } = await apiClient.get<MatchParticipantResponse[]>(`/matches/${id}/participants`)
  return data
}

export async function joinMatch(id: string): Promise<MatchParticipantResponse> {
  const { data } = await apiClient.post<MatchParticipantResponse>(`/matches/${id}/join`)
  return data
}

export async function leaveMatch(id: string): Promise<void> {
  await apiClient.post(`/matches/${id}/leave`)
}

export async function confirmParticipant(matchId: string, participantId: string): Promise<void> {
  await apiClient.post(`/matches/${matchId}/participants/${participantId}/confirm`)
}

export async function removeParticipant(matchId: string, participantId: string): Promise<void> {
  await apiClient.delete(`/matches/${matchId}/participants/${participantId}`)
}
