-- Migration: Fix Table Tennis duration to 2 hours and ensure correct court counts
-- This ensures Table Tennis sessions are exactly 2 hours and we have exactly 3 tables

-- 1. Force update Table Tennis to 2 hours (120 minutes)
UPDATE public.sports
SET 
  duration_minutes = 120,
  duration_options = '[120]'::jsonb
WHERE name = 'table-tennis';

-- 2. Ensure Squash is 1 hour (60 minutes)
UPDATE public.sports
SET 
  duration_minutes = 60,
  duration_options = '[60]'::jsonb
WHERE name = 'squash';

-- 3. Ensure exactly 3 Table Tennis tables exist
DO $$
DECLARE
  tt_sport_id UUID;
  tt_count INTEGER;
BEGIN
  -- Get Table Tennis sport ID
  SELECT id INTO tt_sport_id FROM public.sports WHERE name = 'table-tennis' LIMIT 1;
  
  IF tt_sport_id IS NOT NULL THEN
    -- Count existing active Table Tennis tables
    SELECT COUNT(*) INTO tt_count 
    FROM public.courts 
    WHERE sport_id = tt_sport_id AND is_active = true;
    
    -- Delete excess tables if we have more than 3 (keep the oldest ones)
    IF tt_count > 3 THEN
      DELETE FROM public.courts
      WHERE id IN (
        SELECT id FROM public.courts
        WHERE sport_id = tt_sport_id AND is_active = true
        ORDER BY created_at DESC
        OFFSET 3
      );
      tt_count := 3;
    END IF;
    
    -- Add missing tables (need 3 total)
    WHILE tt_count < 3 LOOP
      INSERT INTO public.courts (id, sport_id, name, is_active)
      VALUES (
        gen_random_uuid(), 
        tt_sport_id, 
        'Table Tennis Table ' || (tt_count + 1), 
        true
      );
      tt_count := tt_count + 1;
    END LOOP;
  END IF;
END $$;

-- 4. Ensure exactly 4 Squash courts exist
DO $$
DECLARE
  squash_sport_id UUID;
  squash_count INTEGER;
BEGIN
  -- Get Squash sport ID
  SELECT id INTO squash_sport_id FROM public.sports WHERE name = 'squash' LIMIT 1;
  
  IF squash_sport_id IS NOT NULL THEN
    -- Count existing active Squash courts
    SELECT COUNT(*) INTO squash_count 
    FROM public.courts 
    WHERE sport_id = squash_sport_id AND is_active = true;
    
    -- Delete excess courts if we have more than 4 (keep the oldest ones)
    IF squash_count > 4 THEN
      DELETE FROM public.courts
      WHERE id IN (
        SELECT id FROM public.courts
        WHERE sport_id = squash_sport_id AND is_active = true
        ORDER BY created_at DESC
        OFFSET 4
      );
      squash_count := 4;
    END IF;
    
    -- Add missing courts (need 4 total)
    WHILE squash_count < 4 LOOP
      INSERT INTO public.courts (id, sport_id, name, is_active)
      VALUES (
        gen_random_uuid(), 
        squash_sport_id, 
        'Squash Court ' || (squash_count + 1), 
        true
      );
      squash_count := squash_count + 1;
    END LOOP;
  END IF;
END $$;

-- 5. Verify the settings
DO $$
DECLARE
  tt_duration INTEGER;
  squash_duration INTEGER;
  tt_table_count INTEGER;
  squash_court_count INTEGER;
BEGIN
  -- Check Table Tennis duration
  SELECT duration_minutes INTO tt_duration 
  FROM public.sports 
  WHERE name = 'table-tennis';
  
  IF tt_duration != 120 THEN
    RAISE EXCEPTION 'Table Tennis duration is not 120 minutes. Current value: %', tt_duration;
  END IF;
  
  -- Check Squash duration
  SELECT duration_minutes INTO squash_duration 
  FROM public.sports 
  WHERE name = 'squash';
  
  IF squash_duration != 60 THEN
    RAISE EXCEPTION 'Squash duration is not 60 minutes. Current value: %', squash_duration;
  END IF;
  
  -- Check Table Tennis table count
  SELECT COUNT(*) INTO tt_table_count
  FROM public.courts c
  JOIN public.sports s ON c.sport_id = s.id
  WHERE s.name = 'table-tennis' AND c.is_active = true;
  
  IF tt_table_count != 3 THEN
    RAISE EXCEPTION 'Table Tennis should have exactly 3 tables. Current count: %', tt_table_count;
  END IF;
  
  -- Check Squash court count
  SELECT COUNT(*) INTO squash_court_count
  FROM public.courts c
  JOIN public.sports s ON c.sport_id = s.id
  WHERE s.name = 'squash' AND c.is_active = true;
  
  IF squash_court_count != 4 THEN
    RAISE EXCEPTION 'Squash should have exactly 4 courts. Current count: %', squash_court_count;
  END IF;
  
  RAISE NOTICE 'Verification passed: Table Tennis has % tables (2 hours), Squash has % courts (1 hour)', tt_table_count, squash_court_count;
END $$;

