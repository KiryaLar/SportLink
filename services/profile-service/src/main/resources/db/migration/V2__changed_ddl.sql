-- V2__changed_ddl.sql

CREATE TABLE IF NOT EXISTS profile_statistics (
    id BIGSERIAL PRIMARY KEY,
    complaint_count INTEGER NOT NULL DEFAULT 0
);
