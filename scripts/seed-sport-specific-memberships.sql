-- ============================================================================
-- Seed Sport-Specific Membership Plans
-- Run this script directly in Supabase SQL Editor
-- ============================================================================

-- Step 1: Ensure sports table exists and has required sports
CREATE TABLE IF NOT EXISTS public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'coming_soon', 'inactive')),
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 2,
  price_per_hour DECIMAL(10, 2) DEFAULT 20.00,
  duration_options JSONB DEFAULT '[60]'::jsonb,
  requires_membership_for_booking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 2: Ensure Table Tennis and Squash sports exist
INSERT INTO public.sports (name, display_name, description, status, duration_minutes, duration_options)
VALUES 
  ('table-tennis', 'Table Tennis', 'Professional table tennis facilities', 'active', 120, '[120]'::jsonb),
  ('squash', 'Squash', 'Professional squash courts', 'active', 60, '[60]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  status = 'active',
  updated_at = NOW();

-- Step 3: Ensure membership_plans table exists
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sport_ids UUID[] NOT NULL DEFAULT '{}',
  price DECIMAL(10, 2) NOT NULL,
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  features JSONB DEFAULT '{}'::jsonb,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 3b: Ensure drop_in_pricing table exists
CREATE TABLE IF NOT EXISTS public.drop_in_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
  description TEXT,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(sport_id, duration_minutes)
);

-- Step 3c: Create drop-in pricing entries if they don't exist
INSERT INTO public.drop_in_pricing (sport_id, price, duration_minutes, tax_rate, description, is_active)
SELECT
  s.id,
  15.00,
  60,
  0.0000,
  'Drop-in access to squash court for 1 hour',
  true
FROM public.sports s
WHERE s.name = 'squash'
ON CONFLICT (sport_id, duration_minutes) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = NOW();

INSERT INTO public.drop_in_pricing (sport_id, price, duration_minutes, tax_rate, description, is_active)
SELECT
  s.id,
  15.00,
  120,
  0.0000,
  'Drop-in access to table tennis table for 2 hours',
  true
FROM public.sports s
WHERE s.name = 'table-tennis'
ON CONFLICT (sport_id, duration_minutes) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = NOW();

-- Step 4: Deactivate old unified plans
UPDATE public.membership_plans
SET 
  is_active = false,
  updated_at = NOW()
WHERE 
  name IN ('Monthly Membership', 'Half-Yearly Membership', 'Yearly Membership')
  AND is_active = true;

-- Step 5: Create sport-specific membership plans
DO $$
DECLARE
  v_tt_sport_id UUID;
  v_squash_sport_id UUID;
BEGIN
  -- Get Sport IDs
  SELECT id INTO v_tt_sport_id FROM public.sports WHERE name = 'table-tennis' LIMIT 1;
  SELECT id INTO v_squash_sport_id FROM public.sports WHERE name = 'squash' LIMIT 1;

  IF v_tt_sport_id IS NULL OR v_squash_sport_id IS NULL THEN
    RAISE EXCEPTION 'Sports not found. Table Tennis ID: %, Squash ID: %', v_tt_sport_id, v_squash_sport_id;
  END IF;

  -- =================================================================
  -- Table Tennis Plans
  -- =================================================================

  -- Table Tennis Monthly ($75)
  INSERT INTO public.membership_plans (name, description, sport_ids, price, billing_interval, features, is_active, display_order)
  VALUES (
    'Table Tennis Monthly',
    'Unlimited access to Table Tennis tables with monthly auto-renewal',
    ARRAY[v_tt_sport_id],
    75.00,
    'month',
    '{"unlimited_bookings": true, "cancel_anytime": true, "sport_specific_access": true, "monthly_renewal": true}'::jsonb,
    true,
    1
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

  -- Table Tennis Half-Yearly ($400)
  INSERT INTO public.membership_plans (name, description, sport_ids, price, billing_interval, features, is_active, display_order)
  VALUES (
    'Table Tennis Half-Yearly',
    'Unlimited access to Table Tennis tables for 6 months',
    ARRAY[v_tt_sport_id],
    400.00,
    'month',
    '{"unlimited_bookings": true, "cancel_anytime": true, "sport_specific_access": true, "billing_period_months": 6, "savings_vs_monthly": 50, "billing_period": "Every 6 Months", "savings": "$50 vs Monthly"}'::jsonb,
    true,
    2
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

  -- Table Tennis Yearly ($700)
  INSERT INTO public.membership_plans (name, description, sport_ids, price, billing_interval, features, is_active, display_order)
  VALUES (
    'Table Tennis Yearly',
    'Unlimited access to Table Tennis tables for 12 months - Best Value!',
    ARRAY[v_tt_sport_id],
    700.00,
    'year',
    '{"unlimited_bookings": true, "cancel_anytime": true, "sport_specific_access": true, "billing_period_months": 12, "savings_vs_monthly": 200, "best_value": true, "billing_period": "Annually", "savings": "$200 vs Monthly"}'::jsonb,
    true,
    3
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

  -- =================================================================
  -- Squash Plans
  -- =================================================================

  -- Squash Monthly ($75)
  INSERT INTO public.membership_plans (name, description, sport_ids, price, billing_interval, features, is_active, display_order)
  VALUES (
    'Squash Monthly',
    'Unlimited access to Squash courts with monthly auto-renewal',
    ARRAY[v_squash_sport_id],
    75.00,
    'month',
    '{"unlimited_bookings": true, "cancel_anytime": true, "sport_specific_access": true, "monthly_renewal": true}'::jsonb,
    true,
    4
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

  -- Squash Half-Yearly ($400)
  INSERT INTO public.membership_plans (name, description, sport_ids, price, billing_interval, features, is_active, display_order)
  VALUES (
    'Squash Half-Yearly',
    'Unlimited access to Squash courts for 6 months',
    ARRAY[v_squash_sport_id],
    400.00,
    'month',
    '{"unlimited_bookings": true, "cancel_anytime": true, "sport_specific_access": true, "billing_period_months": 6, "savings_vs_monthly": 50, "billing_period": "Every 6 Months", "savings": "$50 vs Monthly"}'::jsonb,
    true,
    5
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

  -- Squash Yearly ($700)
  INSERT INTO public.membership_plans (name, description, sport_ids, price, billing_interval, features, is_active, display_order)
  VALUES (
    'Squash Yearly',
    'Unlimited access to Squash courts for 12 months - Best Value!',
    ARRAY[v_squash_sport_id],
    700.00,
    'year',
    '{"unlimited_bookings": true, "cancel_anytime": true, "sport_specific_access": true, "billing_period_months": 12, "savings_vs_monthly": 200, "best_value": true, "billing_period": "Annually", "savings": "$200 vs Monthly"}'::jsonb,
    true,
    6
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

  RAISE NOTICE 'Successfully created/updated 6 sport-specific membership plans';
END $$;

-- Step 6: Update Stripe IDs for the plans
UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SrPqNDrcV6C4UxVwurJIy8P',
  stripe_product_id = 'prod_Tp3y66WeMEruGq',
  updated_at = NOW()
WHERE name = 'Table Tennis Monthly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SrPquDrcV6C4UxVVoIsXWTp',
  stripe_product_id = 'prod_Tp3y7yvbUGKhaw',
  updated_at = NOW()
WHERE name = 'Table Tennis Half-Yearly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SrPqwDrcV6C4UxVga7Xmx5f',
  stripe_product_id = 'prod_Tp3yhrzsxxJbkg',
  updated_at = NOW()
WHERE name = 'Table Tennis Yearly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SrPqxDrcV6C4UxVFAt8uTQR',
  stripe_product_id = 'prod_Tp3yEBQHX37B9T',
  updated_at = NOW()
WHERE name = 'Squash Monthly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SrPqzDrcV6C4UxVSjopZuAY',
  stripe_product_id = 'prod_Tp3yWHfXJPspiX',
  updated_at = NOW()
WHERE name = 'Squash Half-Yearly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SrPqzDrcV6C4UxVy3xvhpnt',
  stripe_product_id = 'prod_Tp3ywHkZ6qp0d7',
  updated_at = NOW()
WHERE name = 'Squash Yearly';

-- Step 7: Update Drop-In Pricing with Drop-In Session Product
-- ============================================================================
-- All drop-in bookings use the same Stripe "Drop-In Session" product
-- This is a one-time payment product (not a subscription)

UPDATE public.drop_in_pricing
SET 
  stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE',
  stripe_product_id = 'prod_TR0LWsYW3ACwFQ',
  price = 15.00,
  updated_at = NOW()
WHERE is_active = true;

-- Step 8: Deactivate Old/Unused Plans
-- ============================================================================
-- Deactivate any old unified plans or incorrect membership plans

UPDATE public.membership_plans
SET 
  is_active = false,
  updated_at = NOW()
WHERE 
  name IN (
    'Monthly Membership', 
    'Half-Yearly Membership', 
    'Yearly Membership',
    'Squash Monthly Membership',
    'Table Tennis Monthly Membership',
    'Squash + Gym Monthly Membership'
  )
  AND is_active = true;

-- Step 9: Verify the results
-- ============================================================================

-- Verify Membership Plans (Should show 6 active plans)
SELECT 
  '=== MEMBERSHIP PLANS ===' as section;

SELECT 
  name, 
  price, 
  billing_interval, 
  is_active, 
  display_order,
  stripe_price_id,
  stripe_product_id,
  array_length(sport_ids, 1) as sport_count
FROM public.membership_plans 
WHERE is_active = true
ORDER BY display_order;

-- Verify Drop-In Pricing (Should show pricing for all sports)
SELECT 
  '=== DROP-IN PRICING ===' as section;

SELECT 
  dp.id,
  s.name as sport_name,
  s.display_name,
  dp.price,
  dp.duration_minutes,
  dp.stripe_price_id,
  dp.stripe_product_id,
  dp.is_active
FROM public.drop_in_pricing dp
JOIN public.sports s ON dp.sport_id = s.id
WHERE dp.is_active = true
ORDER BY s.name, dp.duration_minutes;

-- Also show the sports for reference
SELECT 
  '=== ACTIVE SPORTS ===' as section;

SELECT id, name, display_name, status FROM public.sports WHERE status = 'active';

-- Summary Count
SELECT 
  '=== SUMMARY ===' as section;

SELECT 
  'Active Membership Plans' as type,
  COUNT(*) as count,
  '(Expected: 6)' as expected
FROM public.membership_plans
WHERE is_active = true

UNION ALL

SELECT 
  'Active Drop-In Pricing' as type,
  COUNT(*) as count,
  '(Expected: 2+)' as expected
FROM public.drop_in_pricing
WHERE is_active = true;

