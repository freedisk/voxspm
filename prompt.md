[SESSION FRESH RECOMMANDÉE] · [MODÈLE: HAIKU SUFFIT] · [BUILD: OBLIGATOIRE]

*Mission P2.5 finale : mise à jour de metadataBase dans layout.tsx pour pointer vers le nouveau domaine canonique voxspm.com au lieu de voxspm.vercel.app. 1 seule ligne à modifier. Haiku suffit. Build obligatoire pour valider que les metadata Next se régénèrent correctement.*

CONTEXTE
========
VoxSPM — le domaine voxspm.com est maintenant actif sur Vercel (SSL OK,
propagation terminée). Il faut mettre à jour metadataBase dans layout.tsx
pour que les OG tags, twitter cards et liens canoniques pointent vers le
nouveau domaine au lieu de voxspm.vercel.app.

FICHIERS AUTORISÉS
==================
- src/app/layout.tsx    (MODIFIER : 1 seule ligne)

FICHIERS INTERDITS
==================
TOUT le reste. En particulier :
- src/app/opengraph-image.tsx
- src/app/twitter-image.tsx
- src/app/poll/**
- src/lib/og/**
- src/components/**
- src/app/api/**
- src/app/admin/**
- src/app/contact/**
- src/app/proposer/**
- supabase/migrations/**
- middleware.ts
- package.json

COMMANDES INTERDITES
====================
Ne JAMAIS lancer dans cette session :
- npm run build           (JC le fait dans un terminal séparé)
- git add / commit / push (JC gère les commits manuellement)
- git status / git diff
- npm run dev             (déjà lancé en arrière-plan par JC)

Tu te contentes d'éditer le fichier et de fournir un récap final.

ÉTAPES SÉQUENTIELLES
====================

ÉTAPE 1 — Localiser metadataBase dans src/app/layout.tsx
---------------------------------------------------------
a) Ouvre src/app/layout.tsx
b) Localise l'export `metadata` (ou `export const metadata: Metadata = {...}`)
c) Dans cet objet, trouve la ligne qui définit `metadataBase`
d) Cette ligne doit actuellement ressembler à quelque chose comme :

   metadataBase: new URL('https://voxspm.vercel.app'),

ÉTAPE 2 — Remplacer par le nouveau domaine
-------------------------------------------
a) Remplace la valeur par :

   metadataBase: new URL('https://voxspm.com'),

b) Ne touche RIEN d'autre dans le fichier. Pas les autres metadata
   (title, description, openGraph, twitter, etc.), pas les imports,
   pas la structure du composant RootLayout, rien.

c) Si tu détectes que metadataBase est absent (cas improbable), ne
   l'ajoute PAS sans signaler l'anomalie dans le récap final, et
   demande confirmation avant toute action.

d) Si tu détectes que metadataBase utilise déjà voxspm.com (domaine
   déjà à jour), ne modifie rien et signale-le dans le récap.

e) Vérifie qu'aucune AUTRE occurrence de 'voxspm.vercel.app' n'existe
   dans layout.tsx (recherche simple sur la chaîne). Si tu en trouves
   d'autres, NE les modifie PAS automatiquement : signale-les dans le
   récap final avec leur contexte (ligne, rôle dans le fichier) pour
   que JC décide.

RÉCAPITULATIF DEMANDÉ
=====================
En fin de session, fournis un récap court listant :
- Confirmation que metadataBase a bien été remplacé par
  new URL('https://voxspm.com')
- Numéro de ligne approximatif de la modification
- Confirmation qu'aucune autre partie du fichier n'a été touchée
- Toute autre occurrence de 'voxspm.vercel.app' détectée dans layout.tsx
  (avec contexte, sans la modifier)
- Toute anomalie (metadataBase absent, déjà à jour, format inattendu)

Pas de commentaires sur la qualité du code.