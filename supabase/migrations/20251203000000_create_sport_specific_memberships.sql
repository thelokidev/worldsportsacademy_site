-- Migration: Create sport-specific membership plans
-- Deactivates unified plans and creates separate plans for Table Tennis and Squash

-- 1. Ensure membership_plans table exists (create if it doesn't)
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sport_ids UUID[] NOT NULL DEFAULT '{}',
  price DECIMAL(10, 2) NOT NULL,
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  features JSONB DEFAULT '{}'::jsonb,
  stripe_price_id TEXT UNIQUE,
  stripe_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Deactivate existing unified plans (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'membership_plans') THEN
    UPDATE public.membership_plans
    SET 
      is_active = false,
      updated_at = NOW()
    WHERE 
      name IN ('Monthly Membership', 'Half-Yearly Membership', 'Yearly Membership')
      AND is_active = true;
  END IF;
END $$;

-- 3. Create Table Tennis Plans
DO $$
DECLARE
  v_tt_sport_id UUID;
  v_squash_sport_id UUID;
BEGIN
  -- Check if sports table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sports') THEN
    RAISE EXCEPTION 'Sports table does not exist. Please run the base migrations first.';
  END IF;

  -- Get Sport IDs
  SELECT id INTO v_tt_sport_id FROM public.sports WHERE name = 'table-tennis' LIMIT 1;
  SELECT id INTO v_squash_sport_id FROM public.sports WHERE name = 'squash' LIMIT 1;

  IF v_tt_sport_id IS NULL THEN
    RAISE EXCEPTION 'Table Tennis sport not found. Please ensure sports are seeded.';
  END IF;

  IF v_squash_sport_id IS NULL THEN
    RAISE EXCEPTION 'Squash sport not found. Please ensure sports are seeded.';
  END IF;

  -- =================================================================
  -- Table Tennis Plans
  -- =================================================================

  -- Monthly ($75)
  INSERT INTO public.membership_plans (
    name, 
    description, 
    sport_ids, 
    price, 
    billing_interval, 
    features, 
    is_active, 
    display_order
  )
  VALUES (
    'Table Tennis Monthly',
    'Unlimited access to Table Tennis tables with monthly auto-renewal',
    ARRAY[v_tt_sport_id],
    75.00,
    'month',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'sport_specific_access', true,
      'monthly_renewal', true
    ),
    true,
    1
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true;

  -- Half-Yearly ($400)
  INSERT INTO public.membership_plans (
    name, 
    description, 
    sport_ids, 
    price, 
    billing_interval, 
    features, 
    is_active, 
    display_order
  )
  VALUES (
    'Table Tennis Half-Yearly',
    'Unlimited access to Table Tennis tables for 6 months',
    ARRAY[v_tt_sport_id],
    400.00,
    'month',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'sport_specific_access', true,
      'billing_period_months', 6,
      'savings_vs_monthly', 50.00
    ),
    true,
    2
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true;

  -- Yearly ($700)
  INSERT INTO public.membership_plans (
    name, 
    description, 
    sport_ids, 
    price, 
    billing_interval, 
    features, 
    is_active, 
    display_order
  )
  VALUES (
    'Table Tennis Yearly',
    'Unlimited access to Table Tennis tables for 12 months - Best Value!',
    ARRAY[v_tt_sport_id],
    700.00,
    'year',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'sport_specific_access', true,
      'billing_period_months', 12,
      'savings_vs_monthly', 200.00,
      'best_value', true
    ),
    true,
    3
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true;

  -- =================================================================
  -- Squash Plans
  -- =================================================================

  -- Monthly ($75)
  INSERT INTO public.membership_plans (
    name, 
    description, 
    sport_ids, 
    price, 
    billing_interval, 
    features, 
    is_active, 
    display_order
  )
  VALUES (
    'Squash Monthly',
    'Unlimited access to Squash courts with monthly auto-renewal',
    ARRAY[v_squash_sport_id],
    75.00,
    'month',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'sport_specific_access', true,
      'monthly_renewal', true
    ),
    true,
    4
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true;

  -- Half-Yearly ($400)
  INSERT INTO public.membership_plans (
    name, 
    description, 
    sport_ids, 
    price, 
    billing_interval, 
    features, 
    is_active, 
    display_order
  )
  VALUES (
    'Squash Half-Yearly',
    'Unlimited access to Squash courts for 6 months',
    ARRAY[v_squash_sport_id],
    400.00,
    'month',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'sport_specific_access', true,
      'billing_period_months', 6,
      'savings_vs_monthly', 50.00
    ),
    true,
    5
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true;

  -- Yearly ($700)
  INSERT INTO public.membership_plans (
    name, 
    description, 
    sport_ids, 
    price, 
    billing_interval, 
    features, 
    is_active, 
    display_order
  )
  VALUES (
    'Squash Yearly',
    'Unlimited access to Squash courts for 12 months - Best Value!',
    ARRAY[v_squash_sport_id],
    700.00,
    'year',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'sport_specific_access', true,
      'billing_period_months', 12,
      'savings_vs_monthly', 200.00,
      'best_value', true
    ),
    true,
    6
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sport_ids = EXCLUDED.sport_ids,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = true;

END $$;

