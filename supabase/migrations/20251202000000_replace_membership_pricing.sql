-- Migration: Replace sport-specific memberships with unified pricing system
-- Location: Ontario, Canada (13% HST)
-- Pricing: Drop-in $15, Monthly $75, Half-Yearly $400, Yearly $700
-- Initiation Fee: $25 (one-time per user)

-- ============================================================================
-- STEP 1: Add initiation_fee_paid field to profiles
-- ============================================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS initiation_fee_paid BOOLEAN DEFAULT false;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_initiation_fee_paid 
ON public.profiles(initiation_fee_paid);

-- ============================================================================
-- STEP 2: Update drop_in_pricing to use new unified pricing
-- ============================================================================

-- Update tax rate to 13% Ontario HST for all existing drop-in pricing
UPDATE public.drop_in_pricing
SET tax_rate = 0.1300
WHERE tax_rate != 0.1300;

-- Update currency to CAD in payments table (if not already set)
ALTER TABLE public.payments 
ALTER COLUMN currency SET DEFAULT 'cad';

-- Update existing USD payments to CAD (if this is a new system, this is safe)
-- Comment out if you have real USD transactions you want to preserve
-- UPDATE public.payments SET currency = 'cad' WHERE currency = 'usd';

-- ============================================================================
-- STEP 3: Deactivate old sport-specific membership plans
-- ============================================================================

-- Mark all existing membership plans as inactive
UPDATE public.membership_plans
SET 
  is_active = false,
  updated_at = NOW()
WHERE is_active = true;

-- ============================================================================
-- STEP 4: Create new unified membership plans
-- ============================================================================

-- Delete the old plans first to avoid conflicts, but only if no active memberships exist
-- If there are active memberships, we'll keep the old plans for reference
DO $$
DECLARE
  v_has_active_memberships BOOLEAN;
BEGIN
  -- Check if there are any active memberships
  SELECT EXISTS (
    SELECT 1 FROM public.memberships WHERE status = 'active'
  ) INTO v_has_active_memberships;
  
  IF NOT v_has_active_memberships THEN
    -- Safe to delete old plans
    DELETE FROM public.membership_plans WHERE is_active = false;
  ELSE
    -- Keep old plans for reference, just ensure they're inactive
    RAISE NOTICE 'Active memberships exist. Keeping old plans as inactive for reference.';
  END IF;
END $$;

-- Insert new unified membership plans (not sport-specific)
-- Note: stripe_price_id and stripe_product_id will be updated after creating Stripe products

-- 1. Monthly Membership - $75 CAD/month
INSERT INTO public.membership_plans (
  id, 
  name, 
  description, 
  sport_ids, 
  price, 
  billing_interval, 
  features, 
  is_active, 
  display_order,
  stripe_price_id,
  stripe_product_id
)
SELECT
  gen_random_uuid(),
  'Monthly Membership',
  'Unlimited access to all sports facilities with monthly auto-renewal',
  ARRAY(SELECT id FROM public.sports WHERE status = 'active'),
  75.00,
  'month',
  jsonb_build_object(
    'unlimited_bookings', true,
    'cancel_anytime', true,
    'all_sports_access', true,
    'monthly_renewal', true
  ),
  true,
  1,
  NULL, -- Will be updated with Stripe Price ID
  NULL  -- Will be updated with Stripe Product ID
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans WHERE name = 'Monthly Membership'
)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_active = true;

-- 2. Half-Yearly Membership - $400 CAD for 6 months
INSERT INTO public.membership_plans (
  id, 
  name, 
  description, 
  sport_ids, 
  price, 
  billing_interval, 
  features, 
  is_active, 
  display_order,
  stripe_price_id,
  stripe_product_id
)
SELECT
  gen_random_uuid(),
  'Half-Yearly Membership',
  'Unlimited access to all sports facilities for 6 months with auto-renewal',
  ARRAY(SELECT id FROM public.sports WHERE status = 'active'),
  400.00,
  'month', -- Stripe billing interval (will be set to every 6 months in Stripe)
  jsonb_build_object(
    'unlimited_bookings', true,
    'cancel_anytime', true,
    'all_sports_access', true,
    'billing_period_months', 6,
    'savings_vs_monthly', 50.00
  ),
  true,
  2,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans WHERE name = 'Half-Yearly Membership'
)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_active = true;

-- 3. Yearly Membership - $700 CAD for 12 months
INSERT INTO public.membership_plans (
  id, 
  name, 
  description, 
  sport_ids, 
  price, 
  billing_interval, 
  features, 
  is_active, 
  display_order,
  stripe_price_id,
  stripe_product_id
)
SELECT
  gen_random_uuid(),
  'Yearly Membership',
  'Unlimited access to all sports facilities for 12 months with auto-renewal - Best Value!',
  ARRAY(SELECT id FROM public.sports WHERE status = 'active'),
  700.00,
  'year',
  jsonb_build_object(
    'unlimited_bookings', true,
    'cancel_anytime', true,
    'all_sports_access', true,
    'billing_period_months', 12,
    'savings_vs_monthly', 200.00,
    'best_value', true
  ),
  true,
  3,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans WHERE name = 'Yearly Membership'
)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_active = true;

-- ============================================================================
-- STEP 5: Create initiation fee configuration in a new table
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

-- Public read policy
CREATE POLICY "Pricing config is viewable by everyone"
  ON public.pricing_config
  FOR SELECT
  USING (is_active = true);

-- Insert initiation fee configuration
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
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert tax configuration
INSERT INTO public.pricing_config (config_key, config_value, description, is_active)
VALUES (
  'tax_config',
  jsonb_build_object(
    'province', 'Ontario',
    'country', 'Canada',
    'tax_type', 'HST',
    'tax_rate', 0.13,
    'tax_display_name', 'HST'
  ),
  'Tax configuration for Ontario, Canada (13% HST)',
  true
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Create trigger for updated_at
CREATE TRIGGER update_pricing_config_updated_at
  BEFORE UPDATE ON public.pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Create helper function to calculate total with initiation fee
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
  
  -- Get initiation fee amount from config
  SELECT (config_value->>'amount')::DECIMAL(10, 2)
  INTO v_initiation_amount
  FROM public.pricing_config
  WHERE config_key = 'initiation_fee' AND is_active = true;
  
  -- Get tax rate from config
  SELECT (config_value->>'tax_rate')::DECIMAL(5, 4)
  INTO v_tax_rate
  FROM public.pricing_config
  WHERE config_key = 'tax_config' AND is_active = true;
  
  -- Set defaults if not found
  v_initiation_amount := COALESCE(v_initiation_amount, 25.00);
  v_tax_rate := COALESCE(v_tax_rate, 0.1300);
  
  -- Calculate totals
  RETURN QUERY SELECT
    p_base_amount as base_amount,
    CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END as initiation_fee,
    p_base_amount + CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END as subtotal,
    v_tax_rate as tax_rate,
    ROUND((p_base_amount + CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END) * v_tax_rate, 2) as tax_amount,
    ROUND((p_base_amount + CASE WHEN v_initiation_fee_paid THEN 0.00 ELSE v_initiation_amount END) * (1 + v_tax_rate), 2) as total,
    NOT v_initiation_fee_paid as includes_initiation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 7: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN public.profiles.initiation_fee_paid IS 'Tracks whether user has paid the one-time $25 CAD initiation fee';
COMMENT ON TABLE public.pricing_config IS 'Stores pricing configuration including initiation fee and tax rates (Ontario 13% HST)';
COMMENT ON FUNCTION public.calculate_total_with_initiation IS 'Calculates total price including initiation fee (if not paid) and 13% Ontario HST';

-- ============================================================================
-- Summary of changes:
-- ============================================================================
-- 1. Added initiation_fee_paid to profiles table
-- 2. Updated drop_in_pricing tax_rate to 13% (Ontario HST)
-- 3. Deactivated old sport-specific membership plans
-- 4. Created new unified membership plans:
--    - Monthly: $75 CAD/month
--    - Half-Yearly: $400 CAD/6 months
--    - Yearly: $700 CAD/year
-- 5. Created pricing_config table with initiation fee ($25 CAD) and tax config
-- 6. Created helper function to calculate totals with initiation fee and HST
--
-- Next steps:
-- 1. Create Stripe products for new membership plans
-- 2. Update stripe_price_id and stripe_product_id in membership_plans table
-- 3. Update application code to use new pricing structure
-- ============================================================================
