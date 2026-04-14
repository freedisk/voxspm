# .githooks — Hooks git versionnés de VoxSPM

Ce dossier contient les hooks git partagés du projet. Contrairement à
`.git/hooks/` (local à chaque clone), ce dossier est versionné et
propagé à toute nouvelle installation.

## Activation (à faire une fois par clone du repo)

Depuis la racine du projet :
```
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

La première commande dit à git d'utiliser ce dossier comme source
des hooks. La seconde rend le script exécutable (requis sur Unix,
ignoré sur Windows mais sans effet négatif).

## Hooks disponibles

### `pre-commit`

Bloque tout commit qui toucherait à la liste de fichiers protégés
VoxSPM : hooks applicatifs, clients Supabase, actions admin, contextes
auth, constantes métier, routes admin et API, migrations, middleware.

**Bypass intentionnel** (rare, uniquement pour une modification
volontaire et reviewée d'un fichier protégé) :
```
git commit --no-verify
```

## Mise à jour de la liste des fichiers protégés

La liste est maintenue dans `.githooks/pre-commit`, tableau
`PROTECTED_PATTERNS`. Elle doit rester synchronisée avec la section
« Fichiers protégés » des instructions projet Claude AI.
