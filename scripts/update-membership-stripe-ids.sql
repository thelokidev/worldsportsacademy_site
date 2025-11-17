-- Script: Update Stripe Product/Price IDs for Membership Plans
-- Run this in Supabase SQL Editor if your membership_plans table
-- is missing the static Stripe IDs provided by the client.

BEGIN;

UPDATE public.membership_plans
SET
  stripe_product_id = 'prod_TR0EUV4UN3agee',
  stripe_price_id = 'price_1SU8DiDrcV6C4UxVJ9IJUgFN',
  updated_at = NOW()
WHERE name = 'Squash Monthly Membership';

UPDATE public.membership_plans
SET
  stripe_product_id = 'prod_TR0IPewTnDWYGI',
  stripe_price_id = 'price_1SU8HzDrcV6C4UxVkPQVUJZg',
  updated_at = NOW()
WHERE name = 'Table Tennis Monthly Membership';

UPDATE public.membership_plans
SET
  stripe_product_id = 'prod_TR0Jm3UW2QuvHu',
  stripe_price_id = 'price_1SU8J6DrcV6C4UxVLHTPsSTb',
  updated_at = NOW()
WHERE name = 'Squash + Gym Monthly Membership';

-- Optional: ensure drop-in pricing also points to static IDs
UPDATE public.drop_in_pricing
SET
  stripe_product_id = 'prod_TR0LWsYW3ACwFQ',
  stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE',
  updated_at = NOW()
WHERE is_active = true;

COMMIT;

