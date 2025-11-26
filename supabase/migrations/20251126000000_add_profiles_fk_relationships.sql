-- Migration: Add foreign key relationships from user tables to profiles
-- This enables PostgREST to do embedded joins like profiles:user_id(...)

-- Note: Both memberships.user_id and profiles.id reference auth.users(id)
-- We can add FK constraints from memberships.user_id -> profiles.id since they share UUIDs

-- 1. Add FK from memberships.user_id to profiles.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'memberships_user_id_profiles_fkey'
    AND table_name = 'memberships'
  ) THEN
    -- First check if the FK to auth.users exists and if so, we can add our FK
    ALTER TABLE public.memberships
    ADD CONSTRAINT memberships_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added memberships_user_id_profiles_fkey';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add memberships FK: %', SQLERRM;
END $$;

-- 2. Add FK from bookings.user_id to profiles.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_user_id_profiles_fkey'
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added bookings_user_id_profiles_fkey';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add bookings FK: %', SQLERRM;
END $$;

-- 3. Add FK from payments.user_id to profiles.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_user_id_profiles_fkey'
    AND table_name = 'payments'
  ) THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added payments_user_id_profiles_fkey';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add payments FK: %', SQLERRM;
END $$;

-- 4. Add admin RLS policy for profiles table to allow admins to view all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
    RAISE NOTICE 'Added admin profiles view policy';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add admin policy: %', SQLERRM;
END $$;

-- 5. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

