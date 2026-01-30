-- Fix Stripe Price IDs - January 30, 2026
-- Purpose: Update membership_plans table with correct Stripe price IDs
-- The existing IDs in the database don't match what's actually in Stripe

-- ------------------------------------------------------------------------------
-- Update Table Tennis Plans with correct Stripe price IDs
-- ------------------------------------------------------------------------------
UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPp0DwbguMPSQs4ux7Q4Sw',
  stripe_product_id = 'prod_Tp3wTFdLAGs4WD',
  updated_at = NOW()
WHERE name = 'Table Tennis Monthly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPp1DwbguMPSQsIYDiXQcX',
  stripe_product_id = 'prod_Tp3wu9D5lPbapA',
  updated_at = NOW()
WHERE name = 'Table Tennis Half-Yearly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPp1DwbguMPSQsGxCSTUBF',
  stripe_product_id = 'prod_Tp3wTNlWzgZQ1a',
  updated_at = NOW()
WHERE name = 'Table Tennis Yearly' AND is_active = true;

-- ------------------------------------------------------------------------------
-- Update Squash Plans with correct Stripe price IDs  
-- ------------------------------------------------------------------------------
UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPp2DwbguMPSQsfmgBrJqP',
  stripe_product_id = 'prod_Tp3wyR02WyBbCa',
  updated_at = NOW()
WHERE name = 'Squash Monthly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPp3DwbguMPSQs7zVoskc6',
  stripe_product_id = 'prod_Tp3wqSLuAhap3W',
  updated_at = NOW()
WHERE name = 'Squash Half-Yearly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPp3DwbguMPSQs2X8NMw2F',
  stripe_product_id = 'prod_Tp3whjjsxU5hWE',
  updated_at = NOW()
WHERE name = 'Squash Yearly' AND is_active = true;

-- ------------------------------------------------------------------------------
-- Update Drop-in Session pricing with correct Stripe price ID
-- ------------------------------------------------------------------------------
UPDATE public.drop_in_pricing
SET
  stripe_price_id = 'price_1SvJvaDwbguMPSQshdIDI7S5',
  stripe_product_id = 'prod_Tt670rQMvzR1Tr',
  updated_at = NOW()
WHERE is_active = true;