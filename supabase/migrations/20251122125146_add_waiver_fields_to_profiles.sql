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

-- 2. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

