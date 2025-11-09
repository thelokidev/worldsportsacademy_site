-- Migration: Seed membership plans, pricing, and sport settings
-- Seeds all initial data for the membership system

-- 1. Seed membership plans
-- Note: stripe_price_id and stripe_product_id will be updated after creating Stripe products
INSERT INTO public.membership_plans (id, name, description, sport_ids, price, billing_interval, features, is_active, display_order)
SELECT
  gen_random_uuid(),
  'Squash Monthly Membership',
  'Unlimited access to squash courts with monthly auto-renewal',
  ARRAY[s.id],
  70.00,
  'month',
  '{"unlimited_bookings": true, "priority_booking": false, "gym_access": false}'::jsonb,
  true,
  1
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  sport_ids = EXCLUDED.sport_ids,
  features = EXCLUDED.features;

INSERT INTO public.membership_plans (id, name, description, sport_ids, price, billing_interval, features, is_active, display_order)
SELECT
  gen_random_uuid(),
  'Table Tennis Monthly Membership',
  'Unlimited access to table tennis tables with monthly auto-renewal',
  ARRAY[s.id],
  100.00,
  'month',
  '{"unlimited_bookings": true, "priority_booking": false, "gym_access": false}'::jsonb,
  true,
  2
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  sport_ids = EXCLUDED.sport_ids,
  features = EXCLUDED.features;

INSERT INTO public.membership_plans (id, name, description, sport_ids, price, billing_interval, features, is_active, display_order)
SELECT
  gen_random_uuid(),
  'Squash + Gym Monthly Membership',
  'Unlimited access to squash courts and gym facilities with monthly auto-renewal',
  ARRAY[s.id],
  85.00,
  'month',
  '{"unlimited_bookings": true, "priority_booking": false, "gym_access": true}'::jsonb,
  true,
  3
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  sport_ids = EXCLUDED.sport_ids,
  features = EXCLUDED.features;

-- 2. Seed drop-in pricing
-- Squash: $15 + tax for 1 hour
INSERT INTO public.drop_in_pricing (id, sport_id, price, duration_minutes, tax_rate, description, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  15.00,
  60,
  0.0000,  -- Tax rate will be configured per jurisdiction (e.g., 0.08 for 8%)
  'Drop-in access to squash court for 1 hour',
  true
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1
ON CONFLICT (sport_id, duration_minutes) DO UPDATE SET
  price = EXCLUDED.price,
  tax_rate = EXCLUDED.tax_rate,
  description = EXCLUDED.description;

-- Table Tennis: $15 + tax for 2 hours
INSERT INTO public.drop_in_pricing (id, sport_id, price, duration_minutes, tax_rate, description, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  15.00,
  120,
  0.0000,  -- Tax rate will be configured per jurisdiction
  'Drop-in access to table tennis table for 2 hours',
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1
ON CONFLICT (sport_id, duration_minutes) DO UPDATE SET
  price = EXCLUDED.price,
  tax_rate = EXCLUDED.tax_rate,
  description = EXCLUDED.description;

-- 3. Seed training programs
-- Squash Training Programs
INSERT INTO public.training_programs (id, sport_id, name, description, type, coordinator_name, coordinator_email, coordinator_phone, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Group Training',
  'Group training sessions for squash players of all levels',
  'group',
  'Abhinay Vaddi',
  'abhinay@worldsportsacademy.com',  -- Update with actual email
  NULL,  -- Update with actual phone
  true
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.training_programs (id, sport_id, name, description, type, coordinator_name, coordinator_email, coordinator_phone, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Semi-Private Training',
  'Semi-private training sessions with personalized coaching',
  'semi_private',
  'Abhinay Vaddi',
  'abhinay@worldsportsacademy.com',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.training_programs (id, sport_id, name, description, type, coordinator_name, coordinator_email, coordinator_phone, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Private Training',
  'One-on-one private training sessions with personalized coaching',
  'private',
  'Abhinay Vaddi',
  'abhinay@worldsportsacademy.com',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Table Tennis Training Programs
INSERT INTO public.training_programs (id, sport_id, name, description, type, coordinator_name, coordinator_email, coordinator_phone, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Group Training',
  'Group training sessions for table tennis players of all levels',
  'group',
  'Abhinay Vaddi',
  'abhinay@worldsportsacademy.com',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.training_programs (id, sport_id, name, description, type, coordinator_name, coordinator_email, coordinator_phone, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Semi-Private Training',
  'Semi-private training sessions with personalized coaching',
  'semi_private',
  'Abhinay Vaddi',
  'abhinay@worldsportsacademy.com',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.training_programs (id, sport_id, name, description, type, coordinator_name, coordinator_email, coordinator_phone, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Private Training',
  'One-on-one private training sessions with personalized coaching',
  'private',
  'Abhinay Vaddi',
  'abhinay@worldsportsacademy.com',
  NULL,
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Seed sport_settings
-- Table Tennis: 6 AM - 11 PM daily, 3 tables
INSERT INTO public.sport_settings (id, sport_id, status, weekday_hours, weekend_hours, max_advance_booking_days, cancellation_policy_hours, requires_membership_for_booking)
SELECT
  gen_random_uuid(),
  s.id,
  'active',
  '{"open": "06:00", "close": "23:00"}'::jsonb,
  '{"open": "06:00", "close": "23:00"}'::jsonb,
  30,
  24,
  false  -- Drop-ins allowed
FROM public.sports s
WHERE s.name = 'table-tennis'
LIMIT 1
ON CONFLICT (sport_id) DO UPDATE SET
  status = EXCLUDED.status,
  weekday_hours = EXCLUDED.weekday_hours,
  weekend_hours = EXCLUDED.weekend_hours,
  requires_membership_for_booking = EXCLUDED.requires_membership_for_booking;

-- Squash: Need to clarify weekday/weekend hours - using same as TT for now
-- Update with actual hours when provided
INSERT INTO public.sport_settings (id, sport_id, status, weekday_hours, weekend_hours, max_advance_booking_days, cancellation_policy_hours, requires_membership_for_booking)
SELECT
  gen_random_uuid(),
  s.id,
  'active',
  '{"open": "06:00", "close": "23:00"}'::jsonb,  -- Update with actual weekday hours
  '{"open": "06:00", "close": "23:00"}'::jsonb,  -- Update with actual weekend hours
  30,
  24,
  false  -- Drop-ins allowed
FROM public.sports s
WHERE s.name = 'squash'
LIMIT 1
ON CONFLICT (sport_id) DO UPDATE SET
  status = EXCLUDED.status,
  weekday_hours = EXCLUDED.weekday_hours,
  weekend_hours = EXCLUDED.weekend_hours,
  requires_membership_for_booking = EXCLUDED.requires_membership_for_booking;

-- Chess: Coming soon
INSERT INTO public.sport_settings (id, sport_id, status, weekday_hours, weekend_hours, max_advance_booking_days, cancellation_policy_hours, requires_membership_for_booking)
SELECT
  gen_random_uuid(),
  s.id,
  'coming_soon',
  '{"open": "09:00", "close": "21:00"}'::jsonb,
  '{"open": "09:00", "close": "21:00"}'::jsonb,
  30,
  24,
  false
FROM public.sports s
WHERE s.name = 'chess'
LIMIT 1
ON CONFLICT (sport_id) DO UPDATE SET
  status = EXCLUDED.status;

-- Pilates: Coming soon
INSERT INTO public.sport_settings (id, sport_id, status, weekday_hours, weekend_hours, max_advance_booking_days, cancellation_policy_hours, requires_membership_for_booking)
SELECT
  gen_random_uuid(),
  s.id,
  'coming_soon',
  '{"open": "09:00", "close": "21:00"}'::jsonb,
  '{"open": "09:00", "close": "21:00"}'::jsonb,
  30,
  24,
  false
FROM public.sports s
WHERE s.name = 'pilates'
LIMIT 1
ON CONFLICT (sport_id) DO UPDATE SET
  status = EXCLUDED.status;

-- 5. Update court_schedules for Table Tennis (6 AM - 11 PM daily)
UPDATE public.court_schedules cs
SET
  open_time = '06:00:00'::time,
  close_time = '23:00:00'::time,
  is_closed = false
FROM public.courts c
INNER JOIN public.sports s ON c.sport_id = s.id
WHERE cs.court_id = c.id
  AND s.name = 'table-tennis';

-- Insert court schedules if they don't exist for Table Tennis
INSERT INTO public.court_schedules (court_id, day_of_week, open_time, close_time, is_closed)
SELECT
  c.id,
  day_num,
  '06:00:00'::time,
  '23:00:00'::time,
  false
FROM public.courts c
INNER JOIN public.sports s ON c.sport_id = s.id
CROSS JOIN generate_series(0, 6) AS day_num
WHERE s.name = 'table-tennis'
  AND NOT EXISTS (
    SELECT 1 FROM public.court_schedules cs2
    WHERE cs2.court_id = c.id AND cs2.day_of_week = day_num
  );

-- Update court_schedules for Squash (using same hours for now, update when provided)
UPDATE public.court_schedules cs
SET
  open_time = '06:00:00'::time,  -- Update with actual weekday hours
  close_time = '23:00:00'::time,  -- Update with actual weekday hours
  is_closed = false
FROM public.courts c
INNER JOIN public.sports s ON c.sport_id = s.id
WHERE cs.court_id = c.id
  AND s.name = 'squash'
  AND cs.day_of_week BETWEEN 1 AND 5;  -- Weekdays (Monday-Friday)

-- Update weekend hours for Squash (update when provided)
UPDATE public.court_schedules cs
SET
  open_time = '06:00:00'::time,  -- Update with actual weekend hours
  close_time = '23:00:00'::time,  -- Update with actual weekend hours
  is_closed = false
FROM public.courts c
INNER JOIN public.sports s ON c.sport_id = s.id
WHERE cs.court_id = c.id
  AND s.name = 'squash'
  AND cs.day_of_week IN (0, 6);  -- Weekends (Sunday, Saturday)

-- Insert court schedules if they don't exist for Squash
INSERT INTO public.court_schedules (court_id, day_of_week, open_time, close_time, is_closed)
SELECT
  c.id,
  day_num,
  CASE
    WHEN day_num BETWEEN 1 AND 5 THEN '06:00:00'::time  -- Weekday hours
    ELSE '06:00:00'::time  -- Weekend hours (update when provided)
  END,
  CASE
    WHEN day_num BETWEEN 1 AND 5 THEN '23:00:00'::time  -- Weekday hours
    ELSE '23:00:00'::time  -- Weekend hours (update when provided)
  END,
  false
FROM public.courts c
INNER JOIN public.sports s ON c.sport_id = s.id
CROSS JOIN generate_series(0, 6) AS day_num
WHERE s.name = 'squash'
  AND NOT EXISTS (
    SELECT 1 FROM public.court_schedules cs2
    WHERE cs2.court_id = c.id AND cs2.day_of_week = day_num
  );

