// Sport types
export type Sport =
  | 'FOOTBALL'
  | 'TENNIS'
  | 'BASKETBALL'
  | 'VOLLEYBALL'
  | 'SWIMMING'
  | 'RUNNING'
  | 'CYCLING'
  | 'HOCKEY'
  | 'BADMINTON'
  | 'TABLE_TENNIS'

export const SPORT_LABELS: Record<Sport, string> = {
  FOOTBALL: 'Футбол',
  TENNIS: 'Теннис',
  BASKETBALL: 'Баскетбол',
  VOLLEYBALL: 'Волейбол',
  SWIMMING: 'Плавание',
  RUNNING: 'Бег',
  CYCLING: 'Велоспорт',
  HOCKEY: 'Хоккей',
  BADMINTON: 'Бадминтон',
  TABLE_TENNIS: 'Настольный теннис',
}

export const ALL_SPORTS: Sport[] = [
  'FOOTBALL',
  'TENNIS',
  'BASKETBALL',
  'VOLLEYBALL',
  'SWIMMING',
  'RUNNING',
  'CYCLING',
  'HOCKEY',
  'BADMINTON',
  'TABLE_TENNIS',
]

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Profile
export interface SportInfo {
  sport: Sport
  level: number
  description?: string
}

export interface ProfileResponse {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  age?: number
  avatarUrl?: string
  description?: string
  sports: SportInfo[]
  ratingAvg?: number
  ratingCount?: number
}

export interface ProfileSummaryResponse {
  id: string
  name: string
  city?: string
  avatarUrl?: string
  sports?: SportInfo[]
}

export interface ProfileCreateRequest {
  name: string
  email: string
  phone?: string
  city?: string
  age?: number
  description?: string
  sports: { sport: Sport; level: number; description?: string }[]
}

export interface ProfileUpdateRequest {
  name?: string
  city?: string
  age?: number
  phone?: string
  description?: string
  sports?: { sport: Sport; level: number; description?: string }[]
}

// Matches
export type MatchStatus = 'OPEN' | 'READY' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'
export type ParticipantStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface MatchResponse {
  id: string
  organizerId: string
  title: string
  sport: Sport
  scheduledAt: string
  sportsPlaceId: string
  maxParticipants: number
  currentParticipants: number
  minLevel?: number
  maxLevel?: number
  description?: string
  status: MatchStatus
  createdAt: string
  updatedAt: string
}

export interface MatchSummaryResponse {
  id: string
  organizerId: string
  title: string
  sport: Sport
  scheduledAt: string
  sportsPlaceId: string
  maxParticipants: number
  currentParticipants: number
  status: MatchStatus
}

export interface MatchParticipantResponse {
  id: string
  matchId: string
  userId: string
  playerName: string
  status: ParticipantStatus
  joinedAt: string
}

export interface MatchCreateRequest {
  title: string
  sport: Sport
  scheduledAt: string
  sportsPlaceId: string
  maxParticipants: number
  minLevel?: number
  maxLevel?: number
  description?: string
}

export interface MatchUpdateRequest {
  title?: string
  sport?: Sport
  scheduledAt?: string
  sportsPlaceId?: string
  maxParticipants?: number
  minLevel?: number
  maxLevel?: number
  description?: string
}

export interface MatchSearchRequest {
  sport?: Sport
  city?: string
  dateFrom?: string
  dateTo?: string
  minLevel?: number
  maxLevel?: number
  status?: MatchStatus
}

// Sports Places
export type PlaceType = 'FREE' | 'PAID'
export type PlaceStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED'

export interface SportsPlaceResponse {
  id: string
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  placeType: PlaceType
  status: PlaceStatus
  priceInfo?: string
  workingHours?: string
  contactInfo?: string
  supportedSports: Sport[]
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface SportsPlaceSummaryResponse {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  placeType: PlaceType
  status: PlaceStatus
  createdAt: string
}

export interface SportsPlaceCreateRequest {
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  placeType: PlaceType
  priceInfo?: string
  workingHours?: string
  contactInfo?: string
  supportedSports: Sport[]
}

export interface SportsPlaceUpdateRequest {
  name?: string
  description?: string
  address?: string
  latitude?: number
  longitude?: number
  placeType?: PlaceType
  priceInfo?: string
  workingHours?: string
  contactInfo?: string
  supportedSports?: Sport[]
}

export interface SportsPlaceSearchRequest {
  sport?: Sport
  placeType?: PlaceType
  status?: PlaceStatus
  city?: string
}

// Ratings
export type ReviewType = 'SKILL' | 'BEHAVIOR' | 'RELIABILITY'
export type SkillLevel = 'AS_EXPECTED' | 'ABOVE' | 'BELOW'

export interface ReviewResponse {
  id: string
  authorId: string
  targetUserId: string
  matchId: string
  reviewType: ReviewType
  rating: number
  skillLevel?: SkillLevel
  comment?: string
  createdAt: string
}

export interface UserRatingResponse {
  userId: string
  skillRatingAvg?: number
  skillRatingCount: number
  behaviorRatingAvg?: number
  behaviorRatingCount: number
  reliabilityRatingAvg?: number
  reliabilityRatingCount: number
}

export interface ReviewCreateRequest {
  targetUserId: string
  matchId: string
  reviewType: ReviewType
  rating: number
  skillLevel?: SkillLevel
  comment?: string
}

// Chats
export type ChatType = 'DIRECT' | 'MATCH'
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'

export interface ChatParticipant {
  userId: string
  name: string
}

export interface MessageResponse {
  id: string
  chatId: string
  senderId: string
  content: string
  status: MessageStatus
  createdAt: string
}

export interface ChatResponse {
  id: string
  chatType: ChatType
  name?: string
  matchId?: string
  participants: ChatParticipant[]
  lastMessage?: MessageResponse
  updatedAt: string
}

// Notifications
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
  | 'SYSTEM'

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ'

export interface NotificationResponse {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  entityId?: string
  entityType?: string
  status: NotificationStatus
  createdAt: string
}

// Contact
export type ContactStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED'

export interface ContactResponse {
  id: string
  contact: ProfileSummaryResponse
  status: ContactStatus
}

// Complaint
export type ComplaintType = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'OTHER'

export interface ComplaintResponse {
  id: string
  reporterProfileId: string
  targetProfileId: string
  complaintType: ComplaintType
  complaintText: string
  status: string
  createdAt: string
}

export interface ComplaintCreateRequest {
  targetProfileId: string
  complaintType: ComplaintType
  complaintText: string
}

// Pagination
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// Admin
export interface AdminStatistics {
  totalUsers: number
  totalMatches: number
  totalPlaces: number
  pendingComplaints: number
  activeUsers: number
}

export interface NotificationCount {
  totalCount: number
  unreadCount: number
}
