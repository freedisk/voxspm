# VoxSPM — Design System Apple Civic Light

> Lu à la demande quand la session traite du design, des couleurs,
> de la typographie ou des composants visuels.

---

## 8. DESIGN SYSTEM — Apple Civic Light

**Theme** : light, minimaliste, Apple-style. Défini dans `globals.css` via CSS variables + `@theme inline`.

**Typographie** :
- Titres : `Instrument Serif` (italic pour les accents) — chargé via `<link>` dans layout.tsx
- Corps : `DM Sans` (300/400/500/600)

```css
/* Palette — globals.css :root */
--white: #FFFFFF;
--off-white: #F5F7FA;        /* fond app */
--surface: #FFFFFF;           /* cards */
--surface-2: #F2F4F8;
--surface-3: #E8ECF2;
--text-primary: #0A1628;
--text-secondary: #3D506A;
--text-muted: #8A9BB0;
--border: rgba(0,0,0,0.07);
--border-strong: rgba(0,0,0,0.12);
--ocean: #1A6FB5;             /* accent principal */
--ocean-light: #2E8ED4;
--ocean-glow: rgba(26,111,181,0.12);
--miq: #0C9A78;               /* Miquelon */
--ext: #6B4FA0;               /* Extérieur */
--success: #1CA87A;
--warning: #E8A020;
--danger: #D94F4F;
```

**Ombres** : `--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-xl`
**Rayons** : `--radius: 16px` / `--radius-sm: 10px` / `--radius-lg: 24px` / `--radius-pill: 100px`

**Géo-couleurs (non interchangeables) :**
```
Saint-Pierre → #1A6FB5 (ocean)
Miquelon     → #0C9A78 (miq)
Extérieur    → #6B4FA0 (ext)
```

**Notes design** :
- PollCard : hover lift -3px + accent line dégradé ocean→miq (CSS class `.poll-card-hover`)
- ResultsBars : leader 8px ocean, 2nd #93C5E8, reste #CBD5E1
- Header : glassmorphism `blur(20px) saturate(180%)`
- Pas de `tailwind.config.ts` — Tailwind v4 utilise `@theme inline` dans CSS
