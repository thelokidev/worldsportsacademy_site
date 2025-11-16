-- Query: Subscription Status Summary
-- Quick overview of all users and their membership status

SELECT 
  u.email,
  COALESCE(p.full_name, 'No name') as name,
  COALESCE(mp.name, 'No Membership') as membership_plan,
  CASE 
    WHEN m.status = 'active' AND m.current_period_end > NOW() THEN '✅ Active'
    WHEN m.status = 'trialing' AND m.current_period_end > NOW() THEN '🔄 Trialing'
    WHEN m.status = 'canceled' THEN '❌ Canceled'
    WHEN m.status IS NULL THEN '⚠️ No Membership'
    ELSE m.status::text
  END as status,
  m.stripe_subscription_id,
  CASE 
    WHEN m.current_period_end IS NOT NULL THEN 
      TO_CHAR(m.current_period_end, 'YYYY-MM-DD')
    ELSE 'N/A'
  END as expires_on,
  CASE 
    WHEN p.stripe_customer_id IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_customer_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.memberships m ON u.id = m.user_id
LEFT JOIN public.membership_plans mp ON m.plan_id = mp.id
ORDER BY 
  CASE 
    WHEN m.status = 'active' AND m.current_period_end > NOW() THEN 1
    WHEN m.status = 'trialing' AND m.current_period_end > NOW() THEN 2
    ELSE 3
  END,
  u.created_at DESC;

