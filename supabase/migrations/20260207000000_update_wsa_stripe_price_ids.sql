-- Update Stripe Price IDs - February 7, 2026
-- Purpose: Update membership_plans and drop_in_pricing tables with WSA owner's Stripe test account IDs
-- Stripe Account: WSA Owner Test Mode (sk_test_51Sa3NkC2I88MOqJ1...)

-- ==============================================================================
-- STRIPE PRODUCT CATALOG (WSA Owner Test Account)
-- ==============================================================================
-- | # | Name                     | Pricing                | Product ID          | Price ID                       |
-- | 1 | Table Tennis Monthly     | $75.00 CAD / month     | prod_TwCpmVVJzXD3Gz | price_1SyKPrC2I88MOqJ1Q7MNnABu |
-- | 2 | Table Tennis Half-Yearly | $400.00 CAD / 6 months | prod_TwCot9InDEEDy7 | price_1SyKP2C2I88MOqJ1C9AXkjoy |
-- | 3 | Table Tennis Yearly      | $700.00 CAD / year     | prod_TwCnxtH9zOALfl | price_1SyKNfC2I88MOqJ13K8sdhE0 |
-- | 4 | Squash Monthly           | $75.00 CAD / month     | prod_TwCm88pKhMRPli | price_1SyKMqC2I88MOqJ1JQ224AW0 |
-- | 5 | Squash Half-Yearly       | $400.00 CAD / 6 months | prod_TwCl9Jus108N4D | price_1SyKMKC2I88MOqJ1GV1nIfW7 |
-- | 6 | Squash Yearly            | $700.00 CAD / year     | prod_TwCl72Qd1TRfQK | price_1SyKLlC2I88MOqJ1fiwJaWZu |
-- | 7 | Initiation Fee           | $25.00 CAD (one-time)  | prod_TX8N4hRNC5iARd | price_1Sa46oC2I88MOqJ1hWTT8OxV |
-- | 8 | Drop-In Session          | $15.00 CAD (one-time)  | prod_TX8NXeBVG5Op9s | price_1Sa46oC2I88MOqJ1EoippchK |
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Update Table Tennis Plans with WSA owner's Stripe price IDs
-- ------------------------------------------------------------------------------
UPDATE public.membership_plans
SET
    stripe_price_id = 'price_1SyKPrC2I88MOqJ1Q7MNnABu',
    stripe_product_id = 'prod_TwCpmVVJzXD3Gz',
    updated_at = NOW()
WHERE
    name = 'Table Tennis Monthly'
    AND is_active = true;

UPDATE public.membership_plans
SET
    stripe_price_id = 'price_1SyKP2C2I88MOqJ1C9AXkjoy',
    stripe_product_id = 'prod_TwCot9InDEEDy7',
    updated_at = NOW()
WHERE
    name = 'Table Tennis Half-Yearly'
    AND is_active = true;

UPDATE public.membership_plans
SET
    stripe_price_id = 'price_1SyKNfC2I88MOqJ13K8sdhE0',
    stripe_product_id = 'prod_TwCnxtH9zOALfl',
    updated_at = NOW()
WHERE
    name = 'Table Tennis Yearly'
    AND is_active = true;

-- ------------------------------------------------------------------------------
-- Update Squash Plans with WSA owner's Stripe price IDs
-- ------------------------------------------------------------------------------
UPDATE public.membership_plans
SET
    stripe_price_id = 'price_1SyKMqC2I88MOqJ1JQ224AW0',
    stripe_product_id = 'prod_TwCm88pKhMRPli',
    updated_at = NOW()
WHERE
    name = 'Squash Monthly'
    AND is_active = true;

UPDATE public.membership_plans
SET
    stripe_price_id = 'price_1SyKMKC2I88MOqJ1GV1nIfW7',
    stripe_product_id = 'prod_TwCl9Jus108N4D',
    updated_at = NOW()
WHERE
    name = 'Squash Half-Yearly'
    AND is_active = true;

UPDATE public.membership_plans
SET
    stripe_price_id = 'price_1SyKLlC2I88MOqJ1fiwJaWZu',
    stripe_product_id = 'prod_TwCl72Qd1TRfQK',
    updated_at = NOW()
WHERE
    name = 'Squash Yearly'
    AND is_active = true;

-- ------------------------------------------------------------------------------
-- Update Initiation Fee (if exists in membership_plans or separate table)
-- ------------------------------------------------------------------------------
UPDATE public.membership_plans
SET
    stripe_price_id = 'price_1Sa46oC2I88MOqJ1hWTT8OxV',
    stripe_product_id = 'prod_TX8N4hRNC5iARd',
    updated_at = NOW()
WHERE
    name ILIKE '%initiation%'
    AND is_active = true;

-- ------------------------------------------------------------------------------
-- Update Drop-in Session pricing with WSA owner's Stripe price ID
-- ------------------------------------------------------------------------------
UPDATE public.drop_in_pricing
SET
    stripe_price_id = 'price_1Sa46oC2I88MOqJ1EoippchK',
    stripe_product_id = 'prod_TX8NXeBVG5Op9s',
    updated_at = NOW()
WHERE
    is_active = true;

-- ------------------------------------------------------------------------------
-- Verification query - Run this to confirm the updates
-- ------------------------------------------------------------------------------
-- SELECT name, stripe_price_id, stripe_product_id, updated_at
-- FROM public.membership_plans
-- WHERE is_active = true
-- ORDER BY name;

-- SELECT sport_id, stripe_price_id, stripe_product_id, updated_at
-- FROM public.drop_in_pricing
-- WHERE is_active = true;