-- ============================================================================
-- seed.sql — VoxSPM : Tags initiaux SPM
-- ============================================================================

INSERT INTO public.tags (name, slug, color, icon, order_index) VALUES
  ('Environnement', 'environnement', '#10A585', '🌿', 1),
  ('Transport',     'transport',     '#1B7FC4', '🚌', 2),
  ('Culture',       'culture',       '#7B5EA7', '🎭', 3),
  ('Urbanisme',     'urbanisme',     '#E8A020', '🏗️', 4),
  ('Économie',      'economie',      '#D94F4F', '💼', 5),
  ('Social',        'social',        '#10A585', '🤝', 6),
  ('Éducation',     'education',     '#1B7FC4', '📚', 7),
  ('Santé',         'sante',         '#1CA87A', '🏥', 8),
  ('Autre',         'autre',         '#4B5F7C', '📌', 9);
