-- Migration: Update booking system schema
-- Remove Cal.com dependencies and add new features

-- Step 1: Add new columns to sports table
ALTER TABLE public.sports
  ADD COLUMN IF NOT EXISTS duration_options JSONB DEFAULT '[30, 60, 90, 120]'::jsonb,
  ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10, 2) DEFAULT 20.00;

-- Step 2: Add new columns to courts table
ALTER TABLE public.courts
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Step 3: Add new columns to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS selected_duration INTEGER,
  ADD COLUMN IF NOT EXISTS booking_notes TEXT;

-- Step 4: Create court_schedules table for managing operating hours
CREATE TABLE IF NOT EXISTS public.court_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(court_id, day_of_week)
);

-- Add indexes for court_schedules
CREATE INDEX IF NOT EXISTS idx_court_schedules_court_id ON public.court_schedules(court_id);
CREATE INDEX IF NOT EXISTS idx_court_schedules_day_of_week ON public.court_schedules(day_of_week);

-- Step 5: Remove Cal.com related columns (if they exist)
ALTER TABLE public.sports DROP COLUMN IF EXISTS cal_event_type_id;
ALTER TABLE public.courts DROP COLUMN IF EXISTS cal_user_id;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS cal_booking_id;

-- Step 6: Update existing sports with default duration options and pricing
UPDATE public.sports
SET 
  duration_options = '[30, 60, 90, 120]'::jsonb,
  price_per_hour = CASE 
    WHEN name = 'squash' THEN 25.00
    WHEN name = 'table-tennis' THEN 20.00
    WHEN name = 'chess' THEN 15.00
    ELSE 20.00
  END
WHERE duration_options IS NULL OR price_per_hour IS NULL;

-- Step 7: Create default court schedules (9 AM - 9 PM, all days open)
INSERT INTO public.court_schedules (court_id, day_of_week, open_time, close_time, is_closed)
SELECT 
  c.id,
  day_num,
  '09:00:00'::time,
  '21:00:00'::time,
  false
FROM public.courts c
CROSS JOIN generate_series(0, 6) AS day_num
ON CONFLICT (court_id, day_of_week) DO NOTHING;

-- Step 8: Add RLS policies for court_schedules
ALTER TABLE public.court_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Court schedules are viewable by everyone"
  ON public.court_schedules
  FOR SELECT
  USING (true);

-- Step 9: Create updated_at trigger for court_schedules
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_court_schedules_updated_at
  BEFORE UPDATE ON public.court_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
