[OK SESSION EN COURS] · [MODÈLE: SONNET REQUIS] · [BUILD: OBLIGATOIRE]

Mission ciblée : le filtrage par tags ne réagit plus en live depuis
l'intégration de useLivePolls. Déplacer le filtrage du serveur vers
le client pour que HomeClient filtre sa liste locale en fonction des
searchParams, sans perdre la synchro Realtime des polls.

═══════════════════════════════════════════════════
CONTEXTE
═══════════════════════════════════════════════════

Avant la mission useLivePolls, page.tsx (Server Component) lisait
searchParams.tags et filtrait les polls côté DB, puis passait
initialPolls déjà filtrés à HomeClient. Chaque clic sur un tag
déclenchait un re-SSR et tout fonctionnait.

Maintenant, HomeClient maintient son state polls en local via
useLivePolls pour la synchro Realtime. Il est initialisé une seule
fois avec initialPolls et ne réagit plus aux changements de
searchParams — le filtre ne se propage donc plus à la liste visible.

Solution : page.tsx envoie TOUS les polls actifs (non filtrés),
HomeClient lit searchParams côté client via useSearchParams et
filtre la liste en mémoire avec un useMemo. Le filtrage devient
instantané et reste compatible avec la synchro Realtime.

═══════════════════════════════════════════════════
ÉTAPE 1 — LECTURE (lecture seule)
═══════════════════════════════════════════════════

1. Lire src/app/page.tsx pour comprendre :
   - Comment searchParams.tags est lu (format : string, string[], CSV ?)
   - Comment le filtre est appliqué côté DB actuellement
   - Quelle est la forme du paramètre (tag IDs ? tag slugs ? tag names ?)

2. Lire src/components/pages/HomeClient.tsx pour confirmer :
   - Comment les polls sont rendus aujourd'hui (map direct sur livePolls ?)
   - Si un useMemo ou filtrage existe déjà quelque part

3. Lire src/components/filters/TagFilter.tsx (ou équivalent) pour
   comprendre :
   - Comment le clic sur un tag met à jour l'URL
   - Quelle est la valeur écrite dans searchParams (tag.id ? tag.slug ?)

À la fin de l'étape 1, AFFICHE EN UNE PHRASE :
- le nom du param URL (ex: 'tags')
- le format de la valeur (ex: CSV d'IDs, slugs, etc.)
- le champ du poll à comparer (poll.tags qui est un array de ? )

PUIS PASSE À L'ÉTAPE 2.

═══════════════════════════════════════════════════
ÉTAPE 2 — MODIFICATION DE page.tsx
═══════════════════════════════════════════════════

Retirer le filtrage par tags dans le fetch côté serveur.
page.tsx doit désormais renvoyer TOUS les polls actifs
(status === 'active'), triés par proposed_at desc.

IMPORTANT :
- Ne PAS toucher à la logique de fetch des tags (TagFilter a
  toujours besoin de la liste complète des tags)
- Ne PAS toucher au calcul de active_polls_count par tag si
  cette logique existe
- Conserver tout le reste tel quel (stats, fetch des polls, etc.)

═══════════════════════════════════════════════════
ÉTAPE 3 — FILTRAGE CLIENT DANS HomeClient
═══════════════════════════════════════════════════

Modifier src/components/pages/HomeClient.tsx :

1. Importer useSearchParams depuis 'next/navigation'
2. const searchParams = useSearchParams()
3. Extraire les tags sélectionnés du param URL :
   const selectedTagIds = useMemo(() => {
     const raw = searchParams.get('tags')
     return raw ? raw.split(',').filter(Boolean) : []
   }, [searchParams])
   (adapte le séparateur selon ce que tu as vu à l'étape 1)

4. Créer filteredPolls avec un useMemo :
   const filteredPolls = useMemo(() => {
     if (selectedTagIds.length === 0) return livePolls
     return livePolls.filter(poll =>
       poll.tags.some(tag => selectedTagIds.includes(tag.id))
     )
   }, [livePolls, selectedTagIds])
   (logique OR entre tags — un poll matche si AU MOINS un de ses
   tags est sélectionné. Si la logique actuelle côté serveur est
   AND, reproduis-la à l'identique en remplaçant some par every
   sur selectedTagIds)

5. Remplacer le map sur livePolls par un map sur filteredPolls
   dans le rendu des PollCardLive

6. Si un état "aucun sondage ne correspond" doit s'afficher, le
   conditionner sur filteredPolls.length === 0 && selectedTagIds
   .length > 0

ATTENTION : ne PAS casser la logique de vote optimiste ni le badge
"Nouveau". Tout le reste du composant doit rester intact.

═══════════════════════════════════════════════════
ÉTAPE 4 — RÉCAP
═══════════════════════════════════════════════════

Liste des fichiers modifiés. Confirme :
- Le format exact du param URL (et sa valeur : id, slug, etc.)
- La logique de filtrage (OR ou AND entre tags)
- Que la synchro Realtime (useLivePolls) continue de fonctionner
  avec le filtrage client (le state livePolls reste la source de
  vérité, filteredPolls est un dérivé calculé)
- Si un ancien filtre côté serveur a été retiré et qu'il faut
  éventuellement nettoyer un import devenu inutile

═══════════════════════════════════════════════════
FICHIERS AUTORISÉS
═══════════════════════════════════════════════════

EN ÉCRITURE :
- src/app/page.tsx (retrait du filtre par tags dans le fetch)
- src/components/pages/HomeClient.tsx (filtrage client)

EN LECTURE :
- src/components/filters/TagFilter.tsx (ou équivalent)
- src/lib/hooks/useLivePolls.ts (référence)

═══════════════════════════════════════════════════
FICHIERS INTERDITS
═══════════════════════════════════════════════════

- src/lib/hooks/useLivePolls.ts (pas de modification)
- src/lib/hooks/useLiveStats.ts
- src/components/polls/PollCardLive.tsx
- src/components/filters/TagFilter.tsx (pas de modification, il
  écrit déjà bien l'URL — on consomme simplement sa sortie)
- src/lib/supabase/** (client, server, admin)
- src/lib/actions/**
- src/lib/context/**
- src/lib/constants.ts
- src/lib/og/**
- src/app/admin/**
- src/app/api/**
- supabase/migrations/**
- middleware.ts

═══════════════════════════════════════════════════
COMMANDES INTERDITES
═══════════════════════════════════════════════════

- npm run build           (JC le fait dans son terminal)
- git add / commit / push (JC gère les commits)
- git status / git diff
- npm run dev             (déjà lancé)