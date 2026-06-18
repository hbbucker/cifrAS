-- ==========================================
-- FEATURE: Full Text Search (FTS) for Songs Update
-- ==========================================
-- This migration updates the FTS index to include 'lyrics'.
-- It uses a generated column 'fts_vector' to store pre-processed search tokens
-- in Portuguese, optimized with a GIN index.

-- 1. Drop existing to redefine
ALTER TABLE public.songs DROP COLUMN IF EXISTS fts_vector;

-- 2. Add the generated column
-- Weight 'A' for Title (highest priority)
-- Weight 'B' for Artist
-- Weight 'C' for Lyrics
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS fts_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(artist, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(lyrics::text, '')), 'C')
) STORED;

-- 3. Create/Recreate the GIN index for ultra-fast searches
CREATE INDEX IF NOT EXISTS idx_songs_fts ON public.songs USING GIN (fts_vector);
