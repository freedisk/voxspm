-- Add user_id to polls table for rate limiting and ownership tracking
-- user_id is nullable to preserve historical polls (seed data, legacy)
-- FK to auth.users with ON DELETE SET NULL to keep polls if user is deleted
-- This file is tracked in git for history but applied manually via Supabase Studio

ALTER TABLE public.polls
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for rate limit queries (COUNT WHERE user_id = X AND status = 'pending')
CREATE INDEX IF NOT EXISTS polls_user_id_status_idx
  ON public.polls (user_id, status)
  WHERE user_id IS NOT NULL;

-- Documentation
COMMENT ON COLUMN public.polls.user_id IS
  'Anonymous Supabase session user_id of the poll proposer. NULL for seed/legacy polls. Used for rate limiting and internal tracking, never displayed publicly.';
