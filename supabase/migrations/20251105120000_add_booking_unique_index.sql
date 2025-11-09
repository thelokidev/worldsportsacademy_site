-- Migration: Add partial unique index to prevent double-booking the same slot
-- Ensures only one active (pending/confirmed) booking per court per start_time

CREATE UNIQUE INDEX IF NOT EXISTS uniq_bookings_court_start_active
ON public.bookings (court_id, start_time)
WHERE status IN ('pending', 'confirmed');

-- Helpful supporting index for availability queries by court and time range
CREATE INDEX IF NOT EXISTS idx_bookings_court_time_range
ON public.bookings (court_id, start_time, end_time)
WHERE status IN ('pending', 'confirmed');