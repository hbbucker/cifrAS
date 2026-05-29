-- ==========================================
-- OPTIMIZATION: Index for Email-based RLS
-- ==========================================
-- This index speeds up Row Level Security (RLS) checks on the group_invitations table.
-- The policy compares 'invitee_email' with the email claim in the user's JWT.
-- Without this index, the database would perform a sequential scan for every RLS check.

CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee_email 
ON public.group_invitations(invitee_email);
