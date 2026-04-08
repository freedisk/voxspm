[OK SESSION EN COURS] · [MODÈLE: HAIKU SUFFIT] · [BUILD: OBLIGATOIRE]

Mission cleanup : retirer les 3 console.log de debug ajoutés lors de la
mission précédente. Build obligatoire ensuite car on pousse en prod.

FICHIERS AUTORISÉS
==================
- src/components/polls/PollModal.tsx
- src/components/pages/HomeClient.tsx

FICHIERS INTERDITS
==================
- Tous les autres

COMMANDES INTERDITES
====================
- npm run build, git *, npm run dev

ÉTAPES
======
1. Dans les 2 fichiers, supprimer toutes les occurrences de
   console.log('[DEBUG vote]' ... ) — il y en a 3 au total
   (2 dans PollModal.tsx, 1 dans HomeClient.tsx).
2. Vérifier qu'aucune autre ligne n'est touchée.

RÉCAPITULATIF
=============
- Nombre de console.log supprimés (attendu : 3)
- Confirmation qu'aucune autre ligne n'a été modifiée