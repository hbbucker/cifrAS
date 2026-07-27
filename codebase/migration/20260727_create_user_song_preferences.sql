CREATE TABLE public.user_song_preferences (
    user_id VARCHAR NOT NULL,
    song_id UUID NOT NULL,
    transpose_steps INT NOT NULL DEFAULT 0,
    auto_scroll_speed INT NOT NULL DEFAULT 0,
    font_size INT NOT NULL DEFAULT 16,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, song_id),
    CONSTRAINT fk_song FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.user_song_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own preferences
CREATE POLICY "Users can manage their own song preferences"
ON public.user_song_preferences FOR ALL
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
