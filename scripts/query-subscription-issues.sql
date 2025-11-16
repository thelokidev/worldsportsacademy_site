-- Query: Find Users with Subscription Issues
-- Identifies users who may have payment issues or missing data

-- 1. Users with Stripe Customer ID but no membership
SELECT 
  'Missing Membership' as issue_type,
  u.id as user_id,
  u.email,
  p.full_name,
  p.stripe_customer_id,
  'Has Stripe customer ID but no membership record' as description
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.memberships m ON u.id = m.user_id
WHERE p.stripe_customer_id IS NOT NULL
  AND m.id IS NULL
ORDER BY u.created_at DESC;

-- 2. Users with active Stripe subscriptions but expired/canceled memberships
SELECT 
  'Expired/Canceled Membership' as issue_type,
  u.id as user_id,
  u.email,
  p.full_name,
  m.stripe_subscription_id,
  m.status as membership_status,
  m.current_period_end,
  CASE 
    WHEN m.current_period_end < NOW() THEN 'Expired'
    WHEN m.status = 'canceled' THEN 'Canceled'
    ELSE 'Other'
  END as issue_description
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
INNER JOIN public.memberships m ON u.id = m.user_id
WHERE m.stripe_subscription_id IS NOT NULL
  AND (m.current_period_end < NOW() OR m.status = 'canceled')
ORDER BY m.current_period_end DESC;

-- 3. Users without Stripe Customer ID (may have payment issues)
SELECT 
  'Missing Customer ID' as issue_type,
  u.id as user_id,
  u.email,
  p.full_name,
  m.stripe_subscription_id,
  'User has membership but no stripe_customer_id in profile' as description
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
INNER JOIN public.memberships m ON u.id = m.user_id
WHERE p.stripe_customer_id IS NULL
  AND m.stripe_subscription_id IS NOT NULL
ORDER BY m.created_at DESC;

-- 4. Multiple active memberships for same user (shouldn't happen)
SELECT 
  'Multiple Active Memberships' as issue_type,
  u.id as user_id,
  u.email,
  p.full_name,
  COUNT(m.id) as membership_count,
  STRING_AGG(m.stripe_subscription_id, ', ') as subscription_ids
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
INNER JOIN public.memberships m ON u.id = m.user_id
WHERE m.status IN ('active', 'trialing')
  AND m.current_period_end > NOW()
GROUP BY u.id, u.email, p.full_name
HAVING COUNT(m.id) > 1
ORDER BY membership_count DESC;

