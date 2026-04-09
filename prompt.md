[SESSION FRESH RECOMMANDÉE] · [MODÈLE: SONNET REQUIS] · [BUILD: OBLIGATOIRE]

*Mission nouvelle feature Realtime admin — logique Realtime + state management + refactor server/client, pas d'improvisation possible avec Haiku. Build obligatoire pour valider le split.*

## CONTEXTE MINIMAL

Le dashboard `/admin` est actuellement 100% Server Component : fetch initial puis plus rien jusqu'au refresh manuel. JC veut que ça se mette à jour live comme la page publique (hooks `useLivePolls` et `useLiveStats` déjà en place côté public, pattern éprouvé).

Objectif : quand un user propose un sondage, il doit apparaître instantanément dans la liste admin avec un badge "✨ Nouveau" pulsant 5s. Les compteurs (pending/active/archived/totalVotes) doivent se recalculer live. Les votes qui montent doivent aussi se refléter dans les compteurs.

## FICHIERS AUTORISÉS

**À CRÉER :**
- `src/lib/hooks/useLiveAdminPolls.ts` (nouveau hook Realtime admin)
- `src/components/admin/AdminDashboardClient.tsx` (nouveau composant client wrapper)

**À MODIFIER :**
- `src/app/admin/page.tsx` (devient un simple server wrapper qui passe les données initiales au client)
- `src/components/admin/PollsTable.tsx` (ajouter prop optionnelle `newPollIds` + classe visuelle sur les rows concernées)

**À LIRE (uniquement pour copier le pattern, NE PAS MODIFIER) :**
- `src/lib/hooks/useLivePolls.ts` — pattern canonique Realtime du projet, à adapter
- `src/components/admin/PollsTable.tsx` — pour comprendre la structure des rows avant d'ajouter le badge

## FICHIERS INTERDITS

- `src/lib/hooks/useLiveStats.ts` (ne pas toucher, juste pour ta culture)
- `src/lib/context/**` (GeoContext, SessionProvider intouchables)
- `src/lib/supabase/**` (clients intouchables)
- `src/components/admin/StatsCards.tsx` (reçoit les props recalculées, aucune modif nécessaire)
- `src/app/admin/login/**`, `src/app/admin/polls/**`, `src/app/admin/tags/**`, `src/app/admin/layout.tsx`
- Tout autre fichier non listé dans AUTORISÉS

## COMMANDES INTERDITES

Ne **JAMAIS** lancer dans cette session :
- `npm run build` (JC le fait dans un terminal séparé)
- `git add` / `commit` / `push` (JC gère les commits manuellement)
- `git status` / `git diff` (inutile dans le contexte de la session)
- `npm run dev` (déjà lancé en arrière-plan par JC)

Tu te contentes d'éditer les fichiers et de fournir un récap final listant tous les fichiers créés et modifiés.

## ÉTAPES SÉQUENTIELLES

### Étape 1 — Lire le pattern canonique
Lire `src/lib/hooks/useLivePolls.ts` en entier. C'est la référence à adapter. Comprendre :
- Comment le channel Supabase est configuré
- Comment INSERT / UPDATE / DELETE sont gérés
- Comment le refetch complet est fait sur INSERT (pour récupérer les jointures tags)
- La signature de retour du hook

### Étape 2 — Lire `src/components/admin/PollsTable.tsx`
Comprendre la structure des rows pour savoir où injecter :
- La prop optionnelle `newPollIds?: Set<string>`
- Une classe CSS conditionnelle sur les rows dont l'ID est dans le Set (badge "✨ Nouveau" ou row highlighted ocean blue pulsante)

### Étape 3 — Créer `src/lib/hooks/useLiveAdminPolls.ts`
Hook client qui :
- Reçoit `initialPolls: PollWithTags[]` (même type que celui utilisé dans page.tsx actuellement)
- Retourne `{ polls, newPollIds }` où :
  - `polls` = liste React state synchronisée live (tous statuts confondus)
  - `newPollIds` = `Set<string>` des IDs de sondages récemment arrivés via INSERT, nettoyés après 5 secondes via setTimeout
- Channel Supabase : `admin-polls-live`
- Écoute la table `polls` sur tous les events (`*`), SANS filtre status (l'admin voit tout)
- Sur **INSERT** :
  - Refetch complet du poll avec sa jointure tags (même pattern que useLivePolls)
  - Ajouter en tête de liste
  - Ajouter l'ID au Set `newPollIds`
  - `setTimeout(() => retirer l'ID du Set, 5000)`
- Sur **UPDATE** :
  - Merger les nouvelles colonnes dans le poll correspondant de l'état local
  - Si le `status` a changé ou `proposed_at` a changé → refetch complet avec tags (cas rare mais possible lors d'une modif admin)
  - Pour les UPDATE venant du trigger vote (votes_sp/miq/ext/total_votes) → simple merge, pas de refetch
  - **Ne JAMAIS ajouter au Set newPollIds sur UPDATE** (le badge est réservé aux vrais INSERT)
- Sur **DELETE** : retirer de la liste

Copier scrupuleusement la structure de `useLivePolls.ts` (imports, types, cleanup du channel, gestion useEffect). Adapter uniquement : absence de filtre status, retour enrichi avec newPollIds.

### Étape 4 — Créer `src/components/admin/AdminDashboardClient.tsx`
Composant `'use client'` qui :
- Reçoit en props : `initialPolls: PollWithTags[]` (et optionnellement `initialTags` si nécessaire au typage)
- Appelle `useLiveAdminPolls(initialPolls)` → récupère `{ polls, newPollIds }`
- Recalcule via `useMemo` les stats à chaque changement de `polls` :
  - `activeCount`, `pendingCount`, `archivedCount`
  - `totalVotes`, `votes_sp`, `votes_miq`, `votes_ext`
- Rend exactement la même structure JSX que `page.tsx` actuellement :
```tsx
  <div className="flex flex-col gap-6">
    <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
    <StatsCards {...statsProps} />
    <h2 className="text-lg font-semibold text-foreground">Sondages</h2>
    <PollsTable polls={polls} newPollIds={newPollIds} />
  </div>
```

### Étape 5 — Refactor `src/app/admin/page.tsx`
La page reste un Server Component qui :
- Fait EXACTEMENT le même fetch qu'actuellement (polls + tags + transformation avec tagMap)
- **Ne calcule plus les stats** (c'est le client qui s'en charge maintenant)
- Rend uniquement `<AdminDashboardClient initialPolls={polls} />`
- Supprime l'import de `StatsCards` (plus utilisé directement ici)
- Garde l'import de `PollsTable` uniquement si nécessaire pour le typage, sinon supprime
- Supprime les variables de stats agrégées (activeCount, pendingCount, etc.)

### Étape 6 — Modifier `src/components/admin/PollsTable.tsx`
- Ajouter une prop optionnelle `newPollIds?: Set<string>` à l'interface
- Dans le render des rows, appliquer une classe conditionnelle si `newPollIds?.has(poll.id)` :
  - Animation pulse ocean blue (utiliser le bleu SP `#1A6FB5` en border ou background léger)
  - Petit badge "✨ Nouveau" à côté du titre ou du status
  - S'inspirer visuellement du badge "✨ Nouveau" déjà présent sur `PollCardLive` côté public si tu le trouves (mais ne modifie pas PollCardLive)
- L'animation doit être subtile mais visible 5 secondes (correspond à la durée du Set côté hook)
- Si `newPollIds` n'est pas fourni, comportement identique à l'existant (rétro-compat)

## POINTS DE VIGILANCE

- **Jointure tags sur INSERT** : Supabase Realtime ne renvoie PAS les jointures. Obligation de refetch le poll complet avec `.select('... poll_tags (tag_id)')` et re-mapper les tags via un tagMap local au hook (récupérer les tags une fois au montage du hook ou les passer en prop).
- **Double source du tagMap** : soit on refait un fetch des tags dans le hook, soit on les reçoit en prop depuis page.tsx. **Solution préférée** : les passer en prop `initialTags` à `AdminDashboardClient`, qui les passe au hook, qui les utilise pour mapper les tag_id lors du refetch d'un INSERT.
- **Typage strict** : garder le type `Poll` cohérent avec celui déjà défini dans `page.tsx` (avec status union, tags array, etc.). Si besoin, extraire le type dans un fichier commun — mais **seulement si c'est indispensable**, sinon dupliquer est acceptable pour éviter de toucher d'autres fichiers.
- **Cleanup du channel** : bien removeChannel dans le cleanup du useEffect, comme dans useLivePolls.
- **Pas de localStorage/sessionStorage** (règle projet).

## RÉCAPITULATIF DEMANDÉ EN FIN DE SESSION

À la fin, fournis :
1. Liste exacte des fichiers **créés** avec leur chemin
2. Liste exacte des fichiers **modifiés** avec leur chemin
3. Confirmation que `src/lib/hooks/useLivePolls.ts` et `src/components/admin/PollsTable.tsx` ont été **lus mais non modifiés** (sauf PollsTable qui doit être modifié)
4. Une mention explicite : **"Doc à mettre à jour : `docs/ARCHITECTURE.md` (nouveau hook `useLiveAdminPolls`, nouveau channel Realtime `admin-polls-live`, nouveau composant `AdminDashboardClient`, refactor `/admin/page.tsx` en server wrapper)."**
5. Aucun build, aucun git, aucun dev lancé.