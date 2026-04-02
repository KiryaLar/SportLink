import apiClient from './client'
import { ComplaintResponse, ComplaintCreateRequest } from '../types'

export async function createComplaint(req: ComplaintCreateRequest): Promise<ComplaintResponse> {
  const { data } = await apiClient.post<ComplaintResponse>('/complaints', req)
  return data
}
