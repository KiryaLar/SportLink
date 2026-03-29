// Matches типы
export type MatchStatus = 'OPEN' | 'READY' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface Match {
  id: number;
  organizerId: string;
  title: string;
  sport: string;
  scheduledAt: string;
  sportsPlaceId: number;
  maxParticipants: number;
  currentParticipants: number;
  minLevel: number;
  maxLevel: number;
  description?: string;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MatchCreateRequest {
  title: string;
  sport: string;
  scheduledAt: string;
  sportsPlaceId: number;
  maxParticipants: number;
  minLevel?: number;
  maxLevel?: number;
  description?: string;
}

export interface MatchUpdateRequest {
  title?: string;
  scheduledAt?: string;
  sportsPlaceId?: number;
  maxParticipants?: number;
  minLevel?: number;
  maxLevel?: number;
  description?: string;
}

export interface MatchParticipant {
  id: number;
  matchId: number;
  userId: string;
  playerName: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  joinedAt: string;
}

export interface MatchSearchRequest {
  sport?: string;
  status?: MatchStatus;
  dateFrom?: string;
  dateTo?: string;
  minLevel?: number;
  maxLevel?: number;
  sportsPlaceId?: number;
}
