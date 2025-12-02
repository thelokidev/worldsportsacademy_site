-- Migration: Update court names to simpler format and add 4th Table Tennis court
-- This migration:
-- 1. Renames all courts to simpler names (Table 1, Table 2 for Table Tennis, Court 1, Court 2 for Squash)
-- 2. Adds a 4th Table Tennis court (Table 3 and Table 4)

-- First, let's update existing Table Tennis courts to simpler names
UPDATE public.courts
SET name = 'Table 1'
WHERE name = 'Table Tennis Table 1'
  AND sport_id IN (SELECT id FROM public.sports WHERE name = 'table-tennis');

UPDATE public.courts
SET name = 'Table 2'
WHERE name = 'Table Tennis Table 2'
  AND sport_id IN (SELECT id FROM public.sports WHERE name = 'table-tennis');

-- Update Squash courts to simpler names
UPDATE public.courts
SET name = 'Court 1'
WHERE name = 'Squash Court 1'
  AND sport_id IN (SELECT id FROM public.sports WHERE name = 'squash');

UPDATE public.courts
SET name = 'Court 2'
WHERE name = 'Squash Court 2'
  AND sport_id IN (SELECT id FROM public.sports WHERE name = 'squash');

-- Add 3rd and 4th Table Tennis courts if they don't exist
INSERT INTO public.courts (id, sport_id, name, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Table 3',
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
AND NOT EXISTS (SELECT 1 FROM public.courts c WHERE c.name = 'Table 3' AND c.sport_id = s.id)
LIMIT 1;

INSERT INTO public.courts (id, sport_id, name, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Table 4',
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
AND NOT EXISTS (SELECT 1 FROM public.courts c WHERE c.name = 'Table 4' AND c.sport_id = s.id)
LIMIT 1;

-- Also handle any existing courts that might have different naming patterns
UPDATE public.courts
SET name = CASE 
  WHEN name LIKE '%Table Tennis%' AND name LIKE '%1%' THEN 'Table 1'
  WHEN name LIKE '%Table Tennis%' AND name LIKE '%2%' THEN 'Table 2'
  WHEN name LIKE '%Table Tennis%' AND name LIKE '%3%' THEN 'Table 3'
  WHEN name LIKE '%Table Tennis%' AND name LIKE '%4%' THEN 'Table 4'
  WHEN name LIKE '%Squash%' AND name LIKE '%1%' THEN 'Court 1'
  WHEN name LIKE '%Squash%' AND name LIKE '%2%' THEN 'Court 2'
  ELSE name
END
WHERE sport_id IN (
  SELECT id FROM public.sports WHERE name IN ('table-tennis', 'squash')
)
AND (name LIKE '%Table Tennis%' OR name LIKE '%Squash%');

