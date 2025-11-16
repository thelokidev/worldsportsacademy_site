-- Diagnostic Script: Check why membership wasn't created
-- Run this FIRST to understand the issue

-- ============================================================================
-- STEP 1: Check if profile exists with this Stripe customer ID
-- ============================================================================
SELECT 
  'Profile Check' as check_type,
  id as user_id,
  stripe_customer_id,
  full_name,
  created_at
FROM public.profiles
WHERE stripe_customer_id = 'cus_TR4jdcDwCx3owX';

-- If this returns no rows, the profile doesn't have stripe_customer_id set
-- We need to find the user by email and update the profile

-- ============================================================================
-- STEP 2: Check all profiles (to find user by email)
-- ============================================================================
-- Replace 'lokeshdevsre@gmail.com' with the actual email from Stripe customer
SELECT 
  'All Profiles' as check_type,
  id as user_id,
  stripe_customer_id,
  full_name,
  created_at
FROM public.profiles
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'lokeshdevsre@gmail.com'
)
LIMIT 5;

-- ============================================================================
-- STEP 3: Check if plan exists
-- ============================================================================
SELECT 
  'Plan Check' as check_type,
  id as plan_id,
  name,
  price,
  stripe_price_id,
  stripe_product_id
FROM public.membership_plans
WHERE stripe_price_id = 'price_1SU8DiDrcV6C4UxVJ9IJUgFN';

-- ============================================================================
-- STEP 4: Check if membership already exists
-- ============================================================================
SELECT 
  'Membership Check' as check_type,
  id,
  user_id,
  plan_id,
  stripe_subscription_id,
  status,
  created_at
FROM public.memberships
WHERE stripe_subscription_id = 'sub_1SUEJ6DrcV6C4UxVAz7TVlH2';

-- ============================================================================
-- STEP 5: Check Stripe customer in Stripe (via API - manual check)
-- ============================================================================
-- Go to: https://dashboard.stripe.com/test/customers/cus_TR4jdcDwCx3owX
-- Check the email address associated with this customer
-- Then use that email in STEP 2 above

