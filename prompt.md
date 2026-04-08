[OK SESSION EN COURS] · [MODÈLE: HAIKU SUFFIT] · [BUILD: OBLIGATOIRE]

Fix TypeScript : dans opengraph-image.tsx, le typage inline du paramètre
pt dans le .map() est incorrect. Supabase retourne pt.tags comme TABLEAU
(pas un objet single). Fix en utilisant `any` contrôlé + flatMap, ou en
corrigeant le type inline. Haiku suffit.

CONTEXTE ERREUR
===============
Type error à src/app/poll/[slug]/opengraph-image.tsx:47:10

  const tags = (poll.poll_tags ?? [])
    .map((pt: { tags: { slug: string; name: string } | null }) => pt.tags)
    .filter((t): t is { slug: string; name: string } => t !== null);

Le type inline annonce `tags: { slug, name } | null` mais Supabase
retourne `tags: { slug, name }[]` (array). Erreur : "Type '{ slug: any; name: any; }[]'
is missing the following properties from type '{ slug: string; name: string; }'".

FICHIERS AUTORISÉS
==================
- src/app/poll/[slug]/opengraph-image.tsx

FICHIERS INTERDITS
==================
- Tous les autres

COMMANDES INTERDITES
====================
- npm run build, git *, npm run dev

ÉTAPES
======

1. Dans src/app/poll/[slug]/opengraph-image.tsx, localiser le bloc de
   normalisation des tags (lignes ~45-48).

2. Remplacer le bloc existant :

     const tags = (poll.poll_tags ?? [])
       .map((pt: { tags: { slug: string; name: string } | null }) => pt.tags)
       .filter((t): t is { slug: string; name: string } => t !== null);

   Par cette version qui gère le tableau et aplatit correctement :

     type PollTagRow = { tags: { slug: string; name: string }[] | { slug: string; name: string } | null };
     const tags = ((poll.poll_tags ?? []) as PollTagRow[])
       .flatMap((pt) => {
         if (!pt.tags) return [];
         return Array.isArray(pt.tags) ? pt.tags : [pt.tags];
       });

   Cette version gère les 3 cas possibles :
   - pt.tags est null → rien
   - pt.tags est un tableau (cas Supabase actuel) → on aplatit
   - pt.tags est un objet single (sécurité si le schéma change) → on wrap

3. Vérifier qu'aucune autre ligne du fichier n'a été modifiée.

4. Relire mentalement le type : `tags` doit finir comme
   `{ slug: string; name: string }[]`, compatible avec l'entrée de
   `resolveGeoColor({ question, tags })` qui attend
   `tags?: Array<{ slug: string }>`.

RÉCAPITULATIF DEMANDÉ
=====================
- Le bloc exact remplacé (avant/après)
- Confirmation qu'aucune autre ligne n'a été modifiée
- Confirmation que le type final de `tags` est bien `{ slug: string; name: string }[]`