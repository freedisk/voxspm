# VoxSPM — Base de données

> Lu à la demande quand la session touche à la DB, aux migrations,
> à la sécurité RLS ou aux variables d'environnement.

---

## 4. BASE DE DONNÉES — SCHÉMA COMPLET

### 4.1 Tables

```sql
-- ─── TAGS (many-to-many avec polls) ───────────────────────────────────────
CREATE TABLE public.tags (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  slug         text NOT NULL UNIQUE,          -- ex: "environnement"
  color        text NOT NULL DEFAULT '#1B7FC4', -- hex couleur badge
  icon         text NOT NULL DEFAULT '🏷️',    -- emoji
  order_index  smallint NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── POLLS ────────────────────────────────────────────────────────────────
CREATE TYPE poll_status AS ENUM ('pending', 'active', 'archived');

CREATE TABLE public.polls (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question        text NOT NULL CHECK (char_length(question) BETWEEN 10 AND 300),
  description     text,
  slug            text UNIQUE,                -- généré auto depuis question
  status          poll_status NOT NULL DEFAULT 'pending',
  proposer_name   text,                       -- pseudonyme libre, nullable
  proposed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  proposed_at     timestamptz NOT NULL DEFAULT now(),
  validated_at    timestamptz,
  expires_at      timestamptz,               -- null = pas d'expiration auto
  total_votes     integer NOT NULL DEFAULT 0, -- dénormalisé via trigger
  votes_sp        integer NOT NULL DEFAULT 0, -- Saint-Pierre
  votes_miq       integer NOT NULL DEFAULT 0, -- Miquelon
  votes_ext       integer NOT NULL DEFAULT 0  -- Extérieur
);

-- ─── POLL_TAGS (jointure many-to-many) ───────────────────────────────────
CREATE TABLE public.poll_tags (
  poll_id  uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  tag_id   uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (poll_id, tag_id)
);

-- ─── OPTIONS ──────────────────────────────────────────────────────────────
CREATE TABLE public.options (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id      uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  text         text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 200),
  order_index  smallint NOT NULL DEFAULT 0,
  votes_count  integer NOT NULL DEFAULT 0    -- dénormalisé via trigger
);

-- ─── VOTES ────────────────────────────────────────────────────────────────
CREATE TYPE user_location AS ENUM ('saint_pierre', 'miquelon', 'exterieur');

CREATE TABLE public.votes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id     uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id   uuid NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location    user_location NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)                  -- anti-doublon DB level
);

-- ─── PROFILES ─────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('anon', 'admin');

CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         user_role NOT NULL DEFAULT 'anon',
  location     user_location,               -- null jusqu'au choix modal
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

### 4.2 Triggers

```sql
-- ─── 1. Auto-create profile quand un user Supabase est créé ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'anon')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. Après INSERT vote → update compteurs ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter options.votes_count
  UPDATE public.options
  SET votes_count = votes_count + 1
  WHERE id = NEW.option_id;

  -- Incrémenter polls.total_votes + compteur géo
  UPDATE public.polls
  SET
    total_votes = total_votes + 1,
    votes_sp  = votes_sp  + CASE WHEN NEW.location = 'saint_pierre' THEN 1 ELSE 0 END,
    votes_miq = votes_miq + CASE WHEN NEW.location = 'miquelon'     THEN 1 ELSE 0 END,
    votes_ext = votes_ext + CASE WHEN NEW.location = 'exterieur'    THEN 1 ELSE 0 END
  WHERE id = NEW.poll_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_inserted
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vote();

-- ─── 3. Auto-générer slug depuis question ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_poll_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL THEN
    base_slug := lower(regexp_replace(
      translate(NEW.question,
        'àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞ',
        'aaaaaaaceeeeiiiidnoooooouuuuytya aaaaaaaceeeeiiiidnoooooouuuuyt'
      ),
      '[^a-z0-9\s-]', '', 'g'
    ));
    base_slug := trim(regexp_replace(base_slug, '\s+', '-', 'g'));
    base_slug := left(base_slug, 60);
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.polls WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_poll_insert_slug
  BEFORE INSERT ON public.polls
  FOR EACH ROW EXECUTE FUNCTION public.generate_poll_slug();
```

### 4.3 Seed — Tags initiaux SPM

```sql
INSERT INTO public.tags (name, slug, color, icon, order_index) VALUES
  ('Environnement', 'environnement', '#10A585', '🌿', 1),
  ('Transport',     'transport',     '#1B7FC4', '🚌', 2),
  ('Culture',       'culture',       '#7B5EA7', '🎭', 3),
  ('Urbanisme',     'urbanisme',     '#E8A020', '🏗️', 4),
  ('Économie',      'economie',      '#D94F4F', '💼', 5),
  ('Social',        'social',        '#10A585', '🤝', 6),
  ('Éducation',     'education',     '#1B7FC4', '📚', 7),
  ('Santé',         'sante',         '#1CA87A', '🏥', 8),
  ('Autre',         'autre',         '#4B5F7C', '📌', 9);
```

---

## 5. RLS POLICIES

```sql
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

-- ── POLL_TAGS ──────────────────────────────────────────────────────────────
CREATE POLICY "poll_tags_public_read" ON public.poll_tags FOR SELECT USING (true);
CREATE POLICY "poll_tags_admin_write" ON public.poll_tags FOR ALL    USING (public.is_admin());

-- ── POLLS ──────────────────────────────────────────────────────────────────
-- Lecture publique : seulement les sondages actifs
CREATE POLICY "polls_public_read" ON public.polls
  FOR SELECT USING (status = 'active');

-- Proposition : tout utilisateur authentifié (anon ou non) peut proposer
-- Le status est forcé à 'pending' par le Server Action — jamais côté client
CREATE POLICY "polls_authenticated_insert" ON public.polls
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND status = 'pending'
  );

-- Admin : lecture + modification complète
CREATE POLICY "polls_admin_all" ON public.polls
  FOR ALL USING (public.is_admin());

-- ── OPTIONS ────────────────────────────────────────────────────────────────
CREATE POLICY "options_public_read" ON public.options
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND status = 'active')
  );

CREATE POLICY "options_admin_all" ON public.options
  FOR ALL USING (public.is_admin());

-- ── VOTES ──────────────────────────────────────────────────────────────────
-- INSERT : utilisateur authentifié, son propre user_id, sondage actif
CREATE POLICY "votes_authenticated_insert" ON public.votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND status = 'active')
  );

-- Lecture propre : chaque user voit ses propres votes (pour détecter a-t-il voté)
CREATE POLICY "votes_own_read" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

-- Admin : lecture complète
CREATE POLICY "votes_admin_read" ON public.votes
  FOR SELECT USING (public.is_admin());

-- ── PROFILES ───────────────────────────────────────────────────────────────
-- Chaque utilisateur lit et modifie son propre profil
CREATE POLICY "profiles_own_read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admin : lecture complète
CREATE POLICY "profiles_admin_read" ON public.profiles FOR SELECT USING (public.is_admin());
```

---

## 6. VARIABLES D'ENVIRONNEMENT

### `.env.example`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Admin (pour créer le compte admin via script seed)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # JAMAIS côté client

# App
NEXT_PUBLIC_APP_URL=https://voxspm.pm     # URL production
NEXT_PUBLIC_APP_NAME=VoxSPM
```

> `SUPABASE_SERVICE_ROLE_KEY` n'est utilisé que dans les scripts de migration/seed, jamais exposé au client.

---

## 7. COMMANDES CLI

```bash
# Développement
npm run dev                          # Lance Next.js sur :3000

# Supabase local
supabase start                       # Démarre l'instance locale
supabase db reset                    # Reset + rejoue toutes les migrations
supabase db push                     # Push migrations vers le projet remote
supabase migration new <nom>         # Crée une nouvelle migration

# Déploiement
git push origin main                 # → Vercel deploy automatique
vercel env pull .env.local           # Sync variables depuis Vercel

# Créer le compte admin (une seule fois, en production)
# Via Supabase Dashboard → Authentication → Users → Create user
# Puis via SQL Editor :
# UPDATE public.profiles SET role = 'admin' WHERE id = '<user-id>';
```
