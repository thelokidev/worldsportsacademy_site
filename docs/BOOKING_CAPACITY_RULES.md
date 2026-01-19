# Booking Capacity Rules

## Court/Table Capacity Enforcement

### Requirements
- **Maximum 2 people per Table Tennis table**
- **Maximum 2 people per Squash court**

### Implementation Notes

The system should enforce these rules at the API level when checking availability and creating bookings.

### API Changes Required

#### 1. Availability Check (`/api/availability`)
- When returning available slots, count existing bookings per court/table
- Only show slots as available if the court has fewer than 2 bookings for that time slot
- Query: `SELECT COUNT(*) FROM bookings WHERE court_id = ? AND start_time = ? AND status = 'confirmed'`
- If count >= 2, mark slot as unavailable

#### 2. Booking Creation (`/api/booking/create-pending`)
- Before creating a pending booking, verify capacity
- Check if the selected court/table has fewer than 2 confirmed bookings for the requested time
- Return error if capacity is exceeded: "This court/table is fully booked for the selected time"

#### 3. UI Display
- Show capacity indicator: "X/2 spots available" for each court/table option
- Disable booking button if capacity is reached
- Display message: "Court fully booked" when capacity is at maximum

### Database Query Example

```sql
-- Check current capacity for a specific court at a specific time
SELECT COUNT(*) as current_bookings
FROM bookings
WHERE court_id = $1
  AND start_time = $2
  AND status IN ('confirmed', 'pending')
  AND end_time > $2;

-- Only allow booking if current_bookings < 2
```

### Edge Cases to Consider

1. **Concurrent Bookings**: Use database transactions or locks to prevent race conditions
2. **Pending vs Confirmed**: Count both pending and confirmed bookings toward capacity
3. **Overlapping Times**: Check for any bookings that overlap with the requested time slot
4. **Cancellations**: When a booking is cancelled, capacity should be freed up immediately

### Future Enhancements

- Allow configurable capacity per court (some courts might allow more or fewer players)
- Show real-time capacity updates using websockets
- Implement waitlist functionality when courts reach capacity
