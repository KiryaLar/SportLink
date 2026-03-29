import apiClient from './api.client';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: 'ACTIVE' | 'BLOCKED' | 'BANNED';
  createdAt: string;
}

export interface AdminMatch {
  id: number;
  title: string;
  sport: string;
  organizerId: string;
  organizerName: string;
  status: 'OPEN' | 'READY' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  participantsCount: number;
  scheduledAt: string;
}

export interface AdminPlace {
  id: number;
  name: string;
  address: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  placeType: 'FREE' | 'PAID';
  createdBy: string;
  createdAt: string;
}

export interface AdminComplaint {
  id: number;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  complaintType: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'OTHER';
  complaintText: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

export const adminApi = {
  // ==================== USERS ====================
  /**
   * Получить всех пользователей (ADMIN)
   */
  getAllUsers: async (page: number = 0, size: number = 50) => {
    const response = await apiClient.get<{ content: AdminUser[]; total: number }>('/admin/users', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Заблокировать пользователя
   */
  blockUser: async (userId: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/block`);
    return response.data;
  },

  /**
   * Разблокировать пользователя
   */
  unblockUser: async (userId: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  /**
   * Удалить пользователя
   */
  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Назначить роль ADMIN
   */
  assignAdminRole: async (userId: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/roles/admin`);
    return response.data;
  },

  // ==================== MATCHES ====================
  /**
   * Получить все матчи (ADMIN)
   */
  getAllMatches: async (page: number = 0, size: number = 50) => {
    const response = await apiClient.get<{ content: AdminMatch[]; total: number }>('/admin/matches', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Отменить матч (принудительно)
   */
  cancelMatch: async (matchId: number) => {
    const response = await apiClient.post(`/admin/matches/${matchId}/cancel`);
    return response.data;
  },

  /**
   * Удалить матч
   */
  deleteMatch: async (matchId: number) => {
    const response = await apiClient.delete(`/admin/matches/${matchId}`);
    return response.data;
  },

  // ==================== PLACES ====================
  /**
   * Получить все площадки (ADMIN)
   */
  getAllPlaces: async (page: number = 0, size: number = 50) => {
    const response = await apiClient.get<{ content: AdminPlace[]; total: number }>('/admin/places', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Одобрить площадку
   */
  approvePlace: async (placeId: number) => {
    const response = await apiClient.post(`/admin/places/${placeId}/approve`);
    return response.data;
  },

  /**
   * Отклонить площадку
   */
  rejectPlace: async (placeId: number) => {
    const response = await apiClient.post(`/admin/places/${placeId}/reject`);
    return response.data;
  },

  /**
   * Удалить площадку
   */
  deletePlace: async (placeId: number) => {
    const response = await apiClient.delete(`/admin/places/${placeId}`);
    return response.data;
  },

  // ==================== COMPLAINTS ====================
  /**
   * Получить ожидающие жалобы
   */
  getPendingComplaints: async (page: number = 0, size: number = 50) => {
    const response = await apiClient.get<{ content: AdminComplaint[]; total: number }>('/admin/complaints/pending', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Получить все жалобы
   */
  getAllComplaints: async (page: number = 0, size: number = 50) => {
    const response = await apiClient.get<{ content: AdminComplaint[]; total: number }>('/admin/complaints', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Рассмотреть жалобу (принять)
   */
  resolveComplaint: async (complaintId: number, decision: 'ACCEPTED' | 'REJECTED') => {
    const response = await apiClient.post(`/admin/complaints/${complaintId}/resolve`, { decision });
    return response.data;
  },

  /**
   * Отклонить жалобу
   */
  rejectComplaint: async (complaintId: number) => {
    const response = await apiClient.post(`/admin/complaints/${complaintId}/reject`);
    return response.data;
  },

  /**
   * Удалить жалобу
   */
  deleteComplaint: async (complaintId: number) => {
    const response = await apiClient.delete(`/admin/complaints/${complaintId}`);
    return response.data;
  },

  // ==================== STATISTICS ====================
  /**
   * Получить общую статистику
   */
  getStatistics: async () => {
    const response = await apiClient.get<{
      totalUsers: number;
      totalMatches: number;
      totalPlaces: number;
      pendingComplaints: number;
      activeUsers: number;
    }>('/admin/statistics');
    return response.data;
  },
};

export default adminApi;
