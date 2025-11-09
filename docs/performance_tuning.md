## Supabase/Postgres performance tips for availability and booking

These indexes speed up the queries used by availability calculation and booking creation.

Run these in your Supabase SQL editor (adjust names if your schema differs).

```sql
-- Speed up availability lookups by court and time window
CREATE INDEX IF NOT EXISTS idx_bookings_active_court_time
  ON bookings (court_id, start_time, end_time)
  WHERE status IN ('pending','confirmed');

-- If you also filter by status explicitly elsewhere:
CREATE INDEX IF NOT EXISTS idx_bookings_court_status_time
  ON bookings (court_id, status, start_time, end_time);

-- Speed up court schedule lookups
CREATE INDEX IF NOT EXISTS idx_court_schedules_court_day
  ON court_schedules (court_id, day_of_week);
```

Notes:
- The partial index `idx_bookings_active_court_time` matches the availability query that only considers `pending` and `confirmed` bookings within a date range.
- Keep both `start_time` and `end_time` as timestamptz and store in UTC.
- After adding indexes, analyze tables for best plans:

```sql
ANALYZE bookings;
ANALYZE court_schedules;
```


