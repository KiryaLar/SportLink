-- V1__init_matches.sql

CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    organizer_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    max_participants INTEGER NOT NULL,
    min_level INTEGER NOT NULL DEFAULT 1,
    max_level INTEGER NOT NULL DEFAULT 10,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_participants (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    player_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_match_participant UNIQUE (match_id, user_id)
);

CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_sport ON matches(sport);
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX idx_matches_organizer ON matches(organizer_id);
CREATE INDEX idx_match_participants_match ON match_participants(match_id);
CREATE INDEX idx_match_participants_user ON match_participants(user_id);
