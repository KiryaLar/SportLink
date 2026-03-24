-- V1__init_profiles.sql

CREATE TABLE profiles (
    id BIGSERIAL PRIMARY KEY,
    keycloak_user_id UUID NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    city VARCHAR(255),
    age INTEGER,
    avatar_key VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    complaint_count INTEGER NOT NULL DEFAULT 0,
    rating_avg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    rating_count BIGINT NOT NULL DEFAULT 0,
    rating_version BIGINT NOT NULL DEFAULT 0,
    rating_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

    CONSTRAINT chk_profiles_rating_avg CHECK (rating_avg >= 0 AND rating_avg <= 5),
    CONSTRAINT chk_profiles_age CHECK (age >= 0 AND age <= 120),
    CONSTRAINT chk_profiles_status CHECK (status IN ('ACTIVE', 'INACTIVE','BLOCKED', 'BANNED'))
);

CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_city ON profiles (city);

CREATE TABLE sport_info (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL,
    description TEXT,
    events_completed INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_sport_info_level CHECK (level BETWEEN 1 AND 10)
);

CREATE INDEX idx_sport_info_profile ON sport_info(profile_id);

CREATE TABLE profile_contacts (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_profile_contacts_pair UNIQUE (owner_id, contact_id),
    CONSTRAINT chk_profile_contacts_not_self CHECK (owner_id <> contact_id)
);

CREATE INDEX idx_profile_contacts_owner on profile_contacts (owner_id);
CREATE INDEX idx_profile_contacts_contact on profile_contacts (contact_id);

CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    reporter_profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    complaint_type VARCHAR(50) NOT NULL,
    complaint_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,

    constraint chk_complaints_type check (complaint_type in ('SPAM', 'HARASSMENT','INAPPROPRIATE_CONTENT', 'OTHER')),
    constraint chk_complaints_status check (complaint_type in ('PENDING', 'REVIEWED','RESOLVED', 'REJECTED'))
);
