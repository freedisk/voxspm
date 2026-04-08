[SESSION FRESH RECOMMANDÉE] · [MODÈLE: HAIKU SUFFIT] · [BUILD: SKIP]

*Mission documentation sync : mise à jour des fichiers docs/ et CLAUDE.md pour refléter l'état réel du code après les missions P1.4 (rate limit), WelcomeModal et /contact. Pur texte, aucun code métier touché. Haiku suffit. Build skip car zéro modif code.*

CONTEXTE
========
VoxSPM — mise à jour documentaire du repo. Les fichiers docs/ ont pris
du retard sur l'état réel du code depuis plusieurs missions. Cette session
est exclusivement dédiée à la mise à jour de la doc. AUCUN fichier de code
métier ne doit être modifié.

Missions livrées mais non documentées :
1. WelcomeModal "À propos" (composant client + branchement Footer + custom event)
2. P1.4 Rate limiting (colonne user_id, route check-limit, bandeau bloquant)
3. Page /contact (Server Component, mentions légales minimales)
4. P1.3 expiration auto : REPOUSSÉ post-lancement (à documenter comme tel)

FICHIERS AUTORISÉS
==================
- CLAUDE.md                     (MODIFIER : mise à jour mineure)
- docs/ARCHITECTURE.md          (MODIFIER : ajouts)
- docs/DATABASE.md              (MODIFIER : ajout colonne user_id + index)
- docs/ROADMAP.md               (MODIFIER : mise à jour statuts)

Si un de ces fichiers n'existe pas dans le repo, signale-le dans le récap
final et ne le crée PAS — on verra au cas par cas.

FICHIERS INTERDITS
==================
TOUT le reste. En particulier :
- src/**            (aucune modif de code, même d'un commentaire)
- supabase/**       (aucune modif de migration)
- public/**
- package.json
- middleware.ts
- tout fichier de config

COMMANDES INTERDITES
====================
Ne JAMAIS lancer dans cette session :
- npm run build           (inutile, zéro modif code)
- git add / commit / push (JC gère les commits manuellement)
- git status / git diff
- npm run dev             (inutile)

Tu te contentes d'éditer les fichiers docs et de fournir un récap final.

ÉTAPES SÉQUENTIELLES
====================

ÉTAPE 1 — Lire l'état actuel des fichiers docs
-----------------------------------------------
Commence par lire les 4 fichiers listés (CLAUDE.md, docs/ARCHITECTURE.md,
docs/DATABASE.md, docs/ROADMAP.md) pour comprendre leur structure actuelle
et leur ton éditorial. Tu dois RESPECTER la structure et le style existants,
pas les réécrire.

Si un fichier est introuvable, signale-le dans le récap final et continue
avec les autres.

ÉTAPE 2 — Mise à jour de docs/ARCHITECTURE.md
----------------------------------------------
Ajoute les informations suivantes dans les sections appropriées
(si les sections n'existent pas, crée-les en respectant le style du
fichier) :

a) Section Composants (ou équivalente) :
   - Ajouter WelcomeModal (src/components/pages/WelcomeModal.tsx) :
     "Client Component, modale de bienvenue affichée à la première visite
     de la home. Tracking via localStorage (clé voxspm_welcome_seen).
     Rouvrable via custom event window 'voxspm:open-welcome'. Contenu :
     6 blocs d'explication du concept avec icônes Lucide."

b) Section Pages publiques (ou équivalente) :
   - Ajouter /contact (src/app/contact/page.tsx) :
     "Server Component statique. Mentions légales minimales, charte de
     modération condensée, contact, hébergement, RGPD light. Style sobre
     Apple Civic Light. Remplace les missions initiales P2.1 (À propos),
     P2.2 (Charte), P2.3 (Mentions légales) et P2.4 (Contact) en une page
     unique."
   - Ajouter /proposer (mise à jour) :
     "Client Component avec rate limiting proactif. State checkState
     ('loading' | 'allowed' | 'blocked'), fonction checkLimit() réutilisable
     appelée au montage et après chaque soumission réussie. Interception
     du code RATE_LIMIT_EXCEEDED (429) pour bascule gracieuse sur bandeau
     bloquant. Fail-open sur erreur réseau (filet serveur reste actif)."

c) Section Routes API (ou équivalente) :
   - Ajouter GET /api/propose/check-limit :
     "Route Next.js force-dynamic. Renvoie { canPropose: boolean, pendingCount:
     number }. Lit la session anonyme via supabase.auth.getUser() côté serveur
     (cookies). Compte les polls WHERE user_id = session.id AND status = 'pending'.
     Fail-open si pas de session. Utilise la constante MAX_PENDING_PROPOSALS = 3
     de src/lib/constants.ts."
   - Mettre à jour POST /api/propose :
     "Ajout : check rate limit avant INSERT (via getUser + count), renvoie 429
     avec code RATE_LIMIT_EXCEEDED si >= MAX_PENDING_PROPOSALS. Persiste
     user_id à l'INSERT (user?.id ?? null)."

d) Section Patterns transverses (ou équivalente, sinon la créer) :
   - Ajouter "Custom events cross-component" :
     "Pattern utilisé pour ouvrir WelcomeModal depuis Footer sans Context
     Provider. Le Footer dispatch window.dispatchEvent(new CustomEvent('voxspm:open-welcome'))
     et HomeClient écoute via window.addEventListener dans un useEffect.
     Solution légère pour communication entre composants qui ne sont pas
     parents/enfants directs."

e) Section Composants layout (ou équivalente) :
   - Footer est maintenant 'use client' (depuis WelcomeModal) pour supporter
     les onClick. Ajout du lien vers /contact à côté du bouton "À propos".

ÉTAPE 3 — Mise à jour de docs/DATABASE.md
------------------------------------------
a) Section Schéma de la table polls (ou équivalente) :
   - Ajouter la colonne user_id :
     "user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL.
     Nullable pour préserver l'historique des polls seed/legacy qui n'ont
     pas de proposant identifié. Persisté à l'INSERT via /api/propose pour
     les nouvelles propositions anonymes. Jamais affiché publiquement,
     sert uniquement au rate limiting et au tracking interne."

b) Section Index (ou équivalente) :
   - Ajouter l'index partiel :
     "polls_user_id_status_idx : index partiel sur (user_id, status)
     WHERE user_id IS NOT NULL. Optimise les requêtes COUNT du rate limit
     (check des propositions pending par user). Plus léger qu'un index
     complet car les polls seed/legacy sont exclus."

c) Section Règles métier (ou équivalente, sinon la créer) :
   - Ajouter "Rate limiting propositions" :
     "Constante MAX_PENDING_PROPOSALS = 3 définie dans src/lib/constants.ts.
     Un même user_id (session anonyme) ne peut pas avoir plus de 3 sondages
     en statut 'pending' simultanément. Dès qu'un est validé (active) ou
     rejeté (supprimé), le compteur baisse. Check côté client (proactif)
     via /api/propose/check-limit et côté serveur (filet) dans /api/propose."

d) Section Migrations (ou équivalente, sinon la créer) :
   - Mentionner l'existence du dossier supabase/migrations/ créé lors de P1.4 :
     "Les migrations SQL sont versionnées dans supabase/migrations/ à titre
     d'historique git. Elles sont appliquées manuellement via Supabase
     Studio SQL Editor, pas via supabase db push. Première migration
     versionnée : 20260408120000_add_user_id_to_polls.sql (ajout user_id
     à polls + index partiel)."

ÉTAPE 4 — Mise à jour de docs/ROADMAP.md
-----------------------------------------
a) Marquer comme DONE ✅ :
   - P1.1 (si pas déjà fait)
   - P1.2 (si pas déjà fait)
   - P1.4 Rate limiting propositions

b) Ajouter en section "Livré hors roadmap initiale" (ou équivalente) :
   - ✅ WelcomeModal "À propos" (modale + lien footer + custom event)
   - ✅ Page /contact (mentions légales minimales, remplace P2.1/P2.2/P2.3/P2.4)

c) Mettre à jour le statut de P1.3 :
   - Marquer P1.3 Expiration auto comme "⏸️ REPOUSSÉ post-lancement"
   - Ajouter une note : "Décision prise en avril 2026 : pas d'utilisateurs réels
     encore, impossible de calibrer la durée d'expiration par défaut. Sera
     réévalué 2-3 mois après le lancement public si le besoin émerge
     réellement. Alternative envisagée : expiration optionnelle (expires_at
     nullable + champ admin optionnel), pas automatique."

d) Marquer comme supprimées de la roadmap (fusionnées dans /contact) :
   - ~~P2.1 Page À propos complète~~ → fusionnée dans /contact
   - ~~P2.2 Charte de modération~~ → condensée dans /contact section Modération
   - ~~P2.3 Mentions légales complètes~~ → remplacée par /contact minimaliste
   - ~~P2.4 Formulaire de contact~~ → remplacé par mailto dans /contact

e) Missions restantes avant lancement :
   - P2.5 Branchement domaine www.voxspm.com (prochaine mission)
   - P2.6 Favicon pro + manifest PWA (bonus optionnel)
   - LICENSE.md MIT à la racine du repo (30 secondes, hors roadmap)

ÉTAPE 5 — Mise à jour de CLAUDE.md (racine)
--------------------------------------------
a) Section "Fichiers protégés" (ou équivalente) :
   - Ajouter src/lib/constants.ts à la liste des protégés
   - Ajouter src/app/api/propose/check-limit/** à la liste
   - Confirmer que src/app/api/propose/route.ts est déjà protégé (normalement oui)

b) Section "Décisions architecturales non révisables" (ou équivalente) :
   - Ajouter : "Rate limiting propositions : max 3 pending par user_id.
     Check côté serveur (429 + code RATE_LIMIT_EXCEEDED) ET côté client
     (checkLimit proactif). user_id persisté à l'INSERT via user?.id ?? null."
   - Ajouter : "WelcomeModal : tracking première visite via localStorage
     (clé voxspm_welcome_seen). Communication cross-component via custom
     event window 'voxspm:open-welcome'."
   - Ajouter : "Page /contact : remplace définitivement les missions initiales
     P2.1/P2.2/P2.3/P2.4. Ne pas recréer de pages séparées À propos /
     Charte / Mentions légales / Formulaire contact."

c) Section "État prod actuel" ou équivalente :
   - Mettre à jour pour inclure : WelcomeModal, rate limit P1.4, /contact
   - Si aucune section de ce type n'existe, ne la crée pas (CLAUDE.md est slim)

d) Respecter la taille slim du CLAUDE.md : pas d'ajout massif, juste des
   lignes ciblées. Si tu dois ajouter beaucoup, privilégie les docs/ et
   laisse un pointeur dans CLAUDE.md.

RÈGLES TRANSVERSES
==================
- Respecte TOUJOURS le style éditorial et la structure existante des fichiers.
  Tu ajoutes/modifies, tu ne réécris pas.
- Si une info existe déjà, ne la duplique pas.
- Markdown propre : listes avec -, headers avec #, code inline avec backticks.
- Pas de fioriture, pas de "Cette mise à jour...", pas de méta-commentaire
  dans les docs. Tu écris comme si l'info avait toujours été là.
- Aucune date à ajouter dans les docs sauf si le fichier en utilise déjà
  (pas de "Ajouté en avril 2026" dans les docs d'architecture).

RÉCAPITULATIF DEMANDÉ
=====================
En fin de session, fournis un récap court listant :
- Les 4 fichiers modifiés (CLAUDE.md + 3 docs/)
- Pour chacun : les sections ajoutées ou mises à jour (liste de puces)
- Tout fichier introuvable (ex: si docs/ROADMAP.md n'existe pas)
- Toute incohérence rencontrée (ex: structure inattendue, section manquante,
  contradiction entre docs existants)

Pas de résumé verbeux, pas de commentaires sur la qualité.