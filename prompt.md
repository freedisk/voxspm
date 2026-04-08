[OK SESSION EN COURS] · [MODÈLE: HAIKU SUFFIT] · [BUILD: OBLIGATOIRE]

Mission diagnostic : l'image OG dynamique /poll/[slug]/opengraph-image
affiche le fallback "sondage non trouvé" alors que le sondage existe en
base et que la page /poll/[slug] fonctionne. Ajouter 2 console.log
temporaires pour identifier si c'est params qui est cassé ou la query
Supabase qui échoue. Build obligatoire pour déployer les logs.

CONTEXTE
========
- homepage OG fonctionne
- page /poll/[slug] fonctionne
- page /?poll=slug fonctionne (modale)
- SEUL /poll/[slug]/opengraph-image casse avec fallback "sondage non trouvé"

Hypothèses : params mal décapsulé (Promise async Next 16) OU RLS en edge runtime
OU createClient incompatible edge. Les logs vont trancher.

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

1. Lire src/app/poll/[slug]/opengraph-image.tsx et repérer :
   a. La signature exacte de la fonction Image (comment params est typé et reçu)
   b. La query Supabase .from('polls').select(...).eq('slug', ...).single()
   c. La branche fallback "sondage non trouvé"

2. VÉRIFICATION CRITIQUE Next 16 — params async :
   Dans Next 15+, le paramètre `params` est une Promise.
   Le typage correct pour un opengraph-image.tsx dans un dossier [slug] est :

     export default async function Image({
       params
     }: {
       params: Promise<{ slug: string }>
     }) {
       const { slug } = await params;
       // ... utiliser slug
     }

   Si le fichier actuel a :
     { params }: { params: { slug: string } }
   sans await → c'est le bug principal. params est une Promise non résolue,
   donc params.slug est undefined, et la query .eq('slug', undefined) ne
   match rien.

   Si le bug est là, le corriger immédiatement (ne PAS ajouter de log,
   juste fixer). Si le typage est déjà correct avec await, passer à l'étape 3.

3. SI et seulement SI le fix params ne suffit pas (à vérifier au runtime
   après déploiement), ajouter les 2 console.log suivants pour diagnostic :

   Juste après la récupération de slug :
     console.log('[OG DEBUG] slug reçu:', slug);

   Juste après la query Supabase (avant le test !poll) :
     console.log('[OG DEBUG] query result:', {
       hasPoll: !!poll,
       error: error?.message,
       errorCode: error?.code,
     });

   Note : si la query actuelle ne destructure pas `error` (seulement `data: poll`),
   l'ajouter : `const { data: poll, error } = await supabase...`

4. Ne modifier ABSOLUMENT rien d'autre dans le fichier.

RÉCAPITULATIF DEMANDÉ
=====================
1. Signature actuelle de params dans le fichier AVANT modification (copier
   la ligne exacte)
2. Si await params manquait → confirmation du fix
3. Logs ajoutés (ou non si fix params suffit)
4. Diagnostic probable identifié (params / RLS / autre)