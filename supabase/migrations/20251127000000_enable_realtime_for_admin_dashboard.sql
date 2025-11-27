-- Migration: Enable Realtime for Admin Dashboard tables
-- This enables real-time subscriptions for bookings, memberships, payments, and courts
-- Applied to project: xvdqlbgecwwynaemudhp (WSA)

-- Enable realtime for admin dashboard tables
-- Using DO blocks to handle cases where tables are already in publication

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'memberships'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'payment_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_events;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'payment_refunds'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_refunds;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'courts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.courts;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- Create a security definer function to check admin status (bypasses RLS to avoid infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admin RLS policies using the security definer function to avoid infinite recursion
-- Note: These policies allow users to see their own data OR admins to see all data

-- Admin can view all bookings
DO $$ 
BEGIN
  -- Drop existing policy if it exists (to avoid conflicts)
  DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
  
  CREATE POLICY "Admin can view all bookings" ON public.bookings
    FOR SELECT
    USING (
      user_id = auth.uid() OR public.is_admin()
    );
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Policy already exists
END $$;

-- Admin can view all memberships
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can view all memberships" ON public.memberships;
  
  CREATE POLICY "Admin can view all memberships" ON public.memberships
    FOR SELECT
    USING (
      user_id = auth.uid() OR public.is_admin()
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Admin can view all payments
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
  
  CREATE POLICY "Admin can view all payments" ON public.payments
    FOR SELECT
    USING (
      user_id = auth.uid() OR public.is_admin()
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Note: We do NOT create "Admin can view all profiles" policy on profiles table
-- because it would cause infinite recursion. The is_admin() function handles admin checks
-- and existing "Users can view own profile" policy handles normal user access.
