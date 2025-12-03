-- Update membership_plans table with new Stripe Product IDs
-- Run this in Supabase SQL Editor

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1Sa46pC2I88MOqJ1K8iEy1NH',
  stripe_product_id = 'prod_TX8Nj6SfIe7Pif',
  updated_at = NOW()
WHERE name = 'Monthly Membership';

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1Sa46pC2I88MOqJ1yd0uZ1Lj',
  stripe_product_id = 'prod_TX8NDRIaXUjNl6',
  updated_at = NOW()
WHERE name = 'Half-Yearly Membership';

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1Sa46qC2I88MOqJ1iDaWEf0o',
  stripe_product_id = 'prod_TX8Nc4iWv8q7QM',
  updated_at = NOW()
WHERE name = 'Yearly Membership';

-- Verify updates
SELECT name, price, stripe_price_id, stripe_product_id
FROM public.membership_plans
WHERE is_active = true
ORDER BY display_order;
