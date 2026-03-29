// Sports Places типы
export type SportsPlaceType = 'FREE' | 'PAID';
export type SportsPlaceStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface SportsPlace {
  id: number;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  placeType: SportsPlaceType;
  status: SportsPlaceStatus;
  priceInfo: string | null;
  workingHours: string | null;
  contactInfo: string | null;
  supportedSports: string[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SportsPlaceCreateRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeType: SportsPlaceType;
  supportedSports: string[];
  priceInfo?: string;
  description?: string;
}

export interface SportsPlaceSearchRequest {
  sport?: string;
  status?: SportsPlaceStatus;
  placeType?: SportsPlaceType;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}
