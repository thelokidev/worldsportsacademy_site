-- Migration: Add waiver signature fields to profiles table

-- 1. Add columns for waiver signature if they don't exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    -- Add waiver_signed_at column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'waiver_signed_at'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN waiver_signed_at TIMESTAMPTZ;
    END IF;

    -- Add waiver_signature_name column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'waiver_signature_name'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN waiver_signature_name TEXT;
    END IF;

    -- Add waiver_signature_address column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'waiver_signature_address'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN waiver_signature_address TEXT;
    END IF;
  END IF;
END $$;

-- 2. Add index on waiver_signed_at for performance
CREATE INDEX IF NOT EXISTS idx_profiles_waiver_signed_at 
ON public.profiles(waiver_signed_at) 
WHERE waiver_signed_at IS NOT NULL;

-- 3. Add RLS policies for waiver fields
-- Users can read their own waiver status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can read own waiver status'
  ) THEN
    CREATE POLICY "Users can read own waiver status"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;
END $$;

-- Users can update their own waiver fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own waiver'
  ) THEN
    CREATE POLICY "Users can update own waiver"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

