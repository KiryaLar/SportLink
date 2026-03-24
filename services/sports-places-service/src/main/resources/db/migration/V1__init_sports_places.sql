-- V1__init_sports_places.sql

CREATE TABLE sports_places (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    place_type VARCHAR(50) NOT NULL DEFAULT 'FREE',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    price_info TEXT,
    working_hours VARCHAR(255),
    contact_info VARCHAR(255),
    image_url VARCHAR(500),
    created_by UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sports_places_sports (
    place_id BIGINT NOT NULL REFERENCES sports_places(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    PRIMARY KEY (place_id, sport)
);

CREATE INDEX idx_sports_places_status ON sports_places(status);
CREATE INDEX idx_sports_places_type ON sports_places(place_type);
CREATE INDEX idx_sports_places_location ON sports_places(latitude, longitude);
