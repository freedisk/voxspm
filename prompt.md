[SESSION FRESH RECOMMANDÉE] · [MODÈLE: SONNET REQUIS] · [BUILD: OBLIGATOIRE]

Mission : ajouter la synchronisation Realtime des polls sur HomeClient
pour que les nouveaux sondages validés (pending→active) apparaissent
automatiquement en haut de la liste sans reload, avec un badge "Nouveau"
éphémère, et que les sondages archivés disparaissent. Réordonnancement
si la date de création change.

═══════════════════════════════════════════════════
CONTEXTE
═══════════════════════════════════════════════════

VoxSPM est en prod. HomeClient est déjà owner du state `polls`
(update optimiste post-vote). Aujourd'hui, quand l'admin valide un
sondage proposé (status pending→active), il faut un reload manuel
pour le voir apparaître sur la home. Idem si un sondage est archivé.

Cette mission ajoute un abonnement Realtime sur la table `polls`
pour synchroniser le state local en temps réel, dans le même esprit
que useLiveStats (qui marche déjà en prod).

CONTRAINTES MÉTIER CRITIQUES :
- Un sondage UPDATE pending→active → fetch complet du poll (avec
  ses options, tags, et tout ce dont PollCardLive a besoin) puis
  ajout en haut de la liste
- Un sondage UPDATE active→archived → suppression du state local
- Un sondage UPDATE active→pending (rollback admin) → suppression
  du state local
- Un sondage UPDATE active→active où created_at a changé →
  réordonnancement (rare mais possible si l'admin édite la date)
- Tous les autres UPDATE (vote trigger qui modifie total_votes,
  updated_at, etc.) → NO-OP, ne PAS refetch ni réordonner
- Un sondage INSERT direct en status active (cas rare) → fetch +
  ajout en haut

ATTENTION : ne PAS toucher à la logique de vote optimiste existante
dans HomeClient. La nouvelle logique Realtime polls vit en parallèle
de useRealtimeVotes / des handlers de vote.

═══════════════════════════════════════════════════
ÉTAPE 1 — LECTURE (lecture seule)
═══════════════════════════════════════════════════

1. Lire src/components/HomeClient.tsx pour comprendre :
   - Comment le state polls est typé (Poll[] ou similaire)
   - Comment les polls sont triés (par created_at desc ?)
   - Où sont les handlers actuels (vote optimiste, etc.)
   - Comment PollCardLive est rendu dans la liste

2. Lire src/lib/hooks/useLiveStats.ts pour confirmer le pattern
   Realtime à suivre (channel, ref stable client, cleanup,
   initialisation au mount).

3. Lire src/lib/supabase/client.ts (consultation uniquement) pour
   confirmer le browser client utilisé.

4. Identifier dans src/lib/ la fonction qui FETCH un poll complet
   avec ses relations (options, tags, votes count). Cette fonction
   sera réutilisée pour récupérer le sondage fraîchement validé.
   Si elle n'existe pas en version client, signaler dans le récap
   et créer un fetcher minimal dans le hook lui-même (utilise le
   browser client + .select() avec les jointures nécessaires).

À la fin de l'étape 1, AFFICHE EN UNE PHRASE :
- le nom du type Poll utilisé
- la fonction de fetch identifiée (ou la stratégie de fallback)
- la stratégie de tri actuelle de la liste

PUIS PASSE À L'ÉTAPE 2.

═══════════════════════════════════════════════════
ÉTAPE 2 — CRÉATION DU HOOK useLivePolls
═══════════════════════════════════════════════════

Créer src/lib/hooks/useLivePolls.ts sur le modèle de useLiveStats :

Signature :
```ts
function useLivePolls(
  initialPolls: Poll[],
  onNewPoll?: (pollId: string) => void
): Poll[]
```

- initialPolls : valeurs SSR (vient de page.tsx via HomeClient props)
- onNewPoll : callback optionnel appelé quand un nouveau poll arrive,
  utilisé pour déclencher l'affichage du badge "Nouveau" côté UI
- Retourne : liste de polls à jour, triée par created_at desc

Logique interne :
1. useRef stable du Supabase browser client
2. useState<Poll[]> initialisé avec initialPolls
3. useRef<Set<string>> pollIdsRef pour tracker les IDs déjà connus
   (init avec les IDs de initialPolls)
4. useEffect au mount :
   - S'abonner au channel 'home-polls-live'
   - Écouter polls INSERT et polls UPDATE
   - Cleanup avec removeChannel + reset du Set

Handler INSERT polls :
- Si new.status === 'active' ET id pas dans pollIdsRef
  → fetch complet du poll
  → ajout en tête du state, tri par created_at desc
  → pollIdsRef.add(id)
  → appel onNewPoll(id) si fourni

Handler UPDATE polls :
- Récupérer new.id et new.status
- CAS 1 : new.status === 'active' ET id pas dans pollIdsRef
  → c'est une validation pending→active
  → fetch complet du poll
  → ajout + tri + add Set + onNewPoll
- CAS 2 : new.status === 'archived' ET id dans pollIdsRef
  → retirer du state, retirer du Set
- CAS 3 : new.status === 'pending' ET id dans pollIdsRef
  → rollback admin, retirer du state, retirer du Set
- CAS 4 : new.status === 'active' ET id DANS pollIdsRef
  → vérifier si created_at a changé (compare avec le poll en state)
  → si oui : mise à jour du poll dans le state + re-tri
  → si non : NO-OP (c'est le trigger vote)
- TOUS LES AUTRES CAS : NO-OP

Fetcher de poll :
- Utiliser le Supabase browser client avec une query SELECT qui
  reproduit la structure attendue par PollCardLive (options, tags,
  comptage de votes initiaux à 0 ou via la jointure si déjà en place)
- Si tu identifies une fonction réutilisable côté lib, l'importer
- Sinon créer le fetcher inline dans le hook (privé au hook)

═══════════════════════════════════════════════════
ÉTAPE 3 — INTÉGRATION DANS HomeClient
═══════════════════════════════════════════════════

Modifier src/components/HomeClient.tsx :

1. Importer useLivePolls
2. Remplacer le useState<Poll[]> initial par :
   - useState<Set<string>> newPollIds (pour le badge éphémère)
   - const livePolls = useLivePolls(initialPolls, handleNewPoll)
3. handleNewPoll(pollId) :
   - newPollIds.add(pollId)
   - setTimeout 5000ms → newPollIds.delete(pollId) → setNewPollIds
4. Passer newPollIds.has(poll.id) en prop isNew à PollCardLive
   dans le map de la liste

ATTENTION : la logique de vote optimiste actuelle doit continuer
à fonctionner. Si HomeClient avait setPolls quelque part pour
l'update optimiste, il faut maintenant que ces updates passent
par un wrapper qui modifie le state interne de useLivePolls.

→ Si la complexité est trop grande pour préserver le vote optimiste,
   ARRÊTE-TOI et signale-moi dans le récap quel est le blocage
   plutôt que de casser le vote.

═══════════════════════════════════════════════════
ÉTAPE 4 — BADGE "NOUVEAU" SUR PollCardLive
═══════════════════════════════════════════════════

Modifier src/components/PollCardLive.tsx (UNIQUEMENT pour ajouter
le badge, ne pas toucher à la logique Realtime votes existante) :

1. Ajouter une prop optionnelle isNew?: boolean
2. Si isNew === true, afficher un petit badge "Nouveau" en
   absolute positioning en haut à droite de la carte (ou intégré
   dans le header de la carte selon ce qui rend mieux)
3. Style du badge :
   - Fond ocean blue #1A6FB5 (couleur primaire VoxSPM)
   - Texte blanc, taille xs
   - Coins arrondis (rounded-full ou rounded-md)
   - Petit pulse léger animate-pulse pour attirer l'œil
   - Texte : "✨ Nouveau"

═══════════════════════════════════════════════════
ÉTAPE 5 — RÉCAP
═══════════════════════════════════════════════════

Liste des fichiers créés et modifiés. Confirme :
- Que la logique de vote optimiste de HomeClient est préservée
- Que le fetcher utilisé pour récupérer un poll complet (lib
  réutilisée OU fetcher inline) est cohérent avec PollCardLive
- Si la doc docs/ARCHITECTURE.md mérite une mise à jour
  (nouveau hook, nouvelle prop sur PollCardLive)

═══════════════════════════════════════════════════
FICHIERS AUTORISÉS
═══════════════════════════════════════════════════

EN ÉCRITURE :
- src/lib/hooks/useLivePolls.ts (création)
- src/components/HomeClient.tsx (intégration)
- src/components/PollCardLive.tsx (UNIQUEMENT pour ajouter la
  prop isNew et le badge — ne pas toucher au reste)

EN LECTURE :
- src/lib/hooks/useLiveStats.ts (référence pattern)
- src/lib/supabase/client.ts
- src/lib/ (recherche d'un fetcher poll réutilisable)
- types Poll existants

═══════════════════════════════════════════════════
FICHIERS INTERDITS
═══════════════════════════════════════════════════

- src/lib/supabase/server.ts | admin.ts
- src/lib/actions/**
- src/lib/context/GeoContext.tsx | SessionProvider.tsx
- src/lib/constants.ts
- src/lib/og/**
- src/app/admin/**
- src/app/api/**
- src/app/page.tsx (sauf si STRICTEMENT nécessaire pour passer
  initialPolls — auquel cas signale-le avant de modifier)
- supabase/migrations/**
- middleware.ts
- Tout autre fichier non listé en autorisé

═══════════════════════════════════════════════════
COMMANDES INTERDITES
═══════════════════════════════════════════════════

- npm run build           (JC le fait dans son terminal)
- git add / commit / push (JC gère les commits)
- git status / git diff
- npm run dev             (déjà lancé)