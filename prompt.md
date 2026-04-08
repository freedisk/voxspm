[OK SESSION EN COURS] · [MODÈLE: SONNET REQUIS] · [BUILD: OBLIGATOIRE]

Mission ciblée : fix bug compteurs Hero (sondages réalisés et en cours
gonflés à 9 au lieu de 3). Cause : un trigger DB met à jour polls à
chaque vote, ce qui déclenche UPDATE polls et incrémente les compteurs
sans contrôle.

═══════════════════════════════════════════════════
CONTEXTE
═══════════════════════════════════════════════════

Le hook useLiveStats créé hier fonctionne pour totalVotes mais bug
sur activePolls et completedPolls : ils incrémentent à chaque vote
parce qu'un trigger DB update polls (probablement total_votes ou
updated_at) à chaque INSERT dans votes. Le handler UPDATE polls
incrémente sans vérifier que c'est bien une transition de status.

Solution : maintenir un Set local des IDs de polls déjà comptés
comme "actifs" et "réalisés", et incrémenter UNIQUEMENT si l'ID
n'y figure pas encore. Pour les transitions vers archived,
décrémenter activePolls seulement si l'ID était dans le Set actif.

═══════════════════════════════════════════════════
ÉTAPE 1 — LECTURE
═══════════════════════════════════════════════════

Lire src/lib/hooks/useLiveStats.ts pour comprendre la structure
actuelle (handlers INSERT/UPDATE, channel, cleanup).

═══════════════════════════════════════════════════
ÉTAPE 2 — REFACTOR DU HOOK
═══════════════════════════════════════════════════

Modifier src/lib/hooks/useLiveStats.ts pour :

1. Ajouter deux useRef<Set<string>> :
   - activePollIdsRef : IDs des polls actuellement en status 'active'
   - realizedPollIdsRef : IDs des polls comptés comme "réalisés"
     (active OU archived)

2. Initialiser ces deux Set au mount via une requête Supabase
   browser client : SELECT id, status FROM polls WHERE status IN
   ('active', 'archived'). Remplir les Set en conséquence.
   IMPORTANT : faire ça dans le useEffect, AVANT de s'abonner au
   channel Realtime, pour éviter une race condition.

3. Handler INSERT polls :
   - Si new.status === 'active' ET id pas dans activePollIdsRef →
     activePollIdsRef.add(id) + activePolls + 1
   - Si (new.status === 'active' OU new.status === 'archived') ET
     id pas dans realizedPollIdsRef → realizedPollIdsRef.add(id) +
     completedPolls + 1

4. Handler UPDATE polls :
   - Récupérer new.id et new.status
   - Cas 1 : new.status === 'active' ET id pas dans
     activePollIdsRef → c'est une transition pending→active
     → add + activePolls + 1
     → Si pas dans realizedPollIdsRef : add + completedPolls + 1
   - Cas 2 : new.status === 'archived' ET id dans activePollIdsRef
     → c'est une transition active→archived
     → delete + activePolls - 1
     → completedPolls reste stable (déjà compté)
   - Cas 3 : new.status === 'pending' ET id dans activePollIdsRef
     → rollback admin (active→pending)
     → delete + activePolls - 1
     → realizedPollIdsRef.delete(id) + completedPolls - 1
   - Tous les autres cas : NO-OP (c'est probablement le trigger
     vote qui a updaté un autre champ)

5. Handler INSERT votes : inchangé (totalVotes + 1)

6. Cleanup : reset les Set dans le return du useEffect en plus du
   removeChannel.

═══════════════════════════════════════════════════
ÉTAPE 3 — RÉCAP
═══════════════════════════════════════════════════

Liste des fichiers modifiés + confirmation que la logique des 3
cas UPDATE est bien implémentée.

═══════════════════════════════════════════════════
FICHIERS AUTORISÉS
═══════════════════════════════════════════════════

EN ÉCRITURE :
- src/lib/hooks/useLiveStats.ts (UNIQUEMENT)

EN LECTURE :
- src/lib/supabase/client.ts (consultation pour l'import)

═══════════════════════════════════════════════════
FICHIERS INTERDITS
═══════════════════════════════════════════════════

- TOUS les autres fichiers
- En particulier : Hero.tsx (pas besoin d'y toucher), page.tsx,
  PollCardLive.tsx, supabase/migrations/**, src/lib/actions/**,
  src/app/admin/**, src/app/api/**, middleware.ts

═══════════════════════════════════════════════════
COMMANDES INTERDITES
═══════════════════════════════════════════════════

- npm run build           (JC le fait dans son terminal)
- git add / commit / push (JC gère les commits)
- git status / git diff
- npm run dev             (déjà lancé)