-- 1. Group Module
-- Index for user_id in group_members to avoid sequential scans when finding user's groups
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Indexes for group_invitations
CREATE INDEX IF NOT EXISTS idx_group_invitations_inviter_status ON group_invitations(inviter_id, status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);

-- 2. Playlist Module
-- Composite index for listing active user playlists
CREATE INDEX IF NOT EXISTS idx_playlists_user_deleted_created ON playlists(userid, deletedat, createdat);

-- Index for group_id in playlists to optimize collaborative playlist queries
CREATE INDEX IF NOT EXISTS idx_playlists_group_id ON playlists(group_id);

-- 3. Song Module
-- Composite index for listing user active songs ordered by createdAt
CREATE INDEX IF NOT EXISTS idx_songs_user_deleted_created ON songs(userid, deletedat, createdat);

-- Function-based index for case-insensitive email searches in song_shares
CREATE INDEX IF NOT EXISTS idx_song_shares_invitee_email_lower ON song_shares(LOWER(invitee_email));

-- Composite index for song_id, invitee_email, status
CREATE INDEX IF NOT EXISTS idx_song_shares_song_invitee_status ON song_shares(song_id, LOWER(invitee_email), status);
