# VoxSPM — Architecture détaillée

> Lu à la demande quand la session traite de l'architecture, des
> composants, du routing ou des Server Actions.

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

> Toujours unsubscribe dans le cleanup du useEffect.
