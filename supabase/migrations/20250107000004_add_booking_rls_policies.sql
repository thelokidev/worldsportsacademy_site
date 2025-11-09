-- Migration: Add RLS policies for bookings table
-- Allows users to view, create, update (cancel) their own bookings

-- Enable RLS on bookings table if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own bookings
CREATE POLICY "Users can create their own bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update (cancel) their own bookings
-- Only allow updating future bookings
-- The application logic in cancelBooking() validates that booking is not past and handles status changes
CREATE POLICY "Users can update their own bookings"
  ON public.bookings
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND start_time > NOW()  -- Only allow updating future bookings
  )
  WITH CHECK (
    auth.uid() = user_id
    -- Allow updates to their own bookings (status changes to 'cancelled' are handled by app logic)
  );

-- Policy: Admins can view all bookings (if profiles.role exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    CREATE POLICY "Admins can view all bookings"
      ON public.bookings
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );

    CREATE POLICY "Admins can update all bookings"
      ON public.bookings
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

