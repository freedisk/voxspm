[OK SESSION EN COURS] · [MODÈLE: SONNET REQUIS] · [BUILD: OBLIGATOIRE]

Mission refonte UI en 2 volets : (1) grille 3 colonnes responsive pour la liste
des sondages, (2) refonte de la barre TagFilter (compacte, centrée, séparateur
"Tous", tri par usage, état actif en contour bleu). Sonnet requis car on touche
à la query Supabase de page.tsx (comptage des sondages par tag) + logique de tri
+ refonte de 2 composants. Build obligatoire car modifs significatives côté SSR.

CONTEXTE
========
VoxSPM — homepage actuellement en 1 colonne max-w-3xl. On passe en grille 3 cols
desktop / 2 cols tablette / 1 col mobile, container max-w-6xl. La barre TagFilter
passe d'un flex-wrap classique à une version compacte avec bouton "Tous" isolé à
gauche (séparateur vertical), tags plus petits, tri par nombre de sondages actifs
décroissant (tie-breaker : order_index ASC, puis name ASC), état actif = contour
bleu #1A6FB5 épais sur fond blanc.

Géo-couleurs sémantiques (NON interchangeables, rappel) :
- Saint-Pierre : #1A6FB5
- Miquelon    : #0C9A78
- Extérieur   : #6B4FA0

FICHIERS AUTORISÉS
==================
- src/app/page.tsx                          (wrapper grille + query tags enrichie)
- src/components/polls/TagFilter.tsx        (refonte complète de la barre)

FICHIERS INTERDITS (ne PAS lire, ne PAS modifier)
=================================================
- src/lib/hooks/**
- src/lib/supabase/**
- src/lib/context/**
- src/lib/actions/**
- src/app/admin/**
- src/app/api/**
- supabase/migrations/**
- middleware.ts
- src/components/polls/PollCardLive.tsx     (ne pas toucher — déjà en place)
- src/components/polls/PollCard.tsx
- src/components/polls/GeoBreakdown.tsx
- src/components/polls/VoteForm.tsx
- src/components/polls/ResultsBars.tsx
- Tous les fichiers docs/**

COMMANDES INTERDITES
====================
Ne JAMAIS lancer dans cette session :
- npm run build           (JC le fait dans un terminal séparé)
- git add / commit / push (JC gère les commits manuellement)
- git status / git diff   (inutile dans le contexte de la session)
- npm run dev             (déjà lancé en arrière-plan par JC)

Tu te contentes d'éditer les fichiers et de fournir un récap final
listant tous les fichiers créés et modifiés.

ÉTAPES SÉQUENTIELLES
====================

1. Lire src/app/page.tsx pour identifier :
   - La query Supabase qui récupère les tags (actuellement un simple .order('order_index'))
   - Le composant HomeClient et comment les tags lui sont passés
   - Le wrapper de grille actuel : <div className="flex flex-col gap-6 mt-6 max-w-3xl mx-auto">

2. Lire src/components/polls/TagFilter.tsx pour comprendre la structure actuelle
   (props, état, rendu des boutons).

3. Dans src/app/page.tsx — enrichir la query tags avec un comptage :
   a. Après la query tags existante, ajouter une query qui compte les sondages
      actifs par tag via la table poll_tags jointe à polls (status = 'active').
      Utiliser une requête Supabase du type :
        const { data: tagCounts } = await supabase
          .from('poll_tags')
          .select('tag_id, polls!inner(status)')
          .eq('polls.status', 'active');
      Puis agréger côté JS en Record<string, number> : { [tag_id]: count }.
   b. Enrichir chaque tag avec une propriété `active_polls_count` (number, 0 si absent).
   c. Trier les tags avec ce comparateur :
        (a, b) => (b.active_polls_count - a.active_polls_count)
                || (a.order_index - b.order_index)
                || a.name.localeCompare(b.name, 'fr')
   d. Passer ce tableau enrichi + trié à HomeClient via la prop tags existante.
   e. Si le type Tag est défini dans ce fichier, y ajouter `active_polls_count: number`.
      Si le type vit ailleurs, le redéclarer localement dans page.tsx en étendant le
      type existant (ne PAS aller modifier le type global).

4. Dans src/app/page.tsx — modifier le wrapper de la grille :
   Remplacer :
     <div className="flex flex-col gap-6 mt-6 max-w-3xl mx-auto">
   Par :
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 max-w-6xl mx-auto px-4">

   Ne PAS toucher au contenu interne (les PollCardLive restent identiques).

5. Dans src/components/polls/TagFilter.tsx — refonte complète :
   a. Vérifier que le type Tag importé/utilisé accepte bien active_polls_count.
      Si TagFilter a son propre type local, l'étendre. Sinon, accepter la prop
      telle qu'elle vient de page.tsx.

   b. Nouvelle structure JSX du container :

      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-5xl mx-auto px-4" role="group">
        {/* Bouton Tous isolé */}
        <button ...> Tous </button>

        {/* Séparateur vertical */}
        <div className="h-6 w-px bg-slate-300 mx-2" aria-hidden="true" />

        {/* Liste des autres tags */}
        {otherTags.map(tag => (
          <button key={tag.id} ...>
            {tag.icon} {tag.name}
          </button>
        ))}
      </div>

   c. Styles des boutons (compact) :
      - Classes communes : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
      - Bouton inactif : background white, border border-slate-200, text-slate-700, hover:border-slate-300
      - Bouton ACTIF : border-2 border-[#1A6FB5] bg-white text-[#1A6FB5] (contour bleu épais, fond blanc)
      - Retirer les box-shadow colorés précédents (tag.color + '40')
      - Les icônes tag.icon restent affichées, mais plus petites implicitement via text-sm

   d. Le bouton "Tous" utilise exactement les mêmes classes que les autres (cohérence
      visuelle), avec l'état actif quand aucun filtre n'est sélectionné.

   e. Ne PAS afficher le compteur active_polls_count à l'écran. Il sert uniquement
      au tri côté serveur, pas au rendu visuel.

6. Relecture finale :
   - Vérifier qu'aucun autre fichier n'a été touché
   - Vérifier que les imports sont propres (pas d'import inutile)
   - Vérifier que le type Tag enrichi ne casse pas d'autres usages (grep rapide
     sur "active_polls_count" pour confirmer qu'il n'est attendu qu'aux endroits
     qu'on a modifiés)

RÉCAPITULATIF DEMANDÉ
=====================
À la fin, fournis :
- Liste exhaustive des fichiers modifiés (chemins complets)
- Résumé en 3-5 lignes des changements dans page.tsx
- Résumé en 3-5 lignes des changements dans TagFilter.tsx
- Confirmation qu'aucun fichier protégé n'a été lu ni modifié
- Confirmation que PollCardLive, PollCard, et les autres composants polls/ n'ont pas été touchés