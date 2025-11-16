-- Migration: Fix profiles table stripe_customer_id column and refresh schema cache
-- This ensures the column exists and PostgREST schema cache is refreshed

DO $$ 
BEGIN
  -- 1. Ensure stripe_customer_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
    RAISE NOTICE 'Added stripe_customer_id column to profiles table';
  ELSE
    RAISE NOTICE 'stripe_customer_id column already exists in profiles table';
  END IF;

  -- 2. Create unique index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND indexname = 'idx_profiles_stripe_customer_id'
  ) THEN
    CREATE UNIQUE INDEX idx_profiles_stripe_customer_id 
      ON public.profiles(stripe_customer_id) 
      WHERE stripe_customer_id IS NOT NULL;
    RAISE NOTICE 'Created unique index on stripe_customer_id';
  ELSE
    RAISE NOTICE 'Index idx_profiles_stripe_customer_id already exists';
  END IF;

  -- 3. Refresh PostgREST schema cache
  -- This is critical - PostgREST caches the schema and needs to be notified of changes
  NOTIFY pgrst, 'reload schema';
  RAISE NOTICE 'Notified PostgREST to reload schema cache';
  
END $$;

-- 4. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;

-- 5. Ensure RLS policies allow updates to stripe_customer_id
DO $$
BEGIN
  -- Check if update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Created RLS policy for profile updates';
  END IF;
END $$;

