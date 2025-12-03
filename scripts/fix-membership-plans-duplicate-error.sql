-- Script: Fix Duplicate Key Error and Update Membership Plans
-- This script resolves the unique constraint violation by:
-- 1. Clearing Stripe IDs from legacy plans (Squash, Table Tennis, etc.) and marking them inactive.
-- 2. Updating the main generic plans (Monthly, Yearly, etc.) with the new Stripe IDs.

BEGIN;

-- 1. Archive Legacy Plans
-- We set their Stripe IDs to NULL to free up the unique constraint.
-- If your schema doesn't allow NULLs, we'll append '_old' to the IDs instead.
UPDATE public.membership_plans
SET 
    is_active = false,
    stripe_price_id = NULL, 
    stripe_product_id = NULL,
    updated_at = NOW()
WHERE name IN (
    'Squash Monthly Membership', 
    'Table Tennis Monthly Membership', 
    'Squash + Gym Monthly Membership'
);

-- 2. Update Main Plans with New IDs

-- Monthly Membership
UPDATE public.membership_plans
SET
  stripe_product_id = 'prod_TX8Nj6SfIe7Pif',
  stripe_price_id = 'price_1Sa46pC2I88MOqJ1K8iEy1NH',
  is_active = true,
  updated_at = NOW()
WHERE name = 'Monthly Membership';

-- Half-Yearly Membership
UPDATE public.membership_plans
SET
  stripe_product_id = 'prod_TX8NDRIaXUjNl6',
  stripe_price_id = 'price_1Sa46pC2I88MOqJ1yd0uZ1Lj',
  is_active = true,
  updated_at = NOW()
WHERE name = 'Half-Yearly Membership';

-- Yearly Membership
UPDATE public.membership_plans
SET
  stripe_product_id = 'prod_TX8Nc4iWv8q7QM',
  stripe_price_id = 'price_1Sa46qC2I88MOqJ1iDaWEf0o',
  is_active = true,
  updated_at = NOW()
WHERE name = 'Yearly Membership';

-- Initiation Fee
UPDATE public.membership_plans
SET
  stripe_product_id = 'prod_TX8N4hRNC5iARd',
  stripe_price_id = 'price_1Sa46oC2I88MOqJ1hWTT8OxV',
  updated_at = NOW()
WHERE name = 'Initiation Fee';

-- 3. Update Drop-In Pricing
UPDATE public.drop_in_pricing
SET
  stripe_product_id = 'prod_TX8NXeBVG5Op9s',
  stripe_price_id = 'price_1Sa46oC2I88MOqJ1EoippchK',
  updated_at = NOW()
WHERE is_active = true;

COMMIT;

-- Verification
SELECT name, is_active, stripe_price_id FROM public.membership_plans ORDER BY name;
