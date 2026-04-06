-- ============================================================================
-- 002_rls.sql — VoxSPM : Row Level Security policies
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.polls     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_tags ENABLE ROW LEVEL SECURITY;

-- Helper : est-ce que l'utilisateur courant est admin ?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── TAGS ──────────────────────────────────────────────────────────────────
CREATE POLICY "tags_public_read"  ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags_admin_write"  ON public.tags FOR ALL    USING (public.is_admin());

-- ── POLL_TAGS ─────────────────────────────────────────────────────────────
CREATE POLICY "poll_tags_public_read" ON public.poll_tags FOR SELECT USING (true);
CREATE POLICY "poll_tags_admin_write" ON public.poll_tags FOR ALL    USING (public.is_admin());

-- ── POLLS ─────────────────────────────────────────────────────────────────
-- Lecture publique : seulement les sondages actifs
CREATE POLICY "polls_public_read" ON public.polls
  FOR SELECT USING (status = 'active');

-- Proposition : tout utilisateur authentifie peut proposer (status force a pending)
CREATE POLICY "polls_authenticated_insert" ON public.polls
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND status = 'pending'
  );

-- Admin : lecture + modification complete
CREATE POLICY "polls_admin_all" ON public.polls
  FOR ALL USING (public.is_admin());

-- ── OPTIONS ───────────────────────────────────────────────────────────────
CREATE POLICY "options_public_read" ON public.options
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND status = 'active')
  );

CREATE POLICY "options_admin_all" ON public.options
  FOR ALL USING (public.is_admin());

-- ── VOTES ─────────────────────────────────────────────────────────────────
-- INSERT : utilisateur authentifie, son propre user_id, sondage actif
CREATE POLICY "votes_authenticated_insert" ON public.votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND status = 'active')
  );

-- Lecture propre : chaque user voit ses propres votes
CREATE POLICY "votes_own_read" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

-- Admin : lecture complete
CREATE POLICY "votes_admin_read" ON public.votes
  FOR SELECT USING (public.is_admin());

-- ── PROFILES ──────────────────────────────────────────────────────────────
CREATE POLICY "profiles_own_read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_read" ON public.profiles FOR SELECT USING (public.is_admin());
