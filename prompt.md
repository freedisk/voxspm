CONTEXTE
========
Projet : VoxSPM (Next.js 14 App Router, Tailwind)
Mission : Fix visuel mineur — recentrer verticalement l'illustration
du Hero par rapport au bloc texte (titre + sous-titre + CTA).
Le pattern actuel "tombe" visuellement vers le bas et déborde à droite.

FICHIER AUTORISÉ À MODIFIER (et SEULEMENT celui-là)
===================================================
- src/components/layout/Hero.tsx

FICHIERS INTERDITS
==================
- TOUT le reste du projet
- Ne PAS toucher au SVG public/illustrations/hero-pattern.svg
- Ne PAS toucher au Header
- Ne PAS toucher à layout.tsx
- Ne PAS modifier la logique GeoModal ni le contenu textuel

OBJECTIF
========
1. Le container flex du Hero doit avoir items-center (alignement vertical centré)
2. L'illustration doit être visuellement équilibrée par rapport au bloc texte
3. L'illustration ne doit PAS déborder à droite (overflow contenu)
4. Sur desktop : split 60/40 conservé, mais centré verticalement
5. Sur mobile : illustration toujours masquée (hidden md:block conservé)

MODIFICATIONS PRÉCISES
======================

1. Sur le container flex parent (celui qui contient hero-content + hero-illustration) :
   - Ajouter items-center pour centrer verticalement les 2 colonnes
   - Vérifier qu'il y a bien gap entre les 2 colonnes (gap-8 ou gap-12)

2. Sur le wrapper hero-illustration (la div qui contient le <Image>) :
   - Ajouter overflow-hidden pour empêcher tout débordement
   - S'assurer que la taille est contrainte (max-w-full)
   - Position relative si besoin

3. Sur le composant <Image> du pattern :
   - Garder priority
   - className doit inclure : w-full h-auto object-contain
   - Conserver alt="" et aria-hidden="true"
   - Si besoin, ajouter une max-height pour éviter qu'elle soit plus haute que le contenu texte (par exemple max-h-[500px])

4. Vérifier que la section Hero parente n'a pas de overflow visible qui laisserait le SVG dépasser

CONTRAINTES STRICTES
====================
- Ne RIEN changer d'autre dans Hero.tsx (titre, sous-titre, CTA, badge "1 sondage en cours", stats row)
- Ne PAS toucher au SVG source
- Ne PAS installer de dépendance
- Ne PAS modifier tailwind.config
- À la fin : npm run build doit passer sans erreur

VALIDATION FINALE
=================
1. npm run build passe sans erreur
2. Récapituler les modifications exactes faites dans Hero.tsx (avant/après sur les classes modifiées)
3. Confirmer qu'aucun autre fichier n'a été touché