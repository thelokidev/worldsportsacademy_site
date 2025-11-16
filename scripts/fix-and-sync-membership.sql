-- Comprehensive Fix: Sync membership and fix missing stripe_customer_id
-- This script handles the case where profile might not have stripe_customer_id set
-- Run this in Supabase SQL Editor

-- ============================================================================
-- CONFIGURATION
-- ============================================================================
-- Update these values if needed:
-- 1. Customer email: Get from Stripe Dashboard → Customers → cus_TR4jdcDwCx3owX
-- 2. If email is different, update the email in the script below

-- ============================================================================
-- STEP 1: Find user by email and update profile with stripe_customer_id
-- ============================================================================
DO $$
DECLARE
  v_user_id UUID;
  v_customer_id TEXT := 'cus_TR4jdcDwCx3owX';
  v_user_email TEXT := 'lokeshdevsre@gmail.com'; -- Update this if different
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %. Please check the email in Stripe customer record.', v_user_email;
  END IF;

  RAISE NOTICE 'Found user_id: % for email: %', v_user_id, v_user_email;

  -- Ensure profile exists and has stripe_customer_id
  INSERT INTO public.profiles (id, stripe_customer_id, full_name)
  VALUES (v_user_id, v_customer_id, COALESCE((SELECT full_name FROM public.profiles WHERE id = v_user_id), split_part(v_user_email, '@', 1)))
  ON CONFLICT (id) 
  DO UPDATE SET
    stripe_customer_id = COALESCE(profiles.stripe_customer_id, EXCLUDED.stripe_customer_id),
    updated_at = NOW();

  RAISE NOTICE 'Profile updated with stripe_customer_id: %', v_customer_id;
END $$;

-- ============================================================================
-- STEP 2: Sync the membership
-- ============================================================================
DO $$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
  v_membership_exists BOOLEAN;
  v_customer_id TEXT := 'cus_TR4jdcDwCx3owX';
BEGIN
  -- Find user by Stripe customer ID
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE stripe_customer_id = v_customer_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for Stripe customer %. Run STEP 1 first.', v_customer_id;
  END IF;

  RAISE NOTICE 'Found user_id: %', v_user_id;

  -- Find plan by Stripe price ID
  SELECT id INTO v_plan_id
  FROM public.membership_plans
  WHERE stripe_price_id = 'price_1SU8DiDrcV6C4UxVJ9IJUgFN'
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan not found for Stripe price price_1SU8DiDrcV6C4UxVJ9IJUgFN';
  END IF;

  RAISE NOTICE 'Found plan_id: %', v_plan_id;

  -- Check if membership already exists
  SELECT EXISTS(
    SELECT 1 FROM public.memberships
    WHERE stripe_subscription_id = 'sub_1SUEJ6DrcV6C4UxVAz7TVlH2'
  ) INTO v_membership_exists;

  IF v_membership_exists THEN
    RAISE NOTICE 'Membership already exists for subscription sub_1SUEJ6DrcV6C4UxVAz7TVlH2';
    
    -- Update existing membership to ensure it's correct
    UPDATE public.memberships
    SET
      user_id = v_user_id,
      plan_id = v_plan_id,
      status = 'active',
      current_period_start = to_timestamp(1763331628)::timestamptz,
      current_period_end = to_timestamp(1765923628)::timestamptz,
      cancel_at_period_end = false,
      updated_at = NOW()
    WHERE stripe_subscription_id = 'sub_1SUEJ6DrcV6C4UxVAz7TVlH2';
    
    RAISE NOTICE 'Updated existing membership';
  ELSE
    -- Insert the membership
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
      v_user_id,
      v_plan_id,
      'sub_1SUEJ6DrcV6C4UxVAz7TVlH2',
      v_customer_id,
      'active',
      to_timestamp(1763331628)::timestamptz,
      to_timestamp(1765923628)::timestamptz,
      false,
      NULL,
      NULL
    );

    RAISE NOTICE 'Successfully created membership for subscription sub_1SUEJ6DrcV6C4UxVAz7TVlH2';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Verify the result
-- ============================================================================
SELECT 
  '✅ VERIFICATION' as status,
  m.id as membership_id,
  m.user_id,
  m.plan_id,
  m.stripe_subscription_id,
  m.status,
  m.current_period_start,
  m.current_period_end,
  p.name as plan_name,
  p.price as plan_price,
  prof.full_name as user_name,
  prof.stripe_customer_id,
  prof.id as profile_id
FROM public.memberships m
JOIN public.membership_plans p ON m.plan_id = p.id
LEFT JOIN public.profiles prof ON m.user_id = prof.id
WHERE m.stripe_subscription_id = 'sub_1SUEJ6DrcV6C4UxVAz7TVlH2'
ORDER BY m.created_at DESC
LIMIT 1;

