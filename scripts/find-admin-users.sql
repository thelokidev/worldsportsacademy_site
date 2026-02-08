-- Find all admin users (profiles.role = 'admin')
-- Run with Supabase CLI: supabase db execute -f scripts/find-admin-users.sql
-- Or locally: supabase db execute --local -f scripts/find-admin-users.sql

SELECT
  p.id,
  p.full_name,
  p.role,
  p.created_at AS profile_created_at,
  u.email,
  u.created_at AS auth_created_at,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;
