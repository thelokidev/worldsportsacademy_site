-- ============================================================================
-- Sync Supabase with Stripe Product Catalog (January 2026)
-- Run this script in Supabase SQL Editor to update all Stripe IDs
-- ============================================================================

-- PART 1: Update Membership Plans with NEW Stripe IDs
-- ============================================================================
-- These are the 6 sport-specific membership plans created in Stripe

-- Table Tennis Plans
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

-- Squash Plans
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

-- PART 2: Update Drop-In Pricing with Drop-In Session Product
-- ============================================================================
-- All drop-in bookings use the same Stripe "Drop-In Session" product

UPDATE public.drop_in_pricing
SET 
  stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE',
  stripe_product_id = 'prod_TR0LWsYW3ACwFQ',
  price = 15.00,
  updated_at = NOW()
WHERE is_active = true;

-- PART 3: Deactivate Old/Unused Plans
-- ============================================================================
-- Deactivate any old unified plans or incorrect plans

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

-- PART 4: Verification Queries
-- ============================================================================

-- Verify Membership Plans
SELECT 
  name, 
  price, 
  billing_interval, 
  is_active, 
  display_order,
  stripe_price_id,
  stripe_product_id
FROM public.membership_plans 
WHERE is_active = true
ORDER BY display_order;

-- Verify Drop-In Pricing
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

-- Count Active Plans
SELECT 
  'Active Membership Plans' as type,
  COUNT(*) as count
FROM public.membership_plans
WHERE is_active = true

UNION ALL

SELECT 
  'Active Drop-In Pricing' as type,
  COUNT(*) as count
FROM public.drop_in_pricing
WHERE is_active = true;
