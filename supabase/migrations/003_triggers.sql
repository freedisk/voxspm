-- ============================================================================
-- 003_triggers.sql — VoxSPM : Triggers et fonctions
-- ============================================================================

-- ─── 1. Auto-create profile quand un user Supabase est cree ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'anon')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. Apres INSERT vote → update compteurs denormalises ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementer options.votes_count
  UPDATE public.options
  SET votes_count = votes_count + 1
  WHERE id = NEW.option_id;

  -- Incrementer polls.total_votes + compteur geo
  UPDATE public.polls
  SET
    total_votes = total_votes + 1,
    votes_sp  = votes_sp  + CASE WHEN NEW.location = 'saint_pierre' THEN 1 ELSE 0 END,
    votes_miq = votes_miq + CASE WHEN NEW.location = 'miquelon'     THEN 1 ELSE 0 END,
    votes_ext = votes_ext + CASE WHEN NEW.location = 'exterieur'    THEN 1 ELSE 0 END
  WHERE id = NEW.poll_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_inserted
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vote();

-- ─── 3. Auto-generer slug depuis question ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_poll_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL THEN
    base_slug := lower(regexp_replace(
      translate(NEW.question,
        'àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞ',
        'aaaaaaaceeeeiiiidnooooouuuuytyaaaaaaaceeeeiiiidnooooouuuuyt'
      ),
      '[^a-z0-9\s-]', '', 'g'
    ));
    base_slug := trim(regexp_replace(base_slug, '\s+', '-', 'g'));
    base_slug := left(base_slug, 60);
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

CREATE TRIGGER before_poll_insert_slug
  BEFORE INSERT ON public.polls
  FOR EACH ROW EXECUTE FUNCTION public.generate_poll_slug();
