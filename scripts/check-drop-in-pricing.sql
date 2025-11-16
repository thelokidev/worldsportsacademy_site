-- Script to check drop_in_pricing table and verify Stripe IDs
-- Run this in Supabase SQL Editor or via Supabase CLI

-- 1. Check if the table exists and has the Stripe ID columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'drop_in_pricing'
ORDER BY ordinal_position;

-- 2. Check all records in drop_in_pricing with their Stripe IDs
SELECT 
    id,
    sport_id,
    price,
    duration_minutes,
    tax_rate,
    stripe_product_id,
    stripe_price_id,
    is_active,
    created_at,
    updated_at
FROM public.drop_in_pricing
ORDER BY sport_id, duration_minutes;

-- 3. Check if any records are missing Stripe IDs
SELECT 
    id,
    sport_id,
    price,
    duration_minutes,
    CASE 
        WHEN stripe_price_id IS NULL THEN '❌ Missing stripe_price_id'
        ELSE '✅ Has stripe_price_id'
    END as price_id_status,
    CASE 
        WHEN stripe_product_id IS NULL THEN '❌ Missing stripe_product_id'
        ELSE '✅ Has stripe_product_id'
    END as product_id_status
FROM public.drop_in_pricing
WHERE is_active = true
ORDER BY sport_id, duration_minutes;

-- 4. Count records with/without Stripe IDs
SELECT 
    COUNT(*) as total_records,
    COUNT(stripe_price_id) as records_with_price_id,
    COUNT(stripe_product_id) as records_with_product_id,
    COUNT(*) - COUNT(stripe_price_id) as missing_price_id,
    COUNT(*) - COUNT(stripe_product_id) as missing_product_id
FROM public.drop_in_pricing
WHERE is_active = true;

-- 5. Verify the expected Stripe IDs are set
SELECT 
    sport_id,
    duration_minutes,
    price,
    stripe_price_id,
    stripe_product_id,
    CASE 
        WHEN stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE' THEN '✅ Correct price ID'
        WHEN stripe_price_id IS NULL THEN '❌ Missing price ID'
        ELSE '⚠️ Different price ID'
    END as price_id_check,
    CASE 
        WHEN stripe_product_id = 'prod_TR0LWsYW3ACwFQ' THEN '✅ Correct product ID'
        WHEN stripe_product_id IS NULL THEN '❌ Missing product ID'
        ELSE '⚠️ Different product ID'
    END as product_id_check
FROM public.drop_in_pricing
WHERE is_active = true
ORDER BY sport_id, duration_minutes;

