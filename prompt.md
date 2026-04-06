Étape 6 — Pages Admin.

Crée dans l'ordre :

── app/admin/ ───────────────────────────────────────────

1. app/admin/layout.tsx
   → vérifie session + role='admin' côté serveur (createServerClient)
   → si non-admin → redirect('/')
   → sidebar navigation : Dashboard | Sondages | Tags
   → affiche l'email admin connecté + bouton déconnexion

2. app/admin/page.tsx — Dashboard principal
   → Stats cards : Actifs | En attente | Archivés | Votes total
   → Répartition géo globale (votes_sp + votes_miq + votes_ext sur tous les polls)
   → Table de TOUS les sondages (actifs + pending + archivés)
   → Colonnes : Question | Tags | Statut | Votes | Géo (pills SP/Miq/Ext) | Date | Actions
   → Filtre par statut (tabs : Tous | Actifs | En attente | Archivés)
   → Recherche texte par question
   → Actions par ligne :
     - pending → bouton "✅ Valider" + "❌ Rejeter"
     - active → bouton "📊 Stats" + "✏️ Éditer" + "Archive"
     - archived → bouton "♻️ Réactiver" + "🗑️ Supprimer"
   → Supprimer = double confirmation (modal)

3. app/admin/polls/[id]/page.tsx — Édition sondage
   → Formulaire : modifier question, proposer_name, tags, expires_at
   → Modifier les options existantes + ajouter/supprimer options
   → Changer le statut manuellement
   → Bouton "Sauvegarder" → Server Action updatePoll()
   → Ajouter updatePoll() dans lib/actions/admin.ts

4. app/admin/tags/page.tsx — Gestion tags
   → Liste tous les tags avec : icône, nom, couleur, nb de sondages associés
   → Formulaire création : nom, slug (auto-généré), couleur (color picker), icône (emoji)
   → Modifier nom/couleur/icône d'un tag existant
   → Supprimer un tag (si 0 sondages associés, sinon warning)
   → Réordonner via champ order_index

── components/admin/ ────────────────────────────────────

5. admin/StatsCards.tsx
   → 4 cards métriques + répartition géo

6. admin/PollsTable.tsx
   → table avec filtres, recherche, actions
   → géo pills SP/Miq/Ext sur chaque ligne

7. admin/TagsManager.tsx
   → CRUD tags avec formulaire inline

Même palette sombre que le reste de l'app.
Même pattern { success, error, code } pour toutes les actions.
Commentaires WHY.