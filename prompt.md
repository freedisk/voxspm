Design refonte complète — Apple Civic Light.

Lis le claude.md et applique les instructions suivantes sur tous les composants existants.

── 1. FONTS + VARIABLES GLOBALES ──────────────────────────

Dans app/globals.css :
- Importer depuis Google Fonts :
  Instrument Serif (ital 0;1) + DM Sans (wght 300;400;500;600)
- Définir ces CSS variables :

:root {
  --white: #FFFFFF;
  --off-white: #F5F7FA;
  --surface: #FFFFFF;
  --surface-2: #F2F4F8;
  --surface-3: #E8ECF2;
  --text-primary: #0A1628;
  --text-secondary: #3D506A;
  --text-muted: #8A9BB0;
  --border: rgba(0,0,0,0.07);
  --border-strong: rgba(0,0,0,0.12);
  --ocean: #1A6FB5;
  --ocean-light: #2E8ED4;
  --ocean-glow: rgba(26,111,181,0.12);
  --miq: #0C9A78;
  --ext: #6B4FA0;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04);
  --shadow-xl: 0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
  --radius: 16px;
  --radius-sm: 10px;
  --radius-lg: 24px;
  --radius-pill: 100px;
}

body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--off-white);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

── 2. TAILWIND CONFIG ──────────────────────────────────────

Dans tailwind.config.ts, ajouter les couleurs custom :
ocean, ocean-light, miq, ext, surface-2, surface-3, text-primary, 
text-secondary, text-muted.

── 3. HEADER ───────────────────────────────────────────────

components/layout/Header.tsx :
- Fond : rgba(245,247,250,0.85) + backdrop-blur(20px) saturate(180%)
- Border-bottom subtile
- Logo : icône 🗳️ dans carré dégradé ocean→miq (32px, radius 8px) 
  + "VoxSPM" en Instrument Serif 20px
- Indicateur géo : pill bleu océan cliquable → ouvre GeoModal
- Bouton "Proposer" : fond text-primary, blanc, pill, hover translateY(-1px)
- Height fixe 60px, sticky top-0, z-index 100

── 4. HERO SECTION ─────────────────────────────────────────

Créer components/layout/Hero.tsx (nouveau composant) :
- Fond : gradient 180deg #F5F7FA → #EEF3FA → #F5F7FA
- Radial glow bleu océan centré en haut (subtle)
- Eyebrow pill : point vert animé (pulse) + "X sondages en cours" (props)
- Titre h1 : Instrument Serif, clamp(40px, 6vw, 68px), letter-spacing -1.5px
  "La voix de " + <em style italic color ocean>"l'archipel"</em>
- Sous-titre : DM Sans 300, 17px, color text-secondary, max-width 480px
- 2 boutons : primary ocean + ghost border
- Stats bar : total_votes + nb sondages réalisés + nb actifs
  Typographie Instrument Serif 32px pour les chiffres
  Données récupérées depuis Supabase (Server Component)
- Intégrer <Hero /> dans app/page.tsx au-dessus de la liste sondages

── 5. TAG FILTER ───────────────────────────────────────────

components/polls/TagFilter.tsx :
- Pill buttons avec border-strong, fond blanc, shadow-sm
- Active : fond ocean, texte blanc, shadow bleu
- Hover : border ocean, texte ocean, fond ocean-glow
- Scrollable horizontal sans scrollbar visible
- Reflète l'état dans l'URL (?tag=transport)

── 6. POLL CARD ────────────────────────────────────────────

components/polls/PollCard.tsx :
- Fond blanc, border var(--border), radius-lg, shadow-sm
- Hover : translateY(-3px), shadow-xl, border bleu subtle
- Accent line : 3px en haut, gradient ocean→miq, opacity 0 → 1 au hover
- Tags : pills colorés (couleur du tag depuis DB)
- Question : DM Sans 500, 15.5px, letter-spacing -0.2px
- Résultats : barres fines 6px (leader 8px), transition width 0.8s
- GeoBreakdown : barres 5px, couleurs fixes SP/Miq/Ext
- Footer : votes count + date + badge Live animé

── 7. VOTE FORM ────────────────────────────────────────────

components/polls/VoteForm.tsx :
- Options : border 1.5px border-strong, radius-sm, hover border-ocean + ocean-glow
- Radio custom : cercle 18px, selected → fond ocean + inset shadow blanc
- Bouton Voter : fond ocean, shadow bleu, hover translateY(-1px)
- Si déjà voté : masquer le formulaire, afficher "Vous avez voté ✓"

── 8. RESULT BARS ──────────────────────────────────────────

components/polls/ResultsBars.tsx :
- Leader highlighted : barre 8px, label font-weight 500
- Autres barres : 6px, label color text-secondary  
- Couleur leader : ocean
- Couleurs suivantes : #93C5E8 (2ème), #CBD5E1 (autres)
- Transition width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)

── 9. GEO BREAKDOWN ────────────────────────────────────────

components/polls/GeoBreakdown.tsx :
- Séparateur top border + label uppercase 10.5px text-muted
- Barres 5px, couleurs fixes :
  Saint-Pierre #1A6FB5 | Miquelon #0C9A78 | Extérieur #6B4FA0
- Texte couleur correspondante pour chaque ligne
- Variante compact (PollCard) : barres 4px, texte 10px

── 10. GEO MODAL ───────────────────────────────────────────

components/layout/GeoModal.tsx :
- Overlay : rgba(10,22,40,0.4) + backdrop-blur(8px)
- Carte blanche, radius-lg, shadow-xl, max-width 420px
- 3 choix avec emoji + titre + sous-titre
- Hover par choix : border + fond coloré (sp=ocean, miq=vert, ext=violet)
- "Plus tard" : lien texte underline en bas

── 11. PAGE PROPOSER ───────────────────────────────────────

app/proposer/page.tsx + formulaire :
- Fond off-white, max-width 680px centré
- Lien retour ← en haut
- Titre Instrument Serif avec <em italic ocean>
- Card blanche avec shadow-md pour le formulaire
- Inputs : border 1.5px, focus border-ocean + shadow ring bleu 10%
- Options : dot coloré à gauche + input flex
- Bouton submit : ocean full-width shadow-bleu

── 12. FAB MOBILE ──────────────────────────────────────────

Dans app/page.tsx, ajouter un FAB visible uniquement mobile (md:hidden) :
- Sticky bottom: 24px
- "✦ Proposer un sondage" → /proposer
- Fond text-primary, blanc, pill, shadow forte
- Position fixed

── 13. APP LAYOUT ──────────────────────────────────────────

app/layout.tsx :
- Ajouter le lien Google Fonts dans <head>
- background: var(--off-white) sur <body>

── RÈGLES GÉNÉRALES ────────────────────────────────────────

- NE PAS modifier la logique métier (hooks, Server Actions, Supabase)
- NE PAS modifier middleware.ts ni les fichiers lib/
- NE PAS modifier les pages admin (garder le design actuel admin)
- Commenter les décisions design avec // 🎨 Intent: ...
- Après chaque composant modifié, vérifier TypeScript
- À la fin : npm run build doit passer sans erreur