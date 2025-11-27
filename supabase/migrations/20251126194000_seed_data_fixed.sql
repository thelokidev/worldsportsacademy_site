-- Seed data for sports and courts (Fixed for current schema)

-- Insert Sports
INSERT INTO public.sports (id, name, display_name, description, duration_minutes, max_participants, status, duration_options, price_per_hour)
VALUES
  (gen_random_uuid(), 'squash', 'Squash', 'Fast-paced racquet sport played in an enclosed court', 60, 2, 'active', '[60]', 25.00),
  (gen_random_uuid(), 'table-tennis', 'Table Tennis', 'Fast-paced indoor sport played on a table with small paddles', 60, 2, 'active', '[60, 120]', 20.00),
  (gen_random_uuid(), 'chess', 'Chess', 'Strategic board game for intellectual competition', 60, 2, 'coming_soon', '[60]', 15.00)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  max_participants = EXCLUDED.max_participants,
  status = EXCLUDED.status,
  duration_options = EXCLUDED.duration_options,
  price_per_hour = EXCLUDED.price_per_hour;

-- Insert Courts for Squash
INSERT INTO public.courts (id, sport_id, name, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Squash Court 1',
  true
FROM public.sports s
WHERE s.name = 'squash'
AND NOT EXISTS (SELECT 1 FROM public.courts c WHERE c.name = 'Squash Court 1' AND c.sport_id = s.id);

INSERT INTO public.courts (id, sport_id, name, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Squash Court 2',
  true
FROM public.sports s
WHERE s.name = 'squash'
AND NOT EXISTS (SELECT 1 FROM public.courts c WHERE c.name = 'Squash Court 2' AND c.sport_id = s.id);

-- Insert Courts for Table Tennis
INSERT INTO public.courts (id, sport_id, name, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Table Tennis Table 1',
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
AND NOT EXISTS (SELECT 1 FROM public.courts c WHERE c.name = 'Table Tennis Table 1' AND c.sport_id = s.id);

INSERT INTO public.courts (id, sport_id, name, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Table Tennis Table 2',
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
AND NOT EXISTS (SELECT 1 FROM public.courts c WHERE c.name = 'Table Tennis Table 2' AND c.sport_id = s.id);

-- Insert Courts for Chess
INSERT INTO public.courts (id, sport_id, name, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Chess Table 1',
  true
FROM public.sports s
WHERE s.name = 'chess'
AND NOT EXISTS (SELECT 1 FROM public.courts c WHERE c.name = 'Chess Table 1' AND c.sport_id = s.id);
