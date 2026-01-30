-- ============================================================================
-- PRODUCTION DATABASE UPDATE - Run in Supabase Production SQL Editor
-- ============================================================================
-- This updates your production database with the new Stripe IDs
-- Run this in: https://supabase.com/dashboard → Your Project → SQL Editor
-- ============================================================================

-- Update Membership Plans with NEW Stripe IDs
UPDATE public.membership_plans 
SET stripe_price_id = 'price_1SrPqNDrcV6C4UxVwurJIy8P', stripe_product_id = 'prod_Tp3y66WeMEruGq', updated_at = NOW()
WHERE name = 'Table Tennis Monthly';

UPDATE public.membership_plans 
SET stripe_price_id = 'price_1SrPquDrcV6C4UxVVoIsXWTp', stripe_product_id = 'prod_Tp3y7yvbUGKhaw', updated_at = NOW()
WHERE name = 'Table Tennis Half-Yearly';

UPDATE public.membership_plans 
SET stripe_price_id = 'price_1SrPqwDrcV6C4UxVga7Xmx5f', stripe_product_id = 'prod_Tp3yhrzsxxJbkg', updated_at = NOW()
WHERE name = 'Table Tennis Yearly';

UPDATE public.membership_plans 
SET stripe_price_id = 'price_1SrPqxDrcV6C4UxVFAt8uTQR', stripe_product_id = 'prod_Tp3yEBQHX37B9T', updated_at = NOW()
WHERE name = 'Squash Monthly';

UPDATE public.membership_plans 
SET stripe_price_id = 'price_1SrPqzDrcV6C4UxVSjopZuAY', stripe_product_id = 'prod_Tp3yWHfXJPspiX', updated_at = NOW()
WHERE name = 'Squash Half-Yearly';

UPDATE public.membership_plans 
SET stripe_price_id = 'price_1SrPqzDrcV6C4UxVy3xvhpnt', stripe_product_id = 'prod_Tp3ywHkZ6qp0d7', updated_at = NOW()
WHERE name = 'Squash Yearly';

-- Update Drop-In Pricing
UPDATE public.drop_in_pricing
SET stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE', stripe_product_id = 'prod_TR0LWsYW3ACwFQ', price = 15.00, updated_at = NOW()
WHERE is_active = true;

-- Verify the update
SELECT 'Updated Membership Plans:' as info, COUNT(*) as count FROM public.membership_plans WHERE is_active = true;
SELECT name, stripe_price_id, stripe_product_id FROM public.membership_plans WHERE is_active = true ORDER BY display_order;
