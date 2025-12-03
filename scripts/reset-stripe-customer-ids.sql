-- Reset Stripe Customer IDs
-- This script clears old Stripe customer IDs from the profiles table.
-- The checkout system will automatically create new customer IDs when users make purchases.

BEGIN;

-- Clear all Stripe customer IDs from profiles
UPDATE public.profiles
SET 
  stripe_customer_id = NULL,
  updated_at = NOW()
WHERE stripe_customer_id IS NOT NULL;

-- Optional: Also clear membership records with old subscription IDs
-- Only uncomment this if you want to completely reset all memberships
-- UPDATE public.memberships
-- SET 
--   status = 'canceled',
--   canceled_at = NOW()
-- WHERE stripe_subscription_id IS NOT NULL;

COMMIT;

-- Verification
SELECT id, stripe_customer_id, full_name
FROM public.profiles 
WHERE stripe_customer_id IS NOT NULL;
-- Should return 0 rows
