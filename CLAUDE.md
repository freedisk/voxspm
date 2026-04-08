# VoxSPM — claude.md

> Application de sondage public citoyen pour Saint-Pierre-et-Miquelon.
> Chaque vote est géo-tagué (Saint-Pierre / Miquelon / Extérieur).

- **Repo** : github.com/freedisk/voxspm
- **Prod** : https://voxspm.vercel.app

---

## Stack

| Couche | Tech |
|--------|------|
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 (`@theme inline`, CSS variables) |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (anonymous + email) |
| Realtime | Supabase Realtime |
| Deploy | Vercel (auto via GitHub push) |

---

## Mode de travail

- **Claude AI** (claude.ai) = architecte, prompts, review, debug
- **Claude Code** (CLI) = exécution uniquement
- Jamais de code direct. Toujours : prompt → build ✅ → commit → test.

---

## Commandes

```bash
npm run dev       # Dev :3000
npm run build     # Build (vérifier avant push)
```

À la fin de chaque prompt Claude Code : `npm run build` doit passer ✅.

---

## Règles structurantes

1. **Server Components par défaut** — `'use client'` uniquement si interactivité/hooks requis.
2. **Server Actions** pour toutes les mutations — jamais d'API Routes custom (sauf `/api/propose` qui utilise service role).
3. **TypeScript strict** — pas de `any`.
4. **GeoContext** est la source de vérité localisation. Utiliser `useGeo()` — **jamais** `useGeoLocation()` directement dans les composants.
5. **SessionProvider** crée la session anonyme côté CLIENT (`signInAnonymously()`). Ne jamais appeler `signInAnonymously()` dans un Server Action.
6. **Compteurs dénormalisés** (`total_votes`, `votes_count`, `votes_sp/miq/ext`) maintenus par triggers DB — ne jamais les update manuellement.
7. **Slug généré côté DB** (trigger) — ne pas le générer côté Next.js.
8. **PollCard = Server Component** — hover via CSS `.poll-card-hover`. PollCardLive = Client Component avec Realtime.
9. **Géo-couleurs** fixes et sémantiques (non interchangeables) : SP=`#1A6FB5` | Miq=`#0C9A78` | Ext=`#6B4FA0`.
10. **Propositions** passent par `/api/propose` (service role, bypass RLS), pas par Server Action.
11. **GeoContext persist** utilise `update()` (pas `upsert`) — le profil est créé par trigger `handle_new_user`.
12. **PollEditor `isEditable`** : `total_votes === 0 && status !== 'archived'` — calculé serveur dans `getPollWithOptions()`.
13. **Admin** : middleware redirige non-admin vers `/admin/login` (pas `/`).

---

## Fichiers protégés — NE JAMAIS MODIFIER SAUF DEMANDE EXPLICITE

```
src/lib/hooks/**
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/admin.ts
src/lib/actions/admin.ts
src/lib/constants.ts
src/lib/context/GeoContext.tsx
src/lib/context/SessionProvider.tsx
src/app/admin/**
src/app/api/**
src/app/api/propose/check-limit/**
supabase/migrations/**
middleware.ts
```

---

## Décisions architecturales non révisables

- **Rate limiting propositions** : max 3 pending par `user_id`. Check côté serveur (429 + code `RATE_LIMIT_EXCEEDED`)
  ET côté client (checkLimit proactif). `user_id` persisté à l'INSERT via `user?.id ?? null`.
- **WelcomeModal** : tracking première visite via localStorage (clé `voxspm_welcome_seen`). Communication
  cross-component via custom event window `'voxspm:open-welcome'`.
- **Page `/contact`** : remplace définitivement les missions initiales P2.1/P2.2/P2.3/P2.4. Ne pas recréer
  de pages séparées À propos / Charte / Mentions légales / Formulaire contact.

---

## Conventions de code

- Nommage : `PascalCase` composants, `camelCase` hooks/actions, `snake_case` tables DB
- Commentaires : expliquer le POURQUOI, jamais le QUOI
- Gestion d'erreurs Server Actions : retourner `{ success, error?, code? }`
- Codes erreur : `LOCATION_REQUIRED` | `ALREADY_VOTED` | `POLL_INACTIVE` | `NOT_ADMIN` | `RATE_LIMITED`

---

## Documentation détaillée (lire à la demande)

⚠️ Ne lire ces fichiers QUE si la mission le requiert. Sinon, les ignorer.

| Fichier | Contenu |
|---------|---------|
| `docs/ARCHITECTURE.md` | Arbre dossiers, pages & routing, composants clés, Server Actions, middleware, Realtime |
| `docs/DATABASE.md` | Schéma SQL complet, triggers, seed, RLS policies, variables env, commandes CLI |
| `docs/DESIGN_SYSTEM.md` | Palette, typographie, ombres, rayons, géo-couleurs, notes design |
| `docs/ROADMAP.md` | Priorités MVP (P0/P1/P2) |

---

*VoxSPM · claude.md v2.0 slim · Avril 2026*
