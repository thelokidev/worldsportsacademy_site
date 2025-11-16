-- Migration: Update Stripe Product IDs and Price IDs for membership plans and drop-in pricing
-- Updates all membership plans and drop-in pricing with their corresponding Stripe product and price IDs

-- 1. Add Stripe ID columns to drop_in_pricing table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'drop_in_pricing' 
    AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE public.drop_in_pricing 
    ADD COLUMN stripe_product_id TEXT,
    ADD COLUMN stripe_price_id TEXT;
  END IF;
END $$;

-- 2. Update all drop-in pricing records with the static Stripe product/price ID
-- All drop-in sessions use the same Stripe product and price ID
UPDATE public.drop_in_pricing
SET 
  stripe_product_id = 'prod_TR0LWsYW3ACwFQ',
  stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE',
  updated_at = NOW()
WHERE is_active = true;

-- 3. Update Squash Monthly Membership
UPDATE public.membership_plans
SET 
  stripe_product_id = 'prod_TR0EUV4UN3agee',
  stripe_price_id = 'price_1SU8DiDrcV6C4UxVJ9IJUgFN',
  updated_at = NOW()
WHERE name = 'Squash Monthly Membership';

-- 4. Update Table Tennis Monthly Membership
UPDATE public.membership_plans
SET 
  stripe_product_id = 'prod_TR0IPewTnDWYGI',
  stripe_price_id = 'price_1SU8HzDrcV6C4UxVkPQVUJZg',
  updated_at = NOW()
WHERE name = 'Table Tennis Monthly Membership';

-- 5. Update Squash + Gym Monthly Membership
UPDATE public.membership_plans
SET 
  stripe_product_id = 'prod_TR0Jm3UW2QuvHu',
  stripe_price_id = 'price_1SU8J6DrcV6C4UxVLHTPsSTb',
  updated_at = NOW()
WHERE name = 'Squash + Gym Monthly Membership';

