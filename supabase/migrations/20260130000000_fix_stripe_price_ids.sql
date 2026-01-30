-- Fix Stripe Price IDs - January 30, 2026
-- Purpose: Update membership_plans table with correct Stripe price IDs
-- Updated to match production Stripe account (sk_test_51SGcg9DrcV6C4UxV...)

-- ------------------------------------------------------------------------------
-- Update Table Tennis Plans with correct Stripe price IDs
-- ------------------------------------------------------------------------------
UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqNDrcV6C4UxVwurJIy8P',
  stripe_product_id = 'prod_Tp3y66WeMEruGq',
  updated_at = NOW()
WHERE name = 'Table Tennis Monthly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPquDrcV6C4UxVVoIsXWTp',
  stripe_product_id = 'prod_Tp3y7yvbUGKhaw',
  updated_at = NOW()
WHERE name = 'Table Tennis Half-Yearly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqwDrcV6C4UxVga7Xmx5f',
  stripe_product_id = 'prod_Tp3yhrzsxxJbkg',
  updated_at = NOW()
WHERE name = 'Table Tennis Yearly' AND is_active = true;

-- ------------------------------------------------------------------------------
-- Update Squash Plans with correct Stripe price IDs  
-- ------------------------------------------------------------------------------
UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqxDrcV6C4UxVFAt8uTQR',
  stripe_product_id = 'prod_Tp3yEBQHX37B9T',
  updated_at = NOW()
WHERE name = 'Squash Monthly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqzDrcV6C4UxVSjopZuAY',
  stripe_product_id = 'prod_Tp3yWHfXJPspiX',
  updated_at = NOW()
WHERE name = 'Squash Half-Yearly' AND is_active = true;

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqzDrcV6C4UxVy3xvhpnt',
  stripe_product_id = 'prod_Tp3ywHkZ6qp0d7',
  updated_at = NOW()
WHERE name = 'Squash Yearly' AND is_active = true;

-- ------------------------------------------------------------------------------
-- Update Drop-in Session pricing with correct Stripe price ID
-- ------------------------------------------------------------------------------
UPDATE public.drop_in_pricing
SET
  stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE',
  stripe_product_id = 'prod_TR0LWsYW3ACwFQ',
  updated_at = NOW()
WHERE is_active = true;