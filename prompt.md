[SESSION FRESH RECOMMANDÉE] · [MODÈLE: HAIKU SUFFIT] · [BUILD: OBLIGATOIRE]

*Mission P2.3-light : création d'une page /contact statique simple + ajout d'un lien dans le Footer. Aucune logique, juste du markup et du texte. Haiku largement suffisant. Session fresh car mission sans rapport avec P1.4. Build obligatoire (nouveau route Next.js).*

CONTEXTE
========
VoxSPM — création d'une page /contact qui sert à la fois de mentions
légales minimales, de charte de modération condensée, et de point de
contact pour les utilisateurs. Page statique, zéro logique, texte en dur.
Style sobre type page légale, cohérent avec le design Apple Civic Light.

FICHIERS AUTORISÉS
==================
- src/app/contact/page.tsx           (CRÉER)
- src/components/layout/Footer.tsx   (MODIFIER : ajouter lien "Contact")

FICHIERS INTERDITS
==================
Tout le reste. En particulier :
- src/lib/**
- src/app/api/**
- src/app/admin/**
- src/app/proposer/**
- src/components/pages/**
- supabase/migrations/**
- middleware.ts

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

ÉTAPE 1 — Créer src/app/contact/page.tsx
-----------------------------------------
Server Component (pas besoin de 'use client', pas d'interactivité).
Exporte un default function ContactPage().

Contenu exact à inclure dans le JSX (texte en dur, aucune variable) :

Structure globale :
- Container centré max-w-2xl mx-auto
- Padding vertical généreux (py-16 sm:py-20)
- Padding horizontal px-6
- Background transparent (hérite du body)

Exigences de style :
- Titre principal en Instrument Serif, text-4xl sm:text-5xl, text-slate-900
- Sous-titre intro en DM Sans italique, text-slate-600
- Titres de section en DM Sans, text-lg font-semibold, text-slate-900, mt-10 mb-3
- Corps de texte en DM Sans, text-[15px], text-slate-700, leading-relaxed
- Email affiché comme lien mailto: avec color text-[#1A6FB5] hover:underline
- Listes <ul> avec list-disc list-inside, text-slate-700, text-[15px]
- Séparateurs subtils : <div className="h-px bg-slate-200 my-10" /> entre les grandes sections

Contenu textuel exact (respecte la ponctuation et les accents) :

<main> avec le container ci-dessus, puis :

## Titre
<h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-slate-900 leading-tight">
  Contact & Informations
</h1>

## Intro
<p className="mt-3 text-slate-600 italic">
  VoxSPM est un projet citoyen indépendant, bénévole et sans but lucratif,
  dédié à Saint-Pierre-et-Miquelon et sa diaspora.
</p>

## Séparateur
<div className="h-px bg-slate-200 my-10" />

## Section Éditeur
<h2>Éditeur du site</h2>
<p>
  Équipe VoxSPM. Projet personnel édité depuis Saint-Pierre-et-Miquelon,
  à titre non commercial.
</p>

## Section Contact
<h2>Contact</h2>
<p>
  Pour toute question, signalement ou demande, écrire à :
</p>
<p className="mt-2">
  <a href="mailto:voxspm.contact@gmail.com" className="text-[#1A6FB5] hover:underline font-medium">
    voxspm.contact@gmail.com
  </a>
</p>

## Section Hébergement
<h2>Hébergement technique</h2>
<ul className="mt-2 space-y-1 list-disc list-inside">
  <li>Application web : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
  <li>Base de données : Supabase Inc., 970 Toa Payoh North #07-04, Singapour</li>
</ul>

## Séparateur
<div className="h-px bg-slate-200 my-10" />

## Section Modération
<h2>Modération des sondages</h2>
<p>
  Les propositions de sondages soumises par les utilisateurs sont examinées
  avant publication dans un délai indicatif de 72 heures. Sont refusées les
  propositions non constructives, diffamatoires, commerciales, ciblant
  nominativement un individu, ou sans lien avec l'archipel et sa vie civique.
</p>
<p className="mt-3">
  Chaque utilisateur peut soumettre jusqu'à 3 propositions en attente de
  modération simultanément. Cette limite se libère à mesure que les propositions
  sont validées ou refusées.
</p>

## Section Signalement
<h2>Signalement d'un contenu</h2>
<p>
  Pour signaler un contenu problématique ou demander le retrait d'un sondage
  publié, écrire à <a href="mailto:voxspm.contact@gmail.com" className="text-[#1A6FB5] hover:underline">voxspm.contact@gmail.com</a> en
  précisant le sondage concerné et la raison du signalement. Chaque signalement
  sera examiné avec attention dans les meilleurs délais.
</p>

## Séparateur
<div className="h-px bg-slate-200 my-10" />

## Section Données personnelles
<h2>Données personnelles & confidentialité</h2>
<p>
  VoxSPM ne collecte aucune donnée permettant d'identifier directement ses
  utilisateurs. Seules sont enregistrées :
</p>
<ul className="mt-3 space-y-1 list-disc list-inside">
  <li>Un identifiant de session anonyme, généré techniquement</li>
  <li>Une géolocalisation déclarée par l'utilisateur : Saint-Pierre, Miquelon ou Extérieur</li>
  <li>Les votes enregistrés et les propositions de sondages soumises</li>
  <li>Un pseudonyme optionnel, si le proposant choisit d'en fournir un</li>
</ul>
<p className="mt-4">
  Aucun cookie publicitaire, aucun traceur tiers, aucune mesure d'audience
  externe n'est utilisé. Seuls des cookies techniques strictement nécessaires
  au fonctionnement du site (session anonyme) sont déposés, conformément à la
  directive ePrivacy.
</p>

## Section Propriété intellectuelle
<h2>Propriété intellectuelle</h2>
<p>
  Le code source de VoxSPM est publié en open source sur GitHub à l'adresse
  <a href="https://github.com/freedisk/voxspm" target="_blank" rel="noopener noreferrer" className="text-[#1A6FB5] hover:underline"> github.com/freedisk/voxspm</a>.
  Les contenus publiés (sondages, résultats) restent la propriété de leurs
  auteurs respectifs.
</p>

## Section Droit applicable
<h2>Droit applicable</h2>
<p>
  L'utilisation du site VoxSPM est régie par le droit français. En cas de
  litige, et après tentative de résolution amiable par email, les tribunaux
  compétents de Saint-Pierre-et-Miquelon seront seuls compétents.
</p>

## Footer de page
<p className="mt-12 text-xs text-slate-500 italic text-center">
  Dernière mise à jour : avril 2026
</p>

Notes importantes pour le JSX :
- Tous les <h2> utilisent className="font-semibold text-lg text-slate-900 mt-10 mb-3"
- Tous les <p> hors cas spéciaux utilisent className="text-[15px] text-slate-700 leading-relaxed"
- Les listes <ul> utilisent className="mt-2 space-y-1 list-disc list-inside text-[15px] text-slate-700"
- Respecte scrupuleusement les accents français (é, è, à, ù, ç, etc.)
- Respecte les apostrophes typographiques courbes (') quand c'est possible, sinon droites (')
- Pas d'emoji, pas d'icônes Lucide, la page est purement textuelle

ÉTAPE 2 — Ajouter export const metadata
----------------------------------------
En haut de src/app/contact/page.tsx, ajoute les metadata Next.js :

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Informations — VoxSPM',
  description: 'Contact, hébergement, modération, confidentialité et mentions légales de VoxSPM, le site de sondages citoyens de Saint-Pierre-et-Miquelon.',
};

ÉTAPE 3 — Modifier src/components/layout/Footer.tsx
----------------------------------------------------
a) Ajouter un lien "Contact" dans le Footer, avec le même style que les
   autres liens existants du Footer (reprends EXACTEMENT les classes CSS
   des liens déjà présents, ne réinvente pas le style).

b) Le lien doit être un composant Next.js Link (import Link from 'next/link') :

   <Link href="/contact" className="[classes identiques aux autres liens du footer]">
     Contact
   </Link>

c) Positionner le lien à un endroit logique dans l'ordre existant :
   suggestion d'ordre final : À propos · Contact · Proposer un sondage · Admin
   (ou l'ordre qui correspond le mieux à ce qui est déjà en place).

d) Si Footer.tsx était déjà passé en 'use client' (suite à la mission
   WelcomeModal), tu peux importer Link normalement sans changement.
   Si ce n'est pas le cas, garde-le comme il est (Link fonctionne en
   Server Component aussi).

e) NE modifie AUCUNE autre partie du Footer. Ajoute uniquement le lien
   Contact au bon endroit.

RÉCAPITULATIF DEMANDÉ
=====================
En fin de session, fournis un récap court listant :
- Le fichier créé (src/app/contact/page.tsx) avec confirmation qu'il est
  bien un Server Component et que les metadata sont exportées
- Le fichier modifié (Footer.tsx) avec la ligne exacte ajoutée pour le
  lien Contact et sa position dans l'ordre des liens
- Confirmation que toutes les sections du contenu (Éditeur, Contact,
  Hébergement, Modération, Signalement, Données personnelles, Propriété
  intellectuelle, Droit applicable) sont bien présentes
- Toute incohérence rencontrée (ex: Footer.tsx avec une structure
  inattendue, classes CSS différentes de ce qui est supposé, etc.)

Pas de commentaires sur la qualité du texte légal, pas de suggestions
d'amélioration, juste les faits.