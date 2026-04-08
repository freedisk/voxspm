[OK SESSION EN COURS] · [MODÈLE: SONNET REQUIS] · [BUILD: OBLIGATOIRE]

Mission ciblée : rendre les 3 compteurs du Hero (votes exprimés, sondages 
réalisés, en cours) réactifs en temps réel via Supabase Realtime, comme 
PollCardLive l'est déjà pour les barres de vote.

═══════════════════════════════════════════════════
CONTEXTE
═══════════════════════════════════════════════════

Le site VoxSPM est live en prod. Les votes arrivent, les barres dans 
PollCardLive s'animent en temps réel. MAIS les 3 compteurs du Hero 
(votes exprimés / sondages réalisés / en cours) restent figés et ne 
se mettent à jour qu'au reload de la page.

Cause probable : ces compteurs sont rendus dans un Server Component 
qui reçoit ses props depuis page.tsx au moment du SSR. Il faut soit :
- (option A) extraire les compteurs dans un Client Component qui 
  s'abonne au canal Realtime des tables `votes` et `polls`
- (option B) créer un hook `useLiveStats` qui maintient un state local 
  initialisé aux valeurs SSR et incrémenté à chaque nouvel event Realtime

Choisis l'option la plus propre selon ce que tu trouves dans le code 
existant. La cohérence avec PollCardLive est prioritaire.

═══════════════════════════════════════════════════
ÉTAPE 1 — LOCALISATION (lecture seule, ne rien modifier)
═══════════════════════════════════════════════════

1. Lire `src/app/page.tsx` pour comprendre comment les stats sont 
   calculées et passées au Hero.
2. Lire le composant Hero (probablement `src/components/Hero.tsx` ou 
   `src/components/home/Hero.tsx` ou similaire). Repérer les 3 compteurs.
3. Lire `src/components/PollCardLive.tsx` pour COMPRENDRE le pattern 
   Realtime déjà en place (canal, channel name, table écoutée, cleanup).
   ⚠️ Ce fichier est une RÉFÉRENCE, ne le modifie surtout pas.
4. Vérifier dans `src/lib/hooks/` s'il existe déjà un hook réutilisable 
   pour Realtime. Si oui, le réutiliser. Sinon, créer un nouveau hook.

À la fin de l'étape 1, AFFICHE EN UNE PHRASE : 
- le nom exact du fichier Hero
- comment les stats arrivent dans ce composant
- l'option (A ou B) que tu vas implémenter

PUIS PASSE À L'ÉTAPE 2 SANS ATTENDRE.

═══════════════════════════════════════════════════
ÉTAPE 2 — IMPLÉMENTATION
═══════════════════════════════════════════════════

Crée ou modifie ce qu'il faut pour que les 3 compteurs reflètent en 
temps réel :
- `votesCount` : total des lignes dans la table `votes`
- `pollsRealized` : nombre de polls dont status = 'archived' OU 
  status = 'active' (= sondages réalisés, à confirmer selon ce que 
  tu trouves dans le code existant — utilise la même règle que 
  celle déjà en place côté SSR)
- `pollsActive` : nombre de polls dont status = 'active'

Contraintes techniques :
- Utilise le Supabase BROWSER client (pas server, pas admin)
- Le composant qui contient les compteurs DOIT devenir un Client 
  Component ('use client')
- Les valeurs initiales DOIVENT être passées en props depuis 
  page.tsx (Server Component) pour éviter le flash à 0 au mount
- Abonnement Realtime sur les tables `votes` (INSERT) et `polls` 
  (INSERT, UPDATE — pour le changement de status)
- Cleanup du channel dans le return du useEffect (impératif pour 
  éviter les fuites de mémoire en navigation)
- Channel name unique (ex: 'hero-stats-live')
- Pas d'animation fancy nécessaire, juste la mise à jour du nombre

Pattern à suivre EXACTEMENT comme PollCardLive le fait pour les votes.

═══════════════════════════════════════════════════
ÉTAPE 3 — RÉCAP FINAL
═══════════════════════════════════════════════════

À la fin, donne-moi :
1. La liste des fichiers créés
2. La liste des fichiers modifiés
3. L'option choisie (A ou B) et pourquoi
4. Une mention si la doc `docs/ARCHITECTURE.md` doit être mise à jour 
   (nouveau composant client, nouveau hook…)

═══════════════════════════════════════════════════
FICHIERS AUTORISÉS
═══════════════════════════════════════════════════

EN LECTURE :
- src/app/page.tsx
- src/components/** (Hero, HeroStats, ou tout fichier contenant 
  les 3 compteurs)
- src/components/PollCardLive.tsx (RÉFÉRENCE UNIQUEMENT)
- src/lib/hooks/** (consultation pour réutilisation éventuelle)
- src/lib/supabase/client.ts (consultation uniquement)

EN ÉCRITURE :
- Le composant Hero ou HeroStats (à transformer en Client ou à 
  splitter en server + client)
- src/app/page.tsx UNIQUEMENT pour passer les valeurs initiales 
  en props (ne pas toucher à la logique de fetch existante)
- Optionnel : créer un nouveau hook dans src/lib/hooks/ si 
  pertinent (ex: useLiveStats.ts)

═══════════════════════════════════════════════════
FICHIERS INTERDITS
═══════════════════════════════════════════════════

- src/lib/supabase/client.ts | server.ts | admin.ts
- src/lib/actions/**
- src/lib/context/GeoContext.tsx | SessionProvider.tsx
- src/lib/constants.ts
- src/lib/og/**
- src/components/PollCardLive.tsx (référence uniquement, INTERDIT 
  en écriture)
- src/app/admin/**
- src/app/api/**
- supabase/migrations/**
- middleware.ts

═══════════════════════════════════════════════════
COMMANDES INTERDITES
═══════════════════════════════════════════════════

Ne JAMAIS lancer dans cette session :
- npm run build           (JC le fait dans un terminal séparé)
- git add / commit / push (JC gère les commits manuellement)
- git status / git diff   (inutile dans le contexte de la session)
- npm run dev             (déjà lancé en arrière-plan par JC)

Tu te contentes d'éditer les fichiers et de fournir le récap final.