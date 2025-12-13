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
  stripe_price_id = 'price_1SdkApDwbguMPSQsHILVu4JE',
  stripe_product_id = 'prod_Taw22MiUG5m0ks',
  updated_at = NOW()
WHERE name = 'Table Tennis Monthly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SdkAqDwbguMPSQsAzKUb3gL',
  stripe_product_id = 'prod_Taw2ut97ns5aCZ',
  updated_at = NOW()
WHERE name = 'Table Tennis Half-Yearly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SdkAqDwbguMPSQsvb9JEF96',
  stripe_product_id = 'prod_Taw2VIvwyOa6RM',
  updated_at = NOW()
WHERE name = 'Table Tennis Yearly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SdkArDwbguMPSQsARsE47Ov',
  stripe_product_id = 'prod_Taw2LUtLgwHieJ',
  updated_at = NOW()
WHERE name = 'Squash Monthly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SdkArDwbguMPSQscUfrqyKy',
  stripe_product_id = 'prod_Taw2kz7Y7fbYqZ',
  updated_at = NOW()
WHERE name = 'Squash Half-Yearly';

UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_1SdkAsDwbguMPSQsK2xsYLLD',
  stripe_product_id = 'prod_Taw2YhPK3XaRQy',
  updated_at = NOW()
WHERE name = 'Squash Yearly';

-- Step 7: Verify the results
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

-- Also show the sports for reference
SELECT id, name, display_name, status FROM public.sports WHERE status = 'active';

