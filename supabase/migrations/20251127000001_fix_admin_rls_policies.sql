-- Migration: Fix Admin RLS Policies
-- Fixes infinite recursion and adds proper admin access policies
-- Applied to project: xvdqlbgecwwynaemudhp (WSA)

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

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Admin can view all profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- Admin can update all profiles (including changing roles)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR public.is_admin()
  );

-- ============================================
-- COURTS TABLE POLICIES
-- ============================================

-- Admin can view all courts (including blocked/inactive)
DROP POLICY IF EXISTS "Admin can view all courts" ON public.courts;
CREATE POLICY "Admin can view all courts" ON public.courts
  FOR SELECT
  USING (
    is_active = true OR public.is_admin()
  );

-- Admin can update courts
DROP POLICY IF EXISTS "Admin can update courts" ON public.courts;
CREATE POLICY "Admin can update courts" ON public.courts
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin can insert courts
DROP POLICY IF EXISTS "Admin can insert courts" ON public.courts;
CREATE POLICY "Admin can insert courts" ON public.courts
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin can delete courts
DROP POLICY IF EXISTS "Admin can delete courts" ON public.courts;
CREATE POLICY "Admin can delete courts" ON public.courts
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- BOOKINGS TABLE POLICIES
-- ============================================

-- Admin can view all bookings
DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
CREATE POLICY "Admin can view all bookings" ON public.bookings
  FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_admin()
  );

-- ============================================
-- MEMBERSHIPS TABLE POLICIES
-- ============================================

-- Admin can view all memberships
DROP POLICY IF EXISTS "Admin can view all memberships" ON public.memberships;
CREATE POLICY "Admin can view all memberships" ON public.memberships
  FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_admin()
  );

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Admin can view all payments
DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
CREATE POLICY "Admin can view all payments" ON public.payments
  FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_admin()
  );

