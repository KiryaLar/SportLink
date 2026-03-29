// Rating типы
export type ReviewType = 'SKILL' | 'BEHAVIOR' | 'RELIABILITY';
export type SkillLevel = 'AS_EXPECTED' | 'ABOVE' | 'BELOW';

export interface Review {
  id: number;
  authorId: string;
  targetUserId: string;
  matchId: number;
  reviewType: ReviewType;
  rating: number;
  skillLevel: SkillLevel | null;
  comment: string | null;
  createdAt: string;
}

export interface ReviewCreateRequest {
  targetUserId: string;
  matchId: number;
  reviewType: ReviewType;
  rating: number;
  skillLevel?: SkillLevel;
  comment?: string;
}

export interface UserRating {
  userId: string;
  skillRatingAvg: number;
  skillRatingCount: number;
  behaviorRatingAvg: number;
  behaviorRatingCount: number;
  reliabilityRatingAvg: number;
  reliabilityRatingCount: number;
  skillLevelMatches: number;
  skillLevelBelow: number;
  skillLevelAbove: number;
  updatedAt: string | null;
}
