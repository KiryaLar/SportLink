// Profile типы
export interface SportInfo {
  sport: string;
  level: number;
  description?: string;
}

export interface Profile {
  id: number;
  keycloakUserId: string;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  age: number | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'BANNED';
  description: string | null;
  sports: SportInfo[];
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCreateRequest {
  city: string;
  description?: string;
  sports: SportInfo[];
}

export interface ProfileUpdateRequest {
  name?: string;
  city?: string;
  description?: string;
  sports?: SportInfo[];
}

export interface Contact {
  id: number;
  contact: Profile;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
}

export interface Complaint {
  id: number;
  reporterProfileId: number;
  targetProfileId: number;
  complaintType: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'OTHER';
  complaintText: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}
