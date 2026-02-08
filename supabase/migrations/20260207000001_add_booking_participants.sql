-- Migration: Add participants_count to bookings table
-- This enables the shared capacity model where each court/table has a capacity of 2 slots.

-- Add participants_count column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS participants_count INTEGER DEFAULT 1;

-- Add constraint to ensure participants_count is between 1 and 2
ALTER TABLE public.bookings
ADD CONSTRAINT chk_participants_count CHECK (
    participants_count BETWEEN 1 AND 2
);

-- Update existing bookings to have participants_count = 2 (full court)
-- This maintains backward compatibility for existing bookings.
UPDATE public.bookings
SET
    participants_count = 2
WHERE
    participants_count IS NULL
    OR participants_count = 0;

-- Add index for efficient capacity queries
CREATE INDEX IF NOT EXISTS idx_bookings_participants_count ON public.bookings (participants_count);

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.participants_count IS 'Number of slots booked (1 = Open Play, 2 = Full Court/Table)';