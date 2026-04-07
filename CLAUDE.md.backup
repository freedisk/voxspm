# VoxSPM — claude.md

> **Application de sondage public citoyen pour Saint-Pierre-et-Miquelon**  
> Lire ce fichier en entier avant d'écrire la moindre ligne de code.

---

## 1. CONTEXTE PROJET

**VoxSPM** est une application web de sondage public destinée aux citoyens de Saint-Pierre-et-Miquelon et à la diaspora SPM. Elle permet de consulter des sondages actifs, d'y répondre, et d'en proposer de nouveaux. Un administrateur unique modère les propositions.

**Particularité forte** : chaque vote est géo-tagué (Saint-Pierre / Miquelon / Extérieur) via déclaration volontaire de l'utilisateur. La répartition géographique est affichée sur chaque sondage — c'est la signature visuelle distincte de l'app.

**Objectif MVP** : fonctionnel, déployé, utilisable. P0 uniquement pour le premier déploiement.

---

## 2. STACK TECHNIQUE

| Couche | Technologie | Version |
|--------|------------|---------|
| Frontend | Next.js (App Router) | 16.x |
| Styling | Tailwind CSS (v4, CSS-based config) | 4.x |
| Backend/DB | Supabase (PostgreSQL) | JS v2 |
| Auth | Supabase Auth (anonymous + email) | — |
| Realtime | Supabase Realtime | — |
| Storage | — (pas d'images dans cette version) | — |
| Deploy | Vercel | — |
| CI/CD | GitHub → Vercel (auto) | — |
| Dev assistant | Claude Code (CLI) | — |

---

## 3. ARCHITECTURE DOSSIERS

```
voxspm/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # RootLayout — Google Fonts, Providers
│   │   ├── globals.css             # Tailwind v4 @theme, CSS variables, animations
│   │   ├── page.tsx                # / → Hero + liste sondages actifs + FAB mobile
│   │   ├── poll/
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # /poll/[slug] → détail sondage + vote
│   │   ├── api/
│   │   │   └── propose/
│   │   │       └── route.ts        # POST /api/propose — service role, bypass RLS
│   │   ├── proposer/
│   │   │   └── page.tsx            # /proposer → formulaire proposition (fetch /api/propose)
│   │   └── admin/
│   │       ├── layout.tsx          # AdminLayout — auth guard + AdminShell
│   │       ├── login/
│   │       │   └── page.tsx        # /admin/login → formulaire email/password
│   │       ├── page.tsx            # /admin → dashboard stats + table sondages
│   │       ├── polls/
│   │       │   └── [id]/
│   │       │   └── page.tsx        # /admin/polls/[id] → édition sondage
│   │       └── tags/
│   │           └── page.tsx        # /admin/tags → gestion tags
│   ├── components/
│   │   ├── ui/                     # Composants atomiques
│   │   │   ├── Button.tsx          # 4 variantes, loading, min-h 44px
│   │   │   ├── Badge.tsx           # Pill coloré pour tags
│   │   │   ├── ProgressBar.tsx     # Barre animée avec leader highlight
│   │   │   └── Modal.tsx           # div overlay fixed inset-0, Escape, body lock
│   │   ├── polls/                  # Composants métier
│   │   │   ├── PollCard.tsx        # Card Server Component (statique, hover CSS)
│   │   │   ├── PollCardLive.tsx    # Card Client Component avec Realtime + animations voxPulse
│   │   │   ├── VoteForm.tsx        # Radio custom 18px + bouton vote
│   │   │   ├── ResultsBars.tsx     # Barres résultats (leader 8px, ranked colors, pulsedOptionId)
│   │   │   ├── GeoBreakdown.tsx    # Répartition SP/Miq/Ext (compact + full)
│   │   │   └── TagFilter.tsx       # Pills scrollables, multi-select URL
│   │   ├── pages/                  # Wrappers client pour les pages SSR
│   │   │   ├── HomeClient.tsx      # TagFilter interactif + router.replace
│   │   │   └── PollDetailClient.tsx # Vote + Realtime + GeoModal
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Glassmorphism, logo dégradé, pill géo (useGeo())
│   │   │   ├── Hero.tsx            # Hero section avec stats, eyebrow, gradient
│   │   │   ├── GeoModal.tsx        # 3 choix localisation, useGeo() → updateAndPersistLocation()
│   │   │   ├── Footer.tsx          # Footer sombre #0A1628, liens, copyright
│   │   │   └── Providers.tsx       # SessionProvider + GeoProvider + GeoModal auto
│   │   └── admin/
│   │       ├── AdminShell.tsx      # Nav admin + déconnexion
│   │       ├── PollsTable.tsx      # Table filtrable + actions contextuelles
│   │       ├── PollEditor.tsx      # Édition sondage — mode éditable vs lecture (isEditable)
│   │       ├── StatsCards.tsx      # 4 métriques + GeoBreakdown global
│   │       └── TagsManager.tsx     # CRUD inline + slug auto
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # createBrowserClient()
│   │   │   ├── server.ts           # createServerClient() — SSR
│   │   │   ├── admin.ts            # createClient service role (bypass RLS, API Routes only)
│   │   │   └── middleware.ts       # updateSession() + auth admin + x-pathname
│   │   ├── context/
│   │   │   ├── GeoContext.tsx      # GeoProvider + useGeo() — persist via client browser direct
│   │   │   └── SessionProvider.tsx # Session anonyme au montage (signInAnonymously côté client)
│   │   ├── hooks/
│   │   │   ├── useVote.ts          # Vérifie vote existant (RLS)
│   │   │   ├── useGeoLocation.ts   # Lit/écrit profiles.location (utilisé par useGeo)
│   │   │   └── useRealtimeVotes.ts # Subscriptions Realtime (ref stable, pollId seul en dep)
│   │   └── actions/
│   │       ├── polls.ts            # vote (Server Action) — proposePoll/updateUserLocation stubées (client direct)
│   │       └── admin.ts            # validate/archive/reactivate/delete/updatePoll/getPollWithOptions/updatePollOptions + CRUD tags
│   └── middleware.ts               # /admin/login bypass + admin guard
├── supabase/
│   ├── migrations/             # Migrations SQL versionnées
│   │   ├── 001_schema.sql
│   │   ├── 002_rls.sql
│   │   ├── 003_triggers.sql
│   │   └── 004_rls_anon_proposals.sql  # RLS INSERT polls/options pour authenticated
│   └── seed.sql                # Tags initiaux SPM
├── public/
├── .env.local                  # Variables locales (ne pas commiter)
├── .env.example
├── tailwind.config.ts
├── claude.md                   # CE FICHIER
└── package.json
```

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

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` n'est utilisé que dans les scripts de migration/seed, jamais exposé au client.

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

---

## 8. DESIGN SYSTEM — Apple Civic Light

**Theme** : light, minimaliste, Apple-style. Défini dans `globals.css` via CSS variables + `@theme inline`.

**Typographie** :
- Titres : `Instrument Serif` (italic pour les accents) — chargé via `<link>` dans layout.tsx
- Corps : `DM Sans` (300/400/500/600)

```css
/* Palette — globals.css :root */
--white: #FFFFFF;
--off-white: #F5F7FA;        /* fond app */
--surface: #FFFFFF;           /* cards */
--surface-2: #F2F4F8;
--surface-3: #E8ECF2;
--text-primary: #0A1628;
--text-secondary: #3D506A;
--text-muted: #8A9BB0;
--border: rgba(0,0,0,0.07);
--border-strong: rgba(0,0,0,0.12);
--ocean: #1A6FB5;             /* accent principal */
--ocean-light: #2E8ED4;
--ocean-glow: rgba(26,111,181,0.12);
--miq: #0C9A78;               /* Miquelon */
--ext: #6B4FA0;               /* Extérieur */
--success: #1CA87A;
--warning: #E8A020;
--danger: #D94F4F;
```

**Ombres** : `--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-xl`
**Rayons** : `--radius: 16px` / `--radius-sm: 10px` / `--radius-lg: 24px` / `--radius-pill: 100px`

**Géo-couleurs (non interchangeables) :**
```
Saint-Pierre → #1A6FB5 (ocean)
Miquelon     → #0C9A78 (miq)
Extérieur    → #6B4FA0 (ext)
```

**Notes design** :
- PollCard : hover lift -3px + accent line dégradé ocean→miq (CSS class `.poll-card-hover`)
- ResultsBars : leader 8px ocean, 2nd #93C5E8, reste #CBD5E1
- Header : glassmorphism `blur(20px) saturate(180%)`
- Pas de `tailwind.config.ts` — Tailwind v4 utilise `@theme inline` dans CSS

---

## 9. PAGES & ROUTING

### Page `/` — Liste sondages
- **Rendu** : SSR (données fraîches à chaque requête)
- **Données** : `polls` WHERE status='active' + `poll_tags` + `tags` + `options` (sans votes individuels)
- **Tri** : `proposed_at DESC` (plus récent en premier)
- **Filtre** : par tag(s) via query param `?tag=transport`
- **Composant principal** : `<TagFilter />` + liste de `<PollCard />`
- **Realtime** : non (liste — le refresh manuel suffit pour MVP)

### Page `/poll/[slug]` — Détail sondage
- **Rendu** : SSR + Client hydration pour Realtime
- **Données** :
  - Le sondage + ses options + ses tags
  - Le vote de l'utilisateur courant (depuis `votes` WHERE user_id = session)
- **Comportement** :
  - Si `profile.location` null → afficher `<GeoModal />` avant tout
  - Si non voté → afficher `<VoteForm />`
  - Résultats toujours visibles (avant ET après vote)
  - `<GeoBreakdown />` : barres SP / Miq / Ext toujours visibles
- **Realtime** : subscription sur `options` (votes_count) + `polls` (votes_sp/miq/ext)

### Page `/proposer` — Formulaire proposition
- **Rendu** : Client component
- **Champs** :
  - `question` (textarea, 10-300 chars, obligatoire)
  - `proposer_name` (input text, optionnel, max 50 chars, placeholder "Anonyme")
  - `tags` (multi-select, optionnel, max 3 tags)
  - `options` (liste dynamique, 2 minimum, 6 maximum, texte max 200 chars)
- **Validation** : Zod côté client + Server Action
- **Submit** : Server Action `proposePoll()` → insert status='pending'
- **Post-submit** : Message de confirmation "Merci ! Votre proposition sera examinée sous 48h."

### Layout `/admin` — Dashboard admin
- **Auth guard** : middleware Next.js vérifie session + profil role='admin'
- **Redirect** si non-admin : `/`

### Page `/admin` — Dashboard principal
- Stats globales (actifs / pending / archivés / votes total / répartition géo globale)
- Table paginée de tous les sondages (50 par page)
- Filtres : tous / actifs / pending / archivés
- Recherche : par texte de question
- Actions par ligne : Valider · Éditer · Archiver · Supprimer

### Page `/admin/polls/[id]` — Édition sondage
- Modifier question, options, tags, proposer_name, expires_at
- Changer le statut (pending → active, active → archived, etc.)
- Voir les stats détaillées du sondage

### Page `/admin/tags` — Gestion des tags
- CRUD complet : créer / renommer / changer couleur + icône / supprimer
- Réordonner (drag & drop optionnel, ou champ order_index)
- Compteur : "X sondages utilisent ce tag"

---

## 10. COMPOSANTS CLÉS — COMPORTEMENTS

### `<GeoModal />`
```
Trigger : profile.location === null (première visite ou session fraîche)
Bloque l'interaction tant que non choisi
3 options : Saint-Pierre | Miquelon | Je suis ailleurs
Action : appelle updateAndPersistLocation() du GeoContext → DB + state partagé sync
Stockage : dans le profil Supabase (persistant par browser via session anon)
Fermable avec "Plus tard" → location reste null, modal réapparaît à la prochaine visite
Utilise useGeo() — NE PAS utiliser useGeoLocation() directement
```

### `<PollCard />`
```
Props : slug, question, total_votes, proposed_at, proposer_name, tags, options, votes_sp, votes_miq, votes_ext
Composant Server (pas de 'use client') — hover via CSS class .poll-card-hover
Structure verticale :
  1. Badges tags (Badge component)
  2. Question Instrument Serif, texte complet (pas de troncature)
  3. Barres résultats : pct = option.votes_count / total_votes, barre 8px #1A6FB5
  4. Séparateur border-t
  5. Geo breakdown mini : 3 barres 4px (SP=#1A6FB5, Miq=#0C9A78, Ext=#6B4FA0)
  6. Ligne bas : meta + badge Live animé + CTA "Participer →" → /poll/[slug]
```

### `<VoteForm />`
```
Affiché si : sondage actif ET user n'a pas encore voté sur ce sondage
Vérification has_voted : SELECT * FROM votes WHERE poll_id=X AND user_id=Y (RLS)
Si location null → déclencher GeoModal avant de soumettre
Submit → Server Action vote() → INSERT INTO votes
Anti-doublon : DB UNIQUE(poll_id, user_id) + catch error code '23505'
Post-vote : mettre à jour l'UI localement (optimistic update) puis revalidate
```

### `<GeoBreakdown />`
```
Props : { votes_sp, votes_miq, votes_ext, total_votes }
Toujours visible (avant et après vote)
Si total_votes === 0 → afficher "Aucun vote pour l'instant"
Couleurs fixes : SP=#1B7FC4 | Miq=#10A585 | Ext=#7B5EA7
```

### `<ResultsBars />`
```
Props : { options: { text, votes_count }[], total_votes }
Barres de progression en % (votes_count / total_votes * 100)
Leader highlighted (option avec le + de votes)
Toujours visible
Realtime : subscription Supabase sur table options WHERE poll_id=X
```

### `<TagFilter />`
```
Barre horizontale scrollable, sticky sous le header
"Tous" + un bouton par tag (depuis query tags en DB)
Filtre par URL param : ?tag=transport (pour partageabilité)
Multi-select : ?tag=transport&tag=culture
```

---

## 11. SERVER ACTIONS

### `vote(pollId, optionId)` — `/lib/actions/polls.ts`
```typescript
// Vérifications dans cet ordre :
// 1. User authentifié (session Supabase)
// 2. Profile.location non null (sinon error 'LOCATION_REQUIRED')
// 3. Poll existe et est actif
// 4. Option appartient au poll
// 5. INSERT votes → catch unique violation (23505) → error 'ALREADY_VOTED'
// Pas besoin de revalidatePath car Realtime gère l'update UI
```

### `proposePoll(data)` — `/lib/actions/polls.ts`
```typescript
// Vérifications :
// 1. User authentifié
// 2. Validation Zod (question, options 2-6, proposer_name optionnel)
// 3. Rate limit : max 3 polls pending par user_id
// 4. INSERT polls (status='pending', proposed_by=auth.uid())
// 5. INSERT options (poll_id, text, order_index)
// 6. INSERT poll_tags si tags sélectionnés
// Return : { success: true }
```

### `getPollWithOptions(id)` — `/lib/actions/admin.ts`
```typescript
// Admin only — utilisé par /admin/polls/[id]
// Retourne : { poll, options, selectedTagIds, isEditable }
// isEditable = total_votes === 0 && status !== 'archived'
// Si isEditable false → PollEditor s'affiche en lecture seule (bannière ambrée)
```

### `updatePollOptions(pollId, options)` — `/lib/actions/admin.ts`
```typescript
// Admin only — guard server-side : vérifie total_votes=0 avant modification
// Supprime les options retirées, insère les nouvelles, met à jour les existantes
// Ne jamais appeler si total_votes > 0 (guard côté client ET serveur)
```

### `validatePoll(pollId)` — `/lib/actions/admin.ts`
```typescript
// Admin only (vérifier is_admin() en début de fonction)
// UPDATE polls SET status='active', validated_by=uid, validated_at=now()
// revalidatePath('/')
```

### `archivePoll(pollId)` — `/lib/actions/admin.ts`
```typescript
// Admin only
// UPDATE polls SET status='archived'
// revalidatePath('/')
```

### `deletePoll(pollId)` — `/lib/actions/admin.ts`
```typescript
// Admin only
// DELETE polls WHERE id=pollId (CASCADE → options + votes + poll_tags)
// revalidatePath('/admin')
```

### `updateUserLocation(location)` — `/lib/actions/polls.ts`
```typescript
// Mise à jour du profil utilisateur courant
// UPDATE profiles SET location = ... WHERE id = auth.uid()
```

---

## 12. MIDDLEWARE — AUTH ADMIN

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Protège toutes les routes /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Vérifier session + rôle admin
    // Si non-admin → redirect('/')
  }
  // Refresh session Supabase (obligatoire pour SSR)
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 13. REALTIME — ABONNEMENTS

```typescript
// useRealtimeVotes.ts
// S'abonner aux changements de votes_count sur les options d'un sondage
supabase
  .channel(`poll-${pollId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'options',
    filter: `poll_id=eq.${pollId}`
  }, (payload) => {
    // Mettre à jour l'état local des votes
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'polls',
    filter: `id=eq.${pollId}`
  }, (payload) => {
    // Mettre à jour votes_sp, votes_miq, votes_ext
  })
  .subscribe()
```

> ⚠️ Toujours unsubscribe dans le cleanup du useEffect.

---

## 14. PRIORITÉS MVP (P0 UNIQUEMENT POUR V1)

### ✅ P0 — V1 obligatoire
- [ ] Schéma DB + migrations + seed tags
- [ ] RLS policies complètes
- [ ] Session anonyme Supabase (createBrowserClient)
- [ ] Page `/` — liste sondages actifs + filtre par tag
- [ ] Page `/poll/[slug]` — détail + vote + résultats + géo-breakdown
- [ ] `<GeoModal />` — choix localisation 1ère visite
- [ ] Anti-doublon vote (DB + Server Action)
- [ ] Page `/proposer` — formulaire proposition
- [ ] Route `/admin` — dashboard + table sondages
- [ ] Admin : valider / archiver / supprimer sondages
- [ ] Admin : gestion tags (CRUD)
- [ ] Middleware auth admin
- [ ] Deploy Vercel + variables env configurées

### 🟡 P1 — V1.1 après stabilisation
- [ ] Realtime votes (barres animées sans reload)
- [ ] URL directe `/poll/[slug]` — OG tags SEO
- [ ] Admin : édition complète sondage avant validation
- [ ] Admin : expiration auto (expires_at + Edge Function cron)
- [ ] Rate limiting propositions (max 3 pending par user)
- [ ] Admin : stats détaillées par sondage

### 🔵 P2 — V2 future
- [ ] Export CSV résultats
- [ ] Stats globales avancées (courbe temporelle)
- [ ] Partage réseaux sociaux (FB/Twitter)
- [ ] Mise à jour localisation utilisateur depuis ses préférences

---

## 15. CONVENTIONS DE CODE

### Général
- **TypeScript strict** — pas de `any`
- **Server Components par défaut** — `'use client'` uniquement si nécessaire (interactivité, hooks)
- **Server Actions** pour toutes les mutations — jamais d'API Routes custom
- **Zod** pour toute validation de formulaire (côté client ET server action)
- **Pas de `useEffect` pour le data fetching** — utiliser les Server Components ou `useSWR` si nécessaire

### Nommage
```
Composants     : PascalCase   → PollCard.tsx
Hooks          : camelCase    → useVote.ts
Server Actions : camelCase    → proposePoll()
Tables DB      : snake_case   → poll_tags
CSS classes    : Tailwind utility classes uniquement
```

### Gestion d'erreurs
```typescript
// Dans les Server Actions : toujours retourner un objet typé
type ActionResult = 
  | { success: true; data?: unknown }
  | { success: false; error: string; code?: string }

// Codes d'erreur métier standardisés :
// 'LOCATION_REQUIRED'  → l'user n'a pas choisi sa localisation
// 'ALREADY_VOTED'      → doublon vote (23505)
// 'POLL_INACTIVE'      → sondage archivé ou pending
// 'NOT_ADMIN'          → tentative d'action admin sans droits
// 'RATE_LIMITED'       → trop de propositions
```

### Commentaires
```typescript
// WHY : expliquer la raison du choix, jamais le QUOI
// ✅ "// Anti-doublon : on catch 23505 plutôt que de vérifier en amont pour éviter la race condition"
// ❌ "// Insert vote in database"
```

---

## 16. NOTES IMPORTANTES

1. **Session anonyme Supabase** : `signInAnonymously()` doit être appelé au chargement de l'app si aucune session n'existe. La session est persistante par browser via localStorage (géré par Supabase JS SDK — pas par nous).

2. **Le slug est généré côté DB** (trigger) — ne pas le générer côté Next.js. Lire le slug retourné après INSERT.

3. **`status='pending'` est forcé dans le Server Action** et dans la RLS policy — le client ne peut jamais insérer un sondage avec un autre statut.

4. **Les compteurs dénormalisés** (`total_votes`, `votes_count`, `votes_sp/miq/ext`) sont maintenus par les triggers DB — ne jamais les mettre à jour manuellement depuis le code Next.js.

5. **Admin unique** : créé manuellement via Supabase Dashboard + SQL UPDATE profiles. Pas de formulaire d'inscription admin dans l'app.

6. **GeoContext** : source de vérité partagée pour la localisation utilisateur. `GeoProvider` wrap toute l'app dans `Providers.tsx`. Utiliser `useGeo()` dans Header, GeoModal, PollDetailClient — **ne jamais** instancier `useGeoLocation()` directement dans ces composants (cause des états désynchronisés).

7. **PollCard est un Server Component** — pas de `useState`/`useEffect`/event handlers JS. Les effets hover passent par la classe CSS `.poll-card-hover` définie dans `globals.css`.

8. **PollEditor `isEditable`** : calculé côté serveur dans `getPollWithOptions()`. Un sondage est éditable uniquement si `total_votes === 0 && status !== 'archived'`. Ce flag détermine si PollEditor affiche le formulaire complet ou la vue lecture seule (bannière ambrée + champs non interactifs).

9. **Géo-couleurs** : les 3 couleurs SP/Miq/Ext sont sémantiques et ne doivent pas être utilisées pour autre chose dans l'UI.

10. **SessionProvider** : crée la session anonyme Supabase côté CLIENT au montage (`signInAnonymously()`). Le cookie est posé dans le browser et lu par les Server Actions. Ne JAMAIS appeler `signInAnonymously()` dans un Server Action — le cookie ne se propage pas au navigateur.

11. **Propositions de sondage** : passent par l'API Route `/api/propose` (service role key, bypass RLS) et non par un Server Action. Le formulaire `/proposer` fait un `fetch('/api/propose')` directement.

12. **GeoContext persist** : utilise `supabase.from('profiles').update()` via le client browser, pas `upsert` (pas de policy RLS INSERT sur profiles). Le profil est créé par le trigger `handle_new_user`, seul `update` est nécessaire.

13. **PollCardLive** : version Client Component de PollCard avec `useRealtimeVotes` + animation `voxPulse` (pulse 800ms sur la barre qui reçoit un vote). Utilisé sur la page d'accueil au lieu de PollCard.

---

*VoxSPM · claude.md v1.1 · Avril 2026*  
*Lire ce fichier avant chaque session Claude Code.*
