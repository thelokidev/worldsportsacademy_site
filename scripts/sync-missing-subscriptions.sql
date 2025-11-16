-- Automated Subscription Sync for Current Issue
-- This script syncs the specific subscription that wasn't created by the webhook
-- Run this in Supabase SQL Editor

-- SUBSCRIPTION DETAILS FROM STRIPE:
-- Subscription ID: sub_1SUEJ6DrcV6C4UxVAz7TVlH2
-- Customer ID: cus_TR4jdcDwCx3owX
-- Price ID: price_1SU8DiDrcV6C4UxVJ9IJUgFN (Squash Monthly Membership - $70)
-- Status: active
-- Created: 1763331628 (2025-01-16 21:53:48 UTC)
-- Current Period Start: 1763331628
-- Current Period End: 1765923628 (2025-02-16 21:53:48 UTC)

-- Step 1: Get user_id from profiles
DO $$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
  v_membership_exists BOOLEAN;
BEGIN
  -- Find user by Stripe customer ID
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE stripe_customer_id = 'cus_TR4jdcDwCx3owX'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for Stripe customer cus_TR4jdcDwCx3owX';
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
      'cus_TR4jdcDwCx3owX',
      'active',
      to_timestamp(1763331628)::timestamptz,
      to_timestamp(1765923628)::timestamptz,
      false,
      NULL,
      NULL
    )
    ON CONFLICT (stripe_subscription_id) DO NOTHING;

    RAISE NOTICE 'Successfully created membership for subscription sub_1SUEJ6DrcV6C4UxVAz7TVlH2';
  END IF;
END $$;

-- Verify the result
SELECT 
  m.id,
  m.user_id,
  m.plan_id,
  m.stripe_subscription_id,
  m.status,
  m.current_period_start,
  m.current_period_end,
  p.name as plan_name,
  p.price as plan_price,
  prof.full_name as user_name,
  prof.stripe_customer_id
FROM public.memberships m
JOIN public.membership_plans p ON m.plan_id = p.id
LEFT JOIN public.profiles prof ON m.user_id = prof.id
WHERE m.stripe_subscription_id = 'sub_1SUEJ6DrcV6C4UxVAz7TVlH2'
ORDER BY m.created_at DESC
LIMIT 1;

