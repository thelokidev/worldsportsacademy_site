-- Seed data for sports and courts
-- Note: Update cal_event_type_id values with actual Cal.com event type IDs after setup

-- Insert Sports
INSERT INTO public.sports (id, name, display_name, description, cal_event_type_id, duration_minutes, max_participants)
VALUES
  (gen_random_uuid(), 'squash', 'Squash', 'Fast-paced racquet sport played in an enclosed court', NULL, 60, 2),
  (gen_random_uuid(), 'table-tennis', 'Table Tennis', 'Fast-paced indoor sport played on a table with small paddles', NULL, 60, 2),
  (gen_random_uuid(), 'chess', 'Chess', 'Strategic board game for intellectual competition', NULL, 60, 2)
ON CONFLICT (name) DO NOTHING;

-- Insert Courts for Squash
INSERT INTO public.courts (id, sport_id, name, cal_user_id, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Squash Court 1',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1;

INSERT INTO public.courts (id, sport_id, name, cal_user_id, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Squash Court 2',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1;

-- Insert Courts for Table Tennis
INSERT INTO public.courts (id, sport_id, name, cal_user_id, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Table Tennis Table 1',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1;

INSERT INTO public.courts (id, sport_id, name, cal_user_id, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Table Tennis Table 2',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1;

-- Insert Courts for Chess
INSERT INTO public.courts (id, sport_id, name, cal_user_id, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Chess Table 1',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'chess'
LIMIT 1;

INSERT INTO public.courts (id, sport_id, name, cal_user_id, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Chess Table 2',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'chess'
LIMIT 1;

