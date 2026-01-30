-- Sync Stripe catalog IDs (Jan 2026)
-- Purpose:
-- - Ensure membership_plans has the 6 sport-specific membership Stripe IDs
-- - Ensure drop_in_pricing has the Drop-In Session Stripe IDs
-- - Deactivate legacy/incorrect membership plans

-- ----------------------------------------------------------------------------
-- 1) Ensure drop_in_pricing has Stripe ID columns
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'drop_in_pricing'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'drop_in_pricing'
        AND column_name = 'stripe_product_id'
    ) THEN
      ALTER TABLE public.drop_in_pricing ADD COLUMN stripe_product_id TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'drop_in_pricing'
        AND column_name = 'stripe_price_id'
    ) THEN
      ALTER TABLE public.drop_in_pricing ADD COLUMN stripe_price_id TEXT;
    END IF;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2) Update the 6 membership plans to the current Stripe catalog
-- ----------------------------------------------------------------------------
UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqNDrcV6C4UxVwurJIy8P',
  stripe_product_id = 'prod_Tp3y66WeMEruGq',
  updated_at = NOW()
WHERE name = 'Table Tennis Monthly';

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPquDrcV6C4UxVVoIsXWTp',
  stripe_product_id = 'prod_Tp3y7yvbUGKhaw',
  updated_at = NOW()
WHERE name = 'Table Tennis Half-Yearly';

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqwDrcV6C4UxVga7Xmx5f',
  stripe_product_id = 'prod_Tp3yhrzsxxJbkg',
  updated_at = NOW()
WHERE name = 'Table Tennis Yearly';

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqxDrcV6C4UxVFAt8uTQR',
  stripe_product_id = 'prod_Tp3yEBQHX37B9T',
  updated_at = NOW()
WHERE name = 'Squash Monthly';

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqzDrcV6C4UxVSjopZuAY',
  stripe_product_id = 'prod_Tp3yWHfXJPspiX',
  updated_at = NOW()
WHERE name = 'Squash Half-Yearly';

UPDATE public.membership_plans
SET
  stripe_price_id = 'price_1SrPqzDrcV6C4UxVy3xvhpnt',
  stripe_product_id = 'prod_Tp3ywHkZ6qp0d7',
  updated_at = NOW()
WHERE name = 'Squash Yearly';

-- ----------------------------------------------------------------------------
-- 3) Drop-in pricing uses a single Stripe product/price (one-time payment)
-- ----------------------------------------------------------------------------
UPDATE public.drop_in_pricing
SET
  stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE',
  stripe_product_id = 'prod_TR0LWsYW3ACwFQ',
  updated_at = NOW()
WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- 4) Deactivate legacy/incorrect membership plans
-- ----------------------------------------------------------------------------
UPDATE public.membership_plans
SET
  is_active = false,
  updated_at = NOW()
WHERE name IN (
  'Monthly Membership',
  'Half-Yearly Membership',
  'Yearly Membership',
  'Squash Monthly Membership',
  'Table Tennis Monthly Membership',
  'Squash + Gym Monthly Membership'
)
AND is_active = true;

