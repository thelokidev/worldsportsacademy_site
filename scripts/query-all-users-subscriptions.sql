-- Query: All Active Users and Their Subscription Status
-- Run this in Supabase SQL Editor to see all users and their membership status

SELECT 
  -- User Information
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  u.last_sign_in_at,
  
  -- Profile Information
  p.full_name,
  p.stripe_customer_id,
  p.updated_at as profile_updated_at,
  
  -- Membership Status
  m.id as membership_id,
  m.status as membership_status,
  m.stripe_subscription_id,
  m.current_period_start,
  m.current_period_end,
  m.cancel_at_period_end,
  m.canceled_at,
  m.created_at as membership_created_at,
  m.updated_at as membership_updated_at,
  
  -- Membership Plan Details
  mp.id as plan_id,
  mp.name as plan_name,
  mp.price as plan_price,
  mp.sport_ids as plan_sport_ids,
  mp.stripe_price_id,
  mp.stripe_product_id,
  
  -- Calculated Fields
  CASE 
    WHEN m.status = 'active' AND m.current_period_end > NOW() THEN 'Active'
    WHEN m.status = 'trialing' AND m.current_period_end > NOW() THEN 'Trialing'
    WHEN m.status = 'active' AND m.current_period_end <= NOW() THEN 'Expired'
    WHEN m.status = 'canceled' THEN 'Canceled'
    WHEN m.status IS NULL THEN 'No Membership'
    ELSE m.status::text
  END as effective_status,
  
  CASE 
    WHEN m.current_period_end > NOW() THEN 
      EXTRACT(EPOCH FROM (m.current_period_end - NOW())) / 86400
    ELSE NULL
  END as days_until_expiry,
  
  -- Additional Info
  CASE 
    WHEN p.stripe_customer_id IS NULL THEN '⚠️ Missing Stripe Customer ID'
    ELSE '✅ Has Stripe Customer ID'
  END as customer_id_status

FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.memberships m ON u.id = m.user_id
LEFT JOIN public.membership_plans mp ON m.plan_id = mp.id

ORDER BY 
  -- Show active memberships first
  CASE 
    WHEN m.status = 'active' AND m.current_period_end > NOW() THEN 1
    WHEN m.status = 'trialing' AND m.current_period_end > NOW() THEN 2
    WHEN m.status IS NULL THEN 3
    ELSE 4
  END,
  u.created_at DESC;

