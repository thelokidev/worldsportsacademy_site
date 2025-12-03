-- ============================================================================
-- REPLACE MEMBERSHIP PRICING SYSTEM
-- Run this directly in Supabase SQL Editor
-- Location: Ontario, Canada (13% HST)
-- ============================================================================

-- This script replaces sport-specific memberships with unified pricing:
-- - Drop-in: $15 CAD
-- - Monthly: $75 CAD/month  
-- - Half-Yearly: $400 CAD/6 months
-- - Yearly: $700 CAD/year
-- - Initiation Fee: $25 CAD (one-time per user)

BEGIN;

-- ============================================================================
-- STEP 1: Add initiation fee tracking to profiles
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'initiation_fee_paid'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN initiation_fee_paid BOOLEAN DEFAULT false;
    
    CREATE INDEX idx_profiles_initiation_fee_paid 
    ON public.profiles(initiation_fee_paid);
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Update tax rate to Ontario HST (13%)
-- ============================================================================
UPDATE public.drop_in_pricing
SET tax_rate = 0.1300
WHERE tax_rate != 0.1300;

-- ============================================================================
-- STEP 3: Deactivate old sport-specific membership plans
-- ============================================================================
UPDATE public.membership_plans
SET 
  is_active = false,
  updated_at = NOW()
WHERE name IN (
  'Squash Monthly Membership',
  'Table Tennis Monthly Membership',
  'Squash + Gym Monthly Membership',
  'Squash + Pilates Monthly Membership'
);

-- ============================================================================
-- STEP 4: Create/Update unified membership plans
-- ============================================================================

-- Get all active sports for sport_ids array
DO $$
DECLARE
  v_sport_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(id) INTO v_sport_ids
  FROM public.sports 
  WHERE status = 'active';

  -- Monthly Membership - $75 CAD
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
    'Monthly Membership',
    'Unlimited access to all sports facilities with monthly auto-renewal',
    v_sport_ids,
    75.00,
    'month',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'all_sports_access', true,
      'billing_period', 'Monthly'
    ),
    true,
    1
  )
  ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    sport_ids = EXCLUDED.sport_ids,
    is_active = true,
    updated_at = NOW();

  -- Half-Yearly Membership - $400 CAD
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
    'Half-Yearly Membership',
    'Unlimited access to all sports facilities - 6 month commitment (Save $50)',
    v_sport_ids,
    400.00,
    'month',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'all_sports_access', true,
      'billing_period', 'Every 6 Months',
      'billing_interval_months', 6,
      'savings', '$50 vs Monthly'
    ),
    true,
    2
  )
  ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    sport_ids = EXCLUDED.sport_ids,
    is_active = true,
    updated_at = NOW();

  -- Yearly Membership - $700 CAD
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
    'Yearly Membership',
    'Unlimited access to all sports facilities - Annual commitment (Save $200) - Best Value!',
    v_sport_ids,
    700.00,
    'year',
    jsonb_build_object(
      'unlimited_bookings', true,
      'cancel_anytime', true,
      'all_sports_access', true,
      'billing_period', 'Annually',
      'billing_interval_months', 12,
      'savings', '$200 vs Monthly',
      'best_value', true
    ),
    true,
    3
  )
  ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    sport_ids = EXCLUDED.sport_ids,
    is_active = true,
    updated_at = NOW();
END $$;

-- ============================================================================
-- STEP 5: Create pricing configuration table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Pricing config is viewable by everyone" ON public.pricing_config;

-- Create public read policy
CREATE POLICY "Pricing config is viewable by everyone"
  ON public.pricing_config
  FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- STEP 6: Insert pricing configuration
-- ============================================================================

-- Initiation fee
INSERT INTO public.pricing_config (config_key, config_value, description, is_active)
VALUES (
  'initiation_fee',
  jsonb_build_object(
    'amount', 25.00,
    'currency', 'CAD',
    'tax_rate', 0.13,
    'description', 'One-time registration fee for new members',
    'applies_to', ARRAY['drop_in', 'membership']
  ),
  'One-time initiation/registration fee charged to new users on their first purchase',
  true
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = NOW();

-- Tax configuration
INSERT INTO public.pricing_config (config_key, config_value, description, is_active)
VALUES (
  'tax_config',
  jsonb_build_object(
    'province', 'Ontario',
    'country', 'Canada',
    'tax_type', 'HST',
    'tax_rate', 0.13,
    'tax_display_name', '13% HST'
  ),
  'Tax configuration for Ontario, Canada',
  true
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = NOW();

-- ============================================================================
-- STEP 7: Create helper function for price calculation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_total_with_initiation(
  p_user_id UUID,
  p_base_amount DECIMAL(10, 2)
)
RETURNS TABLE (
  base_amount DECIMAL(10, 2),
  initiation_fee DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  tax_rate DECIMAL(5, 4),
  tax_amount DECIMAL(10, 2),
  total DECIMAL(10, 2),
  includes_initiation BOOLEAN
) AS $$
DECLARE
  v_initiation_fee_paid BOOLEAN;
  v_initiation_amount DECIMAL(10, 2);
  v_tax_rate DECIMAL(5, 4);
BEGIN
  -- Check if user has paid initiation fee
  SELECT COALESCE(initiation_fee_paid, false)
  INTO v_initiation_fee_paid
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Get initiation fee amount
  SELECT (config_value->>'amount')::DECIMAL(10, 2)
  INTO v_initiation_amount
  FROM public.pricing_config
  WHERE config_key = 'initiation_fee' AND is_active = true;
  
  -- Get tax rate
  SELECT (config_value->>'tax_rate')::DECIMAL(5, 4)
  INTO v_tax_rate
  FROM public.pricing_config
  WHERE config_key = 'tax_config' AND is_active = true;
  
  -- Defaults
  v_initiation_amount := COALESCE(v_initiation_amount, 25.00);
  v_tax_rate := COALESCE(v_tax_rate, 0.1300);
  
  -- Calculate
  RETURN QUERY SELECT
    p_base_amount,
    CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END,
    p_base_amount + CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END,
    v_tax_rate,
    ROUND((p_base_amount + CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END) * v_tax_rate, 2),
    ROUND((p_base_amount + CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END) * (1 + v_tax_rate), 2),
    NOT v_initiation_fee_paid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check active membership plans
SELECT name, price, billing_interval, is_active, display_order
FROM public.membership_plans
WHERE is_active = true
ORDER BY display_order;

-- Check pricing config
SELECT config_key, config_value, description
FROM public.pricing_config
WHERE is_active = true;

-- Test price calculation (replace with real user ID)
-- SELECT * FROM public.calculate_total_with_initiation(
--   'your-user-id-here'::uuid,
--   75.00
-- );

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- ✅ New membership plans created:
--    - Monthly: $75 CAD/month
--    - Half-Yearly: $400 CAD/6 months
--    - Yearly: $700 CAD/year
-- ✅ Initiation fee: $25 CAD (one-time)
-- ✅ Tax: 13% HST (Ontario)
-- ✅ Old sport-specific plans deactivated
--
-- Next steps:
-- 1. Create Stripe products: npx tsx scripts/create-stripe-products.ts
-- 2. Update Stripe IDs in membership_plans table
-- 3. Test the new pricing system
-- ============================================================================
