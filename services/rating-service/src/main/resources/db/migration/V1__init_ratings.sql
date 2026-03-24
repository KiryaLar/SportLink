-- V1__init_ratings.sql

CREATE TABLE user_ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    skill_rating_avg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    skill_rating_count BIGINT NOT NULL DEFAULT 0,
    behavior_rating_avg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    behavior_rating_count BIGINT NOT NULL DEFAULT 0,
    reliability_rating_avg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    reliability_rating_count BIGINT NOT NULL DEFAULT 0,
    skill_level_matches BIGINT NOT NULL DEFAULT 0,
    skill_level_below BIGINT NOT NULL DEFAULT 0,
    skill_level_above BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP
);

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    author_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    match_id BIGINT NOT NULL,
    review_type VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL,
    skill_level VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX idx_reviews_target ON reviews(target_user_id);
CREATE INDEX idx_reviews_author ON reviews(author_id);
CREATE INDEX idx_reviews_match ON reviews(match_id);
CREATE INDEX idx_reviews_type ON reviews(review_type);
