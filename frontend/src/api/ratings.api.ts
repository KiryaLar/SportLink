import apiClient from './client'
import { ReviewResponse, UserRatingResponse, ReviewCreateRequest } from '../types'

export async function getUserRating(userId: string): Promise<UserRatingResponse> {
  const { data } = await apiClient.get<UserRatingResponse>(`/ratings/users/${userId}`)
  return data
}

export async function getUserReviews(
  userId: string,
  params?: { page?: number; size?: number }
): Promise<ReviewResponse[]> {
  const { data } = await apiClient.get<ReviewResponse[]>(`/ratings/users/${userId}/reviews`, {
    params,
  })
  return data
}

export async function getMatchReviews(matchId: string): Promise<ReviewResponse[]> {
  const { data } = await apiClient.get<ReviewResponse[]>(`/ratings/matches/${matchId}/reviews`)
  return data
}

export async function createReview(req: ReviewCreateRequest): Promise<ReviewResponse> {
  const { data } = await apiClient.post<ReviewResponse>('/ratings', req)
  return data
}

export async function deleteReview(id: string): Promise<void> {
  await apiClient.delete(`/ratings/${id}`)
}
