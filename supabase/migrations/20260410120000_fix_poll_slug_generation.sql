-- ============================================================================
-- 20260410120000_fix_poll_slug_generation.sql
-- Fix bug : generate_poll_slug() supprimait les majuscules au lieu de les
-- convertir, car regexp_replace('[^a-z0-9\s-]', ...) était appliqué AVANT
-- lower(). Résultat observé : "La Collectivité" → "a ollectivite".
--
-- Fix : appliquer lower() AVANT regexp_replace(), et utiliser une version
-- robuste qui normalise les espaces et dédoublonne les tirets.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_poll_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL THEN
    -- 1. Minuscules AVANT tout
    base_slug := lower(NEW.question);

    -- 2. Retirer les accents via translate (chars minuscules uniquement,
    --    puisque lower() est déjà passé)
    base_slug := translate(
      base_slug,
      'àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿ',
      'aaaaaaaceeeeiiiidnooooouuuuyty'
    );

    -- 3. Supprimer tout ce qui n'est pas a-z, 0-9, espace ou tiret
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');

    -- 4. Normaliser les espaces et tabs en tirets
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');

    -- 5. Dédoublonner les tirets consécutifs
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');

    -- 6. Retirer les tirets en début et fin
    base_slug := trim(both '-' from base_slug);

    -- 7. Tronquer à 60 caractères
    base_slug := left(base_slug, 60);

    -- 8. Retirer un éventuel tiret final après troncature
    base_slug := trim(both '-' from base_slug);

    -- 9. Fallback si slug vide (question composée uniquement de caractères spéciaux)
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'sondage';
    END IF;

    -- 10. Garantir l'unicité en ajoutant un suffixe numérique si nécessaire
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.polls WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note : le trigger `before_poll_insert_slug` existant pointe déjà vers cette
-- fonction via son nom. CREATE OR REPLACE met à jour l'implémentation sans
-- avoir besoin de recréer le trigger.
