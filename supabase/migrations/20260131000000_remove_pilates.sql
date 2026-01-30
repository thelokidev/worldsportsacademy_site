-- Remove Pilates sport and all related data
-- Order matters for FKs: child tables first, then sports

DO $$
DECLARE
  v_pilates_id UUID;
BEGIN
  SELECT id INTO v_pilates_id FROM public.sports WHERE name = 'pilates' LIMIT 1;

  IF v_pilates_id IS NULL THEN
    RAISE NOTICE 'Pilates sport not found; skipping removal.';
    RETURN;
  END IF;

  -- 1. drop_in_pricing (references sports)
  DELETE FROM public.drop_in_pricing WHERE sport_id = v_pilates_id;

  -- 2. sport_settings (references sports)
  DELETE FROM public.sport_settings WHERE sport_id = v_pilates_id;

  -- 3. training_programs (references sports)
  DELETE FROM public.training_programs WHERE sport_id = v_pilates_id;

  -- 4. membership_plans: remove pilates from sport_ids array
  UPDATE public.membership_plans
  SET sport_ids = array_remove(sport_ids, v_pilates_id)
  WHERE v_pilates_id = ANY(sport_ids);

  -- 5. social_open_play (references sports)
  DELETE FROM public.social_open_play WHERE sport_id = v_pilates_id;

  -- 6. sports
  DELETE FROM public.sports WHERE id = v_pilates_id;

  RAISE NOTICE 'Pilates sport and related data removed.';
END $$;
