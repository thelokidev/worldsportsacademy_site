-- =============================================================================
-- Verify: Fix Stripe Price IDs migration (20260130000000_fix_stripe_price_ids.sql)
-- Run this in Supabase SQL Editor to confirm the migration was applied.
-- =============================================================================

-- ------------------------------------------------------------------------------
-- 1. Expected values (from the migration)
-- ------------------------------------------------------------------------------
-- Table Tennis Monthly:  price_1SrPp0DwbguMPSQs4ux7Q4Sw, prod_Tp3wTFdLAGs4WD
-- Table Tennis Half-Yearly: price_1SrPp1DwbguMPSQsIYDiXQcX, prod_Tp3wu9D5lPbapA
-- Table Tennis Yearly: price_1SrPp1DwbguMPSQsGxCSTUBF, prod_Tp3wTNlWzgZQ1a
-- Squash Monthly: price_1SrPp2DwbguMPSQsfmgBrJqP, prod_Tp3wyR02WyBbCa
-- Squash Half-Yearly: price_1SrPp3DwbguMPSQs7zVoskc6, prod_Tp3wqSLuAhap3W
-- Squash Yearly: price_1SrPp3DwbguMPSQs2X8NMw2F, prod_Tp3whjjsxU5hWE
-- Drop-in (active): price_1SvJvaDwbguMPSQshdIDI7S5, prod_Tt670rQMvzR1Tr

-- ------------------------------------------------------------------------------
-- 2. membership_plans: current stripe IDs for the 6 updated plans
-- ------------------------------------------------------------------------------
SELECT
  name,
  stripe_price_id,
  stripe_product_id,
  updated_at,
  CASE
    WHEN name = 'Table Tennis Monthly' AND stripe_price_id = 'price_1SrPp0DwbguMPSQs4ux7Q4Sw' AND stripe_product_id = 'prod_Tp3wTFdLAGs4WD' THEN 'OK'
    WHEN name = 'Table Tennis Half-Yearly' AND stripe_price_id = 'price_1SrPp1DwbguMPSQsIYDiXQcX' AND stripe_product_id = 'prod_Tp3wu9D5lPbapA' THEN 'OK'
    WHEN name = 'Table Tennis Yearly' AND stripe_price_id = 'price_1SrPp1DwbguMPSQsGxCSTUBF' AND stripe_product_id = 'prod_Tp3wTNlWzgZQ1a' THEN 'OK'
    WHEN name = 'Squash Monthly' AND stripe_price_id = 'price_1SrPp2DwbguMPSQsfmgBrJqP' AND stripe_product_id = 'prod_Tp3wyR02WyBbCa' THEN 'OK'
    WHEN name = 'Squash Half-Yearly' AND stripe_price_id = 'price_1SrPp3DwbguMPSQs7zVoskc6' AND stripe_product_id = 'prod_Tp3wqSLuAhap3W' THEN 'OK'
    WHEN name = 'Squash Yearly' AND stripe_price_id = 'price_1SrPp3DwbguMPSQs2X8NMw2F' AND stripe_product_id = 'prod_Tp3whjjsxU5hWE' THEN 'OK'
    ELSE 'MISMATCH'
  END AS verification
FROM public.membership_plans
WHERE is_active = true
  AND name IN (
    'Table Tennis Monthly',
    'Table Tennis Half-Yearly',
    'Table Tennis Yearly',
    'Squash Monthly',
    'Squash Half-Yearly',
    'Squash Yearly'
  )
ORDER BY name;

-- ------------------------------------------------------------------------------
-- 3. drop_in_pricing: current stripe IDs for active row(s)
-- ------------------------------------------------------------------------------
SELECT
  id,
  stripe_price_id,
  stripe_product_id,
  is_active,
  updated_at,
  CASE
    WHEN is_active = true
         AND stripe_price_id = 'price_1SvJvaDwbguMPSQshdIDI7S5'
         AND stripe_product_id = 'prod_Tt670rQMvzR1Tr' THEN 'OK'
    ELSE 'MISMATCH'
  END AS verification
FROM public.drop_in_pricing
WHERE is_active = true;

-- ------------------------------------------------------------------------------
-- 4. Summary: any row that does NOT match expected values (should return 0 rows)
-- ------------------------------------------------------------------------------
SELECT 'membership_plans' AS table_name, name AS row_id, stripe_price_id, stripe_product_id
FROM public.membership_plans
WHERE is_active = true
  AND name IN (
    'Table Tennis Monthly',
    'Table Tennis Half-Yearly',
    'Table Tennis Yearly',
    'Squash Monthly',
    'Squash Half-Yearly',
    'Squash Yearly'
  )
  AND NOT (
    (name = 'Table Tennis Monthly' AND stripe_price_id = 'price_1SrPp0DwbguMPSQs4ux7Q4Sw' AND stripe_product_id = 'prod_Tp3wTFdLAGs4WD')
    OR (name = 'Table Tennis Half-Yearly' AND stripe_price_id = 'price_1SrPp1DwbguMPSQsIYDiXQcX' AND stripe_product_id = 'prod_Tp3wu9D5lPbapA')
    OR (name = 'Table Tennis Yearly' AND stripe_price_id = 'price_1SrPp1DwbguMPSQsGxCSTUBF' AND stripe_product_id = 'prod_Tp3wTNlWzgZQ1a')
    OR (name = 'Squash Monthly' AND stripe_price_id = 'price_1SrPp2DwbguMPSQsfmgBrJqP' AND stripe_product_id = 'prod_Tp3wyR02WyBbCa')
    OR (name = 'Squash Half-Yearly' AND stripe_price_id = 'price_1SrPp3DwbguMPSQs7zVoskc6' AND stripe_product_id = 'prod_Tp3wqSLuAhap3W')
    OR (name = 'Squash Yearly' AND stripe_price_id = 'price_1SrPp3DwbguMPSQs2X8NMw2F' AND stripe_product_id = 'prod_Tp3whjjsxU5hWE')
  )
UNION ALL
SELECT 'drop_in_pricing' AS table_name, id::text, stripe_price_id, stripe_product_id
FROM public.drop_in_pricing
WHERE is_active = true
  AND (stripe_price_id IS DISTINCT FROM 'price_1SvJvaDwbguMPSQshdIDI7S5'
       OR stripe_product_id IS DISTINCT FROM 'prod_Tt670rQMvzR1Tr');
