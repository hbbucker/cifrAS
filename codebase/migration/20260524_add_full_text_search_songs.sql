-- ==========================================
-- FEATURE: Full Text Search (FTS) for Songs
-- ==========================================
-- This migration enables high-performance search for Title and Artist.
-- It uses a generated column 'fts_vector' to store pre-processed search tokens
-- in Portuguese, optimized with a GIN index.

-- 1. Add the generated column
-- Weight 'A' for Title (highest priority)
-- Weight 'B' for Artist
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS fts_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(artist, '')), 'B')
) STORED;

-- 2. Create the GIN index for ultra-fast searches
CREATE INDEX IF NOT EXISTS idx_songs_fts ON public.songs USING GIN (fts_vector);

-- Note: To search, the backend will use: 
-- SELECT * FROM songs WHERE fts_vector @@ to_tsquery('portuguese', 'termo_de_busca');
