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
---

## 🛠️ Dette technique

Items hors roadmap produit, à traiter opportunément entre deux missions.

- [ ] **Rename `middleware.ts` → `proxy.ts`** — deprecated en Next 16, deviendra une erreur en Next 17. Mission courte (rename + éventuel ajustement d'import dans la config Next).
- [ ] **Lockfile parasite dans `C:\Users\Pc\`** — un `package-lock.json` ou équivalent traîne à la racine du user Windows et déclenche un warning Turbopack au démarrage. À supprimer manuellement.
- [ ] **P1.5 Expiration auto sondages** — repoussé post-lancement. À réévaluer 2-3 mois après le lancement si le besoin émerge réellement. Alternative envisagée : champ `expires_at` optionnel côté admin, pas de cron automatique.
- [ ] **P2.6 Favicon pro + manifest PWA** — bonus optionnel, améliore l'expérience mobile et le partage.
- [ ] **LICENSE.md MIT à la racine** — 30 secondes, hygiène open source.
- [ ] **Admin : stats détaillées par sondage** — P1 résiduel, utile si un sondage polémique demande un debrief fin (cf. cas Jeune France).

---

## 📡 Feedback terrain post-lancement

Mode observation actif depuis le lancement (avril 2026). Les retours utilisateurs et polémiques sont trackés ici jusqu'à ce qu'ils soient traités ou classés.

### Incidents résolus

- **Polémique Maïté Légasse — sondage Jeune France (J0)**
  Première polémique publique Facebook sur la formulation d'un sondage concernant le remplacement du bâtiment Jeune France. Résolue en publiant en parallèle un **second sondage miroir neutre** plutôt qu'en modifiant le premier (préservation de l'intégrité des votes déjà exprimés). Leçon retenue : toujours prévoir un sondage miroir neutre quand la formulation initiale est contestée, ne jamais éditer un sondage qui a déjà des votes (cf. règle `isEditable = total_votes === 0 && status !== 'archived'`).

### Points de vigilance en cours

- Surveillance du ratio propositions acceptées / rejetées pour ajuster la **charte de modération** si besoin.
- Surveillance des formulations polémiques à l'arrivée (propositions utilisateurs) — le modérateur doit garder en tête la possibilité de reformuler neutre avant validation plutôt que rejeter sec.
- Surveillance de l'usage du rate limit (`MAX_PENDING_PROPOSALS = 3`) : si beaucoup de users le heurtent, envisager d'augmenter ou d'ajuster.

### Métriques J+1 (pour mémoire)

- 231+ votes cumulés
- 11 sondages actifs
- 8 propositions utilisateurs validées
- 3 channels Realtime publics + 1 channel Realtime admin opérationnels

---

*VoxSPM · claude.md v2.3 slim · Avril 2026*
post lancement + dette trackée
