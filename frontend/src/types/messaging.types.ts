// Messaging типы
export type ChatType = 'DIRECT' | 'MATCH';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface Chat {
  id: number;
  chatType: ChatType;
  name: string | null;
  matchId: number | null;
  participants: string[];
  lastMessage: Message | null;
  updatedAt: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface CreateDirectChatRequest {
  participantId: string;
}
