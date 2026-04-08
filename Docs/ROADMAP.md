# VoxSPM — Roadmap

> Lu à la demande pour planification ou état d'avancement.

---

## 14. PRIORITÉS MVP (P0 UNIQUEMENT POUR V1)

### P0 — V1 obligatoire
- [x] Schéma DB + migrations + seed tags
- [x] RLS policies complètes
- [x] Session anonyme Supabase (createBrowserClient)
- [x] Page `/` — liste sondages actifs + filtre par tag
- [x] Page `/poll/[slug]` — détail + vote + résultats + géo-breakdown
- [x] `<GeoModal />` — choix localisation 1ère visite
- [x] Anti-doublon vote (DB + Server Action)
- [x] Page `/proposer` — formulaire proposition
- [x] Route `/admin` — dashboard + table sondages
- [x] Admin : valider / archiver / supprimer sondages
- [x] Admin : gestion tags (CRUD)
- [x] Middleware auth admin
- [x] Deploy Vercel + variables env configurées

### P1 — V1.1 après stabilisation
- [x] P1.1 Realtime votes (barres animées sans reload)
- [x] P1.2 URL directe `/poll/[slug]` — OG tags SEO
- [x] P1.3 Admin : édition complète sondage avant validation
- [x] P1.4 Rate limiting propositions (max 3 pending par user)
- [ ] Admin : stats détaillées par sondage

### P1.3 — Expiration auto
- ⏸️ **REPOUSSÉ post-lancement**
  Décision prise en avril 2026 : pas d'utilisateurs réels encore, impossible
  de calibrer la durée d'expiration par défaut. Sera réévalué 2-3 mois après
  le lancement public si le besoin émerge réellement. Alternative envisagée :
  expiration optionnelle (expires_at nullable + champ admin optionnel), pas
  automatique.

### Livré hors roadmap initiale
- [x] **WelcomeModal "À propos"** — Modale + lien footer + custom event
- [x] **Page `/contact`** — Mentions légales minimales, remplace P2.1/P2.2/P2.3/P2.4

### P2 — V2 future (fusionnées / supprimées)
- ~~P2.1 Page À propos complète~~ → fusionnée dans `/contact`
- ~~P2.2 Charte de modération~~ → condensée dans `/contact` section Modération
- ~~P2.3 Mentions légales complètes~~ → remplacée par `/contact` minimaliste
- ~~P2.4 Formulaire de contact~~ → remplacé par mailto dans `/contact`
- [ ] P2.5 Branchement domaine www.voxspm.com (prochaine mission)
- [ ] P2.6 Favicon pro + manifest PWA (bonus optionnel)
- [ ] LICENSE.md MIT à la racine du repo (30 secondes, hors roadmap)
- [ ] Export CSV résultats
- [ ] Stats globales avancées (courbe temporelle)
- [ ] Partage réseaux sociaux (FB/Twitter)
- [ ] Mise à jour localisation utilisateur depuis ses préférences
