-- Migration: Add tags column and GIN index for songs

ALTER TABLE songs ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- GIN index for array search and containment operations
CREATE INDEX IF NOT EXISTS idx_songs_tags_gin ON songs USING GIN (tags);
