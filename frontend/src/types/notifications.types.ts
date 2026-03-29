// Notification типы
export type NotificationType =
  | 'MATCH_INVITE'
  | 'MATCH_JOINED'
  | 'MATCH_CANCELLED'
  | 'MATCH_STARTED'
  | 'MATCH_FINISHED'
  | 'REVIEW_RECEIVED'
  | 'NEW_MESSAGE'
  | 'CONTACT_REQUEST'
  | 'CONTACT_ACCEPTED'
  | 'SYSTEM';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ';

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId: number | null;
  entityType: string | null;
  status: NotificationStatus;
  createdAt: string;
}

export interface NotificationCount {
  totalCount: number;
  unreadCount: number;
}
