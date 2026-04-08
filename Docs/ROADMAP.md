# VoxSPM — Roadmap

> Lu à la demande pour planification ou état d'avancement.

---

## 14. PRIORITÉS MVP (P0 UNIQUEMENT POUR V1)

### P0 — V1 obligatoire
- [ ] Schéma DB + migrations + seed tags
- [ ] RLS policies complètes
- [ ] Session anonyme Supabase (createBrowserClient)
- [ ] Page `/` — liste sondages actifs + filtre par tag
- [ ] Page `/poll/[slug]` — détail + vote + résultats + géo-breakdown
- [ ] `<GeoModal />` — choix localisation 1ère visite
- [ ] Anti-doublon vote (DB + Server Action)
- [ ] Page `/proposer` — formulaire proposition
- [ ] Route `/admin` — dashboard + table sondages
- [ ] Admin : valider / archiver / supprimer sondages
- [ ] Admin : gestion tags (CRUD)
- [ ] Middleware auth admin
- [ ] Deploy Vercel + variables env configurées

### P1 — V1.1 après stabilisation
- [ ] Realtime votes (barres animées sans reload)
- [ ] URL directe `/poll/[slug]` — OG tags SEO
- [ ] Admin : édition complète sondage avant validation
- [ ] Admin : expiration auto (expires_at + Edge Function cron)
- [ ] Rate limiting propositions (max 3 pending par user)
- [ ] Admin : stats détaillées par sondage

### P2 — V2 future
- [ ] Export CSV résultats
- [ ] Stats globales avancées (courbe temporelle)
- [ ] Partage réseaux sociaux (FB/Twitter)
- [ ] Mise à jour localisation utilisateur depuis ses préférences
