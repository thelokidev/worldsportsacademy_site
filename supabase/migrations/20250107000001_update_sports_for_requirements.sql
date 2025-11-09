-- Migration: Update existing tables for membership system requirements
-- Updates sports, courts, bookings, and profiles tables

-- 1. Update sports table
ALTER TABLE public.sports
  ADD COLUMN IF NOT EXISTS icon_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'coming_soon', 'inactive')),
  ADD COLUMN IF NOT EXISTS requires_membership_for_booking BOOLEAN DEFAULT false;

-- 2. Update profiles table (only if it exists)
DO $$
BEGIN
  -- Check if profiles table exists before altering it
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    -- Add columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'phone_number'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'emergency_contact_name'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN emergency_contact_name TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'emergency_contact_phone'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN emergency_contact_phone TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'stripe_customer_id'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
      CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
    END IF;
  END IF;
END $$;

-- 3. Update bookings table (only if it exists and payments table exists)
DO $$
BEGIN
  -- Check if bookings table exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings'
  ) THEN
    -- Check if payments table exists before adding foreign key
    IF EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'payments'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'payment_id'
      ) THEN
        ALTER TABLE public.bookings ADD COLUMN payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON public.bookings(payment_id);
      END IF;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'booking_type'
    ) THEN
      ALTER TABLE public.bookings ADD COLUMN booking_type TEXT DEFAULT 'member' CHECK (booking_type IN ('member', 'drop_in'));
      CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON public.bookings(booking_type);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'payment_status'
    ) THEN
      ALTER TABLE public.bookings ADD COLUMN payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));
    END IF;
  END IF;
END $$;

-- 4. Ensure courts table has correct structure (should already exist from previous migrations)
-- No changes needed, but verify structure is correct

-- Update existing sports to have correct status
-- Table Tennis and Squash are active, Chess and Pilates are coming soon
UPDATE public.sports
SET status = CASE
  WHEN name = 'table-tennis' THEN 'active'
  WHEN name = 'squash' THEN 'active'
  WHEN name = 'chess' THEN 'coming_soon'
  WHEN name = 'pilates' THEN 'coming_soon'
  ELSE 'active'
END
WHERE status IS NULL;

-- Set default duration_minutes for sports if not set
UPDATE public.sports
SET duration_minutes = CASE
  WHEN name = 'table-tennis' THEN 120  -- 2 hours
  WHEN name = 'squash' THEN 60  -- 1 hour
  ELSE 60
END
WHERE duration_minutes IS NULL;

-- Update duration_options for Table Tennis (2 hours) and Squash (1 hour)
UPDATE public.sports
SET duration_options = CASE
  WHEN name = 'table-tennis' THEN '[120]'::jsonb  -- Only 2 hour sessions
  WHEN name = 'squash' THEN '[60]'::jsonb  -- Only 1 hour sessions
  ELSE duration_options
END;

-- Add Pilates sport if it doesn't exist
INSERT INTO public.sports (id, name, display_name, description, duration_minutes, max_participants, status, icon_name)
SELECT 
  gen_random_uuid(),
  'pilates',
  'Pilates',
  'Low-impact exercise focusing on strength, flexibility, and body awareness',
  60,
  1,
  'coming_soon',
  'pilates'
WHERE NOT EXISTS (
  SELECT 1 FROM public.sports WHERE name = 'pilates'
);

-- Ensure we have exactly 3 Table Tennis tables and 4 Squash courts
DO $$
DECLARE
  tt_sport_id UUID;
  squash_sport_id UUID;
  tt_count INTEGER;
  squash_count INTEGER;
BEGIN
  -- Get sport IDs (only proceed if sports exist)
  SELECT id INTO tt_sport_id FROM public.sports WHERE name = 'table-tennis' LIMIT 1;
  SELECT id INTO squash_sport_id FROM public.sports WHERE name = 'squash' LIMIT 1;
  
  -- Handle Table Tennis tables
  IF tt_sport_id IS NOT NULL THEN
    -- Count existing active courts
    SELECT COUNT(*) INTO tt_count FROM public.courts WHERE sport_id = tt_sport_id AND is_active = true;
    
    -- Delete excess courts if we have more than 3 (keep the oldest ones)
    IF tt_count > 3 THEN
      DELETE FROM public.courts
      WHERE id IN (
        SELECT id FROM public.courts
        WHERE sport_id = tt_sport_id AND is_active = true
        ORDER BY created_at DESC
        OFFSET 3
      );
      tt_count := 3;
    END IF;
    
    -- Add missing Table Tennis tables (need 3 total)
    -- Use sequential numbering starting from existing count + 1
    WHILE tt_count < 3 LOOP
      INSERT INTO public.courts (id, sport_id, name, is_active)
      VALUES (
        gen_random_uuid(), 
        tt_sport_id, 
        'Table Tennis Table ' || (tt_count + 1), 
        true
      );
      tt_count := tt_count + 1;
    END LOOP;
  END IF;
  
  -- Handle Squash courts
  IF squash_sport_id IS NOT NULL THEN
    -- Count existing active courts
    SELECT COUNT(*) INTO squash_count FROM public.courts WHERE sport_id = squash_sport_id AND is_active = true;
    
    -- Delete excess courts if we have more than 4 (keep the oldest ones)
    IF squash_count > 4 THEN
      DELETE FROM public.courts
      WHERE id IN (
        SELECT id FROM public.courts
        WHERE sport_id = squash_sport_id AND is_active = true
        ORDER BY created_at DESC
        OFFSET 4
      );
      squash_count := 4;
    END IF;
    
    -- Add missing Squash courts (need 4 total)
    -- Use sequential numbering starting from existing count + 1
    WHILE squash_count < 4 LOOP
      INSERT INTO public.courts (id, sport_id, name, is_active)
      VALUES (
        gen_random_uuid(), 
        squash_sport_id, 
        'Squash Court ' || (squash_count + 1), 
        true
      );
      squash_count := squash_count + 1;
    END LOOP;
  END IF;
END $$;

