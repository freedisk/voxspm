-- ============================================================================
-- 001_schema.sql — VoxSPM : Types enum + Tables
-- ============================================================================

-- Types enum
CREATE TYPE poll_status AS ENUM ('pending', 'active', 'archived');
CREATE TYPE user_location AS ENUM ('saint_pierre', 'miquelon', 'exterieur');
CREATE TYPE user_role AS ENUM ('anon', 'admin');

-- ─── TAGS ──────────────────────────────────────────────────────────────────
CREATE TABLE public.tags (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  slug         text NOT NULL UNIQUE,
  color        text NOT NULL DEFAULT '#1B7FC4',
  icon         text NOT NULL DEFAULT '🏷️',
  order_index  smallint NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── POLLS ─────────────────────────────────────────────────────────────────
CREATE TABLE public.polls (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question        text NOT NULL CHECK (char_length(question) BETWEEN 10 AND 300),
  description     text,
  slug            text UNIQUE,
  status          poll_status NOT NULL DEFAULT 'pending',
  proposer_name   text,
  proposed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  proposed_at     timestamptz NOT NULL DEFAULT now(),
  validated_at    timestamptz,
  expires_at      timestamptz,
  total_votes     integer NOT NULL DEFAULT 0,
  votes_sp        integer NOT NULL DEFAULT 0,
  votes_miq       integer NOT NULL DEFAULT 0,
  votes_ext       integer NOT NULL DEFAULT 0
);

-- ─── POLL_TAGS (jointure many-to-many) ─────────────────────────────────────
CREATE TABLE public.poll_tags (
  poll_id  uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  tag_id   uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (poll_id, tag_id)
);

-- ─── OPTIONS ───────────────────────────────────────────────────────────────
CREATE TABLE public.options (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id      uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  text         text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 200),
  order_index  smallint NOT NULL DEFAULT 0,
  votes_count  integer NOT NULL DEFAULT 0
);

-- ─── VOTES ─────────────────────────────────────────────────────────────────
CREATE TABLE public.votes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id     uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id   uuid NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location    user_location NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);

-- ─── PROFILES ──────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         user_role NOT NULL DEFAULT 'anon',
  location     user_location,
  created_at   timestamptz NOT NULL DEFAULT now()
);
