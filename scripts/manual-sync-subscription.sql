-- Manual Subscription Sync Script
-- Use this to manually sync a Stripe subscription to the database
-- Run this in Supabase SQL Editor or via CLI

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
-- 1. Replace the values below with the actual subscription data from Stripe
-- 2. Get user_id from profiles table using stripe_customer_id
-- 3. Get plan_id from membership_plans table using stripe_price_id
-- 4. Run this script in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Find the user by Stripe customer ID
-- ============================================================================
SELECT 
  id as user_id,
  stripe_customer_id,
  full_name,
  created_at
FROM public.profiles
WHERE stripe_customer_id = 'cus_TR4jdcDwCx3owX';  -- Replace with actual customer ID

-- ============================================================================
-- STEP 2: Find the plan by Stripe price ID
-- ============================================================================
SELECT 
  id as plan_id,
  name,
  price,
  stripe_price_id,
  stripe_product_id
FROM public.membership_plans
WHERE stripe_price_id = 'price_1SU8DiDrcV6C4UxVJ9IJUgFN';  -- Replace with actual price ID

-- ============================================================================
-- STEP 3: Check if membership already exists
-- ============================================================================
SELECT *
FROM public.memberships
WHERE stripe_subscription_id = 'sub_1SUEJ6DrcV6C4UxVAz7TVlH2'  -- Replace with actual subscription ID
ORDER BY created_at DESC
LIMIT 1;

-- ============================================================================
-- STEP 4: Insert the membership (run this ONLY if STEP 3 returns no results)
-- ============================================================================
-- IMPORTANT: Replace ALL placeholder values with actual data from Stripe:
-- - user_id: from STEP 1
-- - plan_id: from STEP 2
-- - stripe_subscription_id: from Stripe subscription object
-- - stripe_customer_id: from Stripe subscription object
-- - current_period_start: convert from Unix timestamp to ISO8601
-- - current_period_end: convert from Unix timestamp to ISO8601

INSERT INTO public.memberships (
  user_id,
  plan_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  trial_start,
  trial_end
) VALUES (
  'USER_ID_FROM_STEP_1',  -- Replace with user_id from STEP 1
  'PLAN_ID_FROM_STEP_2',  -- Replace with plan_id from STEP 2
  'sub_1SUEJ6DrcV6C4UxVAz7TVlH2',  -- Stripe subscription ID
  'cus_TR4jdcDwCx3owX',  -- Stripe customer ID
  'active',  -- Subscription status
  '2025-01-16 21:53:48+00',  -- Convert 1763331628 from Unix to ISO8601
  '2025-02-16 21:53:48+00',  -- Convert 1765923628 from Unix to ISO8601
  false,  -- cancel_at_period_end
  NULL,  -- trial_start (if applicable)
  NULL   -- trial_end (if applicable)
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  user_id = EXCLUDED.user_id,
  plan_id = EXCLUDED.plan_id,
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at = NOW()
RETURNING *;

-- ============================================================================
-- STEP 5: Verify the membership was created
-- ============================================================================
SELECT 
  m.*,
  p.name as plan_name,
  p.price as plan_price,
  prof.full_name as user_name
FROM public.memberships m
JOIN public.membership_plans p ON m.plan_id = p.id
JOIN public.profiles prof ON m.user_id = prof.id
WHERE m.stripe_subscription_id = 'sub_1SUEJ6DrcV6C4UxVAz7TVlH2'
ORDER BY m.created_at DESC
LIMIT 1;

-- ============================================================================
-- CONVERSION REFERENCE
-- ============================================================================
-- Stripe timestamps are Unix timestamps (seconds since 1970-01-01)
-- PostgreSQL timestamps are in ISO8601 format
--
-- To convert:
-- 1. Go to https://www.unixtimestamp.com/
-- 2. Enter the Unix timestamp
-- 3. Copy the ISO 8601 format
-- 4. OR use this SQL function:
--    SELECT to_timestamp(1763331628)::timestamptz;

