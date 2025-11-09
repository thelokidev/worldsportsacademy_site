-- Migration: Add proper admin RLS policies after profiles.role column exists
-- This migration should run after profiles table and role column are created

-- Drop the temporary service role policies
DROP POLICY IF EXISTS "Membership plans are manageable by service role" ON public.membership_plans;
DROP POLICY IF EXISTS "Service role can view all memberships" ON public.memberships;
DROP POLICY IF EXISTS "Service role can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Drop-in pricing is manageable by service role" ON public.drop_in_pricing;
DROP POLICY IF EXISTS "Training programs are manageable by service role" ON public.training_programs;
DROP POLICY IF EXISTS "Sport settings are manageable by service role" ON public.sport_settings;

-- Add proper admin policies (only if profiles.role column exists)
DO $$
BEGIN
  -- Check if profiles.role column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    -- Membership plans admin policy
    CREATE POLICY "Membership plans are manageable by admins"
      ON public.membership_plans
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );

    -- Memberships admin policy
    CREATE POLICY "Admins can view all memberships"
      ON public.memberships
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );

    -- Payments admin policy
    CREATE POLICY "Admins can view all payments"
      ON public.payments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );

    -- Drop-in pricing admin policy
    CREATE POLICY "Drop-in pricing is manageable by admins"
      ON public.drop_in_pricing
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );

    -- Training programs admin policy
    CREATE POLICY "Training programs are manageable by admins"
      ON public.training_programs
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );

    -- Sport settings admin policy
    CREATE POLICY "Sport settings are manageable by admins"
      ON public.sport_settings
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

