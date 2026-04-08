[OK SESSION EN COURS] · [MODÈLE: HAIKU SUFFIT] · [BUILD: OBLIGATOIRE]

*Fix UX P1.4 : le check proactif ne se relance pas après une soumission réussie (Next.js client-side navigation, useEffect avec deps vide ne remonte pas). Conséquence : l'user qui enchaîne plusieurs propositions voit une console error au lieu du bandeau bloquant. Fix chirurgical sur un seul fichier. Haiku suffit car c'est de la logique client straightforward. Build obligatoire pour valider.*

CONTEXTE
========
VoxSPM — fix UX de la mission P1.4.
Problème : après une soumission réussie, si l'user reste sur /proposer
pour en proposer un autre, le useEffect de check-limit ne se rejoue pas
(client-side navigation Next.js), donc le formulaire reste affiché
et la soumission du 4ᵉ sondage déclenche une erreur 429 brute côté client
(console error visible).

Solution :
1. Extraire la logique du useEffect initial dans une fonction checkLimit()
   réutilisable.
2. Appeler checkLimit() après chaque soumission réussie.
3. Dans handleSubmit, intercepter spécifiquement le code 'RATE_LIMIT_EXCEEDED'
   renvoyé par le serveur avec status 429, et basculer checkState sur 'blocked'
   au lieu de throw une erreur générique.

FICHIERS AUTORISÉS
==================
- src/app/proposer/page.tsx   (MODIFIER uniquement)

FICHIERS INTERDITS
==================
Tout le reste. En particulier :
- src/app/api/**
- src/lib/**
- src/components/**
- supabase/migrations/**
- middleware.ts

COMMANDES INTERDITES
====================
Ne JAMAIS lancer dans cette session :
- npm run build
- git add / commit / push
- git status / git diff
- npm run dev

Tu te contentes d'éditer le fichier et de fournir un récap final.

ÉTAPES SÉQUENTIELLES
====================

ÉTAPE 1 — Extraire le check dans une fonction réutilisable
-----------------------------------------------------------
Dans src/app/proposer/page.tsx :

a) Localise le useEffect actuel qui fait le fetch vers /api/propose/check-limit.

b) Extrait la logique de fetch + setCheckState + setPendingCount
   dans une fonction async nommée `checkLimit`, déclarée à l'intérieur
   du composant (au-dessus des useEffect) :

   const checkLimit = async () => {
     try {
       const res = await fetch('/api/propose/check-limit');
       const data = await res.json();
       if (data.canPropose) {
         setCheckState('allowed');
       } else {
         setCheckState('blocked');
       }
       setPendingCount(data.pendingCount ?? 0);
     } catch {
       // Fail-open : en cas d'erreur réseau, on laisse le serveur bloquer
       setCheckState('allowed');
     }
   };

c) Remplace le corps du useEffect initial par un simple appel à checkLimit() :

   useEffect(() => {
     checkLimit();
   }, []);

   Note : ne pas ajouter checkLimit dans les deps pour éviter les re-runs
   inutiles. Le ESLint exhaustive-deps peut râler, dans ce cas ajoute un
   commentaire // eslint-disable-next-line react-hooks/exhaustive-deps
   juste avant le tableau de deps.

ÉTAPE 2 — Appeler checkLimit() après une soumission réussie
------------------------------------------------------------
Dans la fonction handleSubmit :

a) Localise l'endroit où setSuccess(true) est appelé après une soumission
   réussie (ligne autour de 122 d'après le stack trace que JC a remonté).

b) Juste APRÈS setSuccess(true) et les resets de state (setQuestion(''), etc.),
   ajoute un appel à checkLimit() :

   setSuccess(true);
   setQuestion('');
   // ... autres resets existants ...
   await checkLimit();

   L'await est important pour que le rendu conditionnel suivant se base
   sur le nouveau checkState si la limite est atteinte.

ÉTAPE 3 — Intercepter le code RATE_LIMIT_EXCEEDED dans handleSubmit
--------------------------------------------------------------------
Toujours dans handleSubmit, avant la ligne actuelle
`if (!response.ok) throw new Error(result.error)` :

a) Ajoute un check spécifique pour le rate limit serveur :

   if (response.status === 429 && result.code === 'RATE_LIMIT_EXCEEDED') {
     setCheckState('blocked');
     setPendingCount(3);
     return;
   }
   if (!response.ok) throw new Error(result.error);

   Ce code détecte la réponse 429 avec le code exact renvoyé par
   /api/propose/route.ts, bascule proprement sur le bandeau bloquant,
   et sort de handleSubmit sans jeter d'erreur.

b) NE MODIFIE PAS le reste de handleSubmit (la logique de try/catch,
   la gestion des autres erreurs, les resets, etc.).

RÉCAPITULATIF DEMANDÉ
=====================
- Confirmation de l'extraction de checkLimit() en fonction réutilisable
- Confirmation de l'appel checkLimit() après setSuccess(true)
- Confirmation de l'interception du code RATE_LIMIT_EXCEEDED dans handleSubmit
- Numéros de lignes approximatifs des 3 modifications
- Toute anomalie ou incohérence avec le code existant

Pas de commentaires sur la qualité, juste les faits.