-- Migration: Add RLS policies for courts table
-- Ensures admins can manage courts and everyone can view them

-- Enable RLS on courts table if not already enabled
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Courts are viewable by everyone" ON public.courts;
DROP POLICY IF EXISTS "Courts are manageable by admins" ON public.courts;

-- Policy: Courts are viewable by everyone (for booking)
CREATE POLICY "Courts are viewable by everyone"
  ON public.courts
  FOR SELECT
  USING (true);

-- Policy: Courts are manageable by admins (only if profiles table exists)
-- This allows admins to insert, update, delete courts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    EXECUTE '
      CREATE POLICY "Courts are manageable by admins"
        ON public.courts
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = ''admin''
          )
        )
    ';
  END IF;
END $$;
