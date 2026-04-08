-- Cleanup duplicate tags from faulty seed script
-- The seed script created 6 duplicate tags with slug prefix 'seed-' instead
-- of reusing existing canonical tags. All 6 had zero poll_tags links at the
-- time of cleanup, so direct deletion was safe.
-- Also fixes the "ethique" tag which was missing proper capitalization and accent.
-- Adds a case-insensitive unique index on name to prevent future duplicates.
-- This file is tracked in git for history but was applied manually via Supabase Studio.

-- Step 1: Delete orphan seed-* tags (0 links verified beforehand)
DELETE FROM public.tags WHERE slug LIKE 'seed-%';

-- Step 2: Fix "ethique" → "Éthique" (consistency with other tag names)
UPDATE public.tags 
SET name = 'Éthique' 
WHERE slug = 'ethique';

-- Step 3: Prevent future duplicates with case-insensitive unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS tags_name_unique_ci 
  ON public.tags (LOWER(name));

-- Documentation
COMMENT ON INDEX public.tags_name_unique_ci IS
  'Case-insensitive unique constraint on tag names. Prevents duplicate tags like "Transport" and "transport" or "Éthique" and "ethique" from coexisting.';