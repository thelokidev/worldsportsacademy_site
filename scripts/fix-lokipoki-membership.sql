-- Fix Membership for lokipoki49@gmail.com
-- Subscription: sub_1SUGARDrcV6C4UxV6sSdFq9z (Squash + Gym Monthly Membership)
-- Price ID: price_1SU8J6DrcV6C4UxVLHTPsSTb
-- Status: Should be active (currently showing as canceled or missing)

-- Step 1: Ensure profile exists with stripe_customer_id
DO $$
DECLARE
  v_user_id UUID;
  v_customer_id TEXT := 'cus_TR7vdSz5gzK04y'; -- From Stripe subscription
  v_user_email TEXT := 'lokipoki49@gmail.com';
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', v_user_email;
  END IF;

  RAISE NOTICE 'Found user_id: %', v_user_id;

  -- Ensure profile exists and has stripe_customer_id
  INSERT INTO public.profiles (id, stripe_customer_id, email)
  VALUES (v_user_id, v_customer_id, v_user_email)
  ON CONFLICT (id)
  DO UPDATE SET
    stripe_customer_id = COALESCE(profiles.stripe_customer_id, EXCLUDED.stripe_customer_id),
    email = COALESCE(profiles.email, EXCLUDED.email),
    updated_at = NOW();

  RAISE NOTICE 'Profile updated with stripe_customer_id: %', v_customer_id;
END $$;

-- Step 2: Find or create membership
DO $$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
  v_membership_exists BOOLEAN;
  v_customer_id TEXT := 'cus_TR7vdSz5gzK04y';
  v_subscription_id TEXT := 'sub_1SUGARDrcV6C4UxV6sSdFq9z';
  v_price_id TEXT := 'price_1SU8J6DrcV6C4UxVLHTPsSTb';
BEGIN
  -- Find user by Stripe customer ID
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE stripe_customer_id = v_customer_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for Stripe customer %. Run Step 1 first.', v_customer_id;
  END IF;

  RAISE NOTICE 'Found user_id: %', v_user_id;

  -- Find plan by Stripe price ID (Squash + Gym Monthly Membership)
  SELECT id INTO v_plan_id
  FROM public.membership_plans
  WHERE stripe_price_id = v_price_id
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan not found for Stripe price % (Squash + Gym Monthly)', v_price_id;
  END IF;

  RAISE NOTICE 'Found plan_id: %', v_plan_id;

  -- Check if membership already exists
  SELECT EXISTS(
    SELECT 1 FROM public.memberships
    WHERE stripe_subscription_id = v_subscription_id
  ) INTO v_membership_exists;

  IF v_membership_exists THEN
    RAISE NOTICE 'Membership exists, updating to active status...';
    
    -- Update existing membership to active
    UPDATE public.memberships
    SET
      user_id = v_user_id,
      plan_id = v_plan_id,
      status = 'active',
      current_period_start = '2025-11-17 00:19:00+00'::timestamptz, -- From Stripe
      current_period_end = '2025-12-17 00:19:00+00'::timestamptz, -- From Stripe
      cancel_at_period_end = false,
      canceled_at = NULL,
      updated_at = NOW()
    WHERE stripe_subscription_id = v_subscription_id;

    RAISE NOTICE 'Updated existing membership to active';
  ELSE
    RAISE NOTICE 'Creating new membership...';
    
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
      v_subscription_id,
      v_customer_id,
      'active',
      '2025-11-17 00:19:00+00'::timestamptz,
      '2025-12-17 00:19:00+00'::timestamptz,
      false,
      NULL,
      NULL
    );

    RAISE NOTICE 'Successfully created membership for subscription %', v_subscription_id;
  END IF;
END $$;

-- Step 3: Verify the result
SELECT
  '✅ VERIFICATION' as status,
  u.email,
  p.full_name,
  m.id as membership_id,
  m.status,
  mp.name as plan_name,
  m.stripe_subscription_id,
  m.current_period_start,
  m.current_period_end,
  p.stripe_customer_id
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
INNER JOIN public.memberships m ON u.id = m.user_id
INNER JOIN public.membership_plans mp ON m.plan_id = mp.id
WHERE u.email = 'lokipoki49@gmail.com'
  AND m.stripe_subscription_id = 'sub_1SUGARDrcV6C4UxV6sSdFq9z'
ORDER BY m.created_at DESC
LIMIT 1;

