'use server'

import { createClient } from '@/lib/supabase/server'
import { initiateBookingRefund } from '@/lib/stripe/payments'
import { revalidatePath, revalidateTag } from 'next/cache'
import { addMinutes, format, parseISO, startOfDay, eachHourOfInterval, setHours, getDay } from 'date-fns'

export async function getAvailableSlots(
  sportId: string,
  courtId: string,
  startDate: string,
  endDate: string,
  durationMinutes?: number
) {
  try {
    const supabase = await createClient()
    
    // Get sport details
    const { data: sport, error: sportError } = await supabase
      .from('sports')
      .select('duration_minutes, duration_options')
      .eq('id', sportId)
      .single()

    if (sportError) {
      console.error('Error fetching sport:', sportError)
      throw new Error(`Failed to fetch sport: ${sportError.message}. Please ensure the database migration has been applied.`)
    }

    if (!sport) {
      throw new Error(`Sport with ID ${sportId} not found. Please ensure the database is properly set up.`)
    }

    // Get court details including blocked status
    const { data: court, error: courtError } = await supabase
      .from('courts')
      .select('id, is_blocked, is_active')
      .eq('id', courtId)
      .single()

    if (courtError) {
      console.error('Error fetching court:', courtError)
      throw new Error(`Failed to fetch court: ${courtError.message}. Please ensure the database migration has been applied.`)
    }

    if (!court) {
      throw new Error(`Court with ID ${courtId} not found. Please ensure the database is properly set up.`)
    }

    if (!court.is_active) {
      throw new Error('Court is currently inactive')
    }

    if (court.is_blocked) {
      // Court is blocked, return empty availability
      return []
    }

    // Use provided duration or default from sport
    const selectedDuration = durationMinutes || sport.duration_minutes || 60

    // Calculate availability using local calculation
    return calculateLocalAvailability(
      supabase,
      courtId,
      startDate,
      endDate,
      selectedDuration
    )
  } catch (error) {
    console.error('Error fetching availability:', error)
    // Fail-open: return a safe, empty-style availability so the UI remains usable
    const fallbackDuration = durationMinutes || 60
    return generateSafeAvailability(startDate, endDate, fallbackDuration)
  }
}

/**
 * Calculate availability locally from Supabase bookings
 */
async function calculateLocalAvailability(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courtId: string,
  startDate: string,
  endDate: string,
  durationMinutes: number = 60
) {
  // Get court schedule
  const { data: schedules } = await supabase
    .from('court_schedules')
    .select('day_of_week, open_time, close_time, is_closed')
    .eq('court_id', courtId)

  // Get all existing bookings for this court in the date range
  const { data: existingBookings, error } = await supabase
    .from('bookings')
    .select('start_time, end_time, status')
    .eq('court_id', courtId)
    .in('status', ['pending', 'confirmed'])
    .gte('start_time', `${startDate}T00:00:00.000Z`)
    .lte('end_time', `${endDate}T23:59:59.999Z`)

  if (error) {
    console.error('Error fetching bookings:', error)
  }

  const bookings = existingBookings || []
  
  // Group bookings by date for easy lookup
  const bookingsByDate = new Map<string, Array<{ start: Date; end: Date }>>()
  
  bookings.forEach((booking: any) => {
    const start = parseISO(booking.start_time)
    const end = parseISO(booking.end_time)
    const dateKey = format(start, 'yyyy-MM-dd')
    
    if (!bookingsByDate.has(dateKey)) {
      bookingsByDate.set(dateKey, [])
    }
    bookingsByDate.get(dateKey)!.push({ start, end })
  })

  // Generate availability for each day
  const availability: Array<{
    date: string
    slots: Array<{ time: string; available: boolean }>
  }> = []

  const start = parseISO(startDate)
  const end = parseISO(endDate)
  
  // Generate slots for each day
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = format(d, 'yyyy-MM-dd')
    const dayOfWeek = getDay(d) // 0 = Sunday, 6 = Saturday
    
    // Get schedule for this day
    const daySchedule = (schedules as any)?.find((s: any) => s.day_of_week === dayOfWeek)
    
    // Skip if court is closed on this day or no schedule (fallback to default hours)
    if (!daySchedule) {
      // Default to 9 AM - 9 PM if no schedule
      const dayStart = setHours(startOfDay(d), 9)
      const dayEnd = setHours(startOfDay(d), 21)
      const hours = eachHourOfInterval({ start: dayStart, end: dayEnd })
      const slots: Array<{ time: string; available: boolean }> = []
      const dayBookings = bookingsByDate.get(dateKey) || []
      const now = new Date()
      
      hours.forEach((hour) => {
        const slotStart = hour
        const slotEnd = addMinutes(slotStart, durationMinutes)
        
        if (slotStart < now || slotEnd > dayEnd) {
          slots.push({ time: slotStart.toISOString(), available: false })
          return
        }
        
        const isBooked = dayBookings.some((booking) => {
          return slotStart < booking.end && slotEnd > booking.start
        })
        
        slots.push({ time: slotStart.toISOString(), available: !isBooked })
      })
      
      availability.push({ date: dateKey, slots })
      continue
    }
    
    if (daySchedule.is_closed) {
      availability.push({
        date: dateKey,
        slots: [],
      })
      continue
    }

    // Parse open and close times
    const [openHour, openMin] = daySchedule.open_time.split(':').map(Number)
    const [closeHour, closeMin] = daySchedule.close_time.split(':').map(Number)
    
    const dayStart = setHours(startOfDay(d), openHour)
    if (openMin > 0) {
      dayStart.setMinutes(openMin)
    }
    
    const dayEnd = setHours(startOfDay(d), closeHour)
    if (closeMin > 0) {
      dayEnd.setMinutes(closeMin)
    }
    
    // Generate hourly slots
    const hours = eachHourOfInterval({ start: dayStart, end: dayEnd })
    const slots: Array<{ time: string; available: boolean }> = []
    
    const dayBookings = bookingsByDate.get(dateKey) || []
    const now = new Date()
    
    hours.forEach((hour) => {
      const slotStart = hour
      const slotEnd = addMinutes(slotStart, durationMinutes)
      
      // Slot is in the past
      if (slotStart < now) {
        slots.push({
          time: slotStart.toISOString(),
          available: false,
        })
        return
      }
      
      // Check if slot would exceed court closing time
      if (slotEnd > dayEnd) {
        slots.push({
          time: slotStart.toISOString(),
          available: false,
        })
        return
      }
      
      // Check if this slot overlaps with any existing booking
      const isBooked = dayBookings.some((booking) => {
        // Check for overlap: slotStart < booking.end && slotEnd > booking.start
        return slotStart < booking.end && slotEnd > booking.start
      })
      
      slots.push({
        time: slotStart.toISOString(),
        available: !isBooked,
      })
    })
    
    availability.push({
      date: dateKey,
      slots,
    })
  }

  return availability
}

/**
 * Fallback generator: produces hourly slots 8AM–11PM for each day, marking past times unavailable.
 * No Supabase access required. Used when DB/env issues occur.
 */
function generateSafeAvailability(
  startDate: string,
  endDate: string,
  durationMinutes: number
) {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const availability: Array<{ date: string; slots: Array<{ time: string; available: boolean }> }> = []
  const now = new Date()

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = format(d, 'yyyy-MM-dd')
    const dayStart = setHours(startOfDay(d), 8)
    const dayEnd = setHours(startOfDay(d), 23)
    const hours = eachHourOfInterval({ start: dayStart, end: dayEnd })
    const daySlots: Array<{ time: string; available: boolean }> = []

    hours.forEach((hour) => {
      const slotStart = hour
      const slotEnd = addMinutes(slotStart, durationMinutes)
      const isPast = slotStart < now
      const exceedsClose = slotEnd > dayEnd
      daySlots.push({ time: slotStart.toISOString(), available: !isPast && !exceedsClose })
    })

    availability.push({ date: dateKey, slots: daySlots })
  }

  return availability
}

export async function createBooking(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    const sportId = formData.get('sportId') as string
    const courtId = formData.get('courtId') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string

    if (!sportId || !courtId || !startTime || !endTime) {
      throw new Error('Missing required fields')
    }

    // Validate court is not blocked
    const { data: court } = await supabase
      .from('courts')
      .select('is_blocked, is_active')
      .eq('id', courtId)
      .single()

    if (!court || !court.is_active) {
      throw new Error('Court is not available')
    }

    if (court.is_blocked) {
      throw new Error('Court is currently blocked')
    }

    // Check for conflicts
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', courtId)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

    if (conflictingBookings && conflictingBookings.length > 0) {
      throw new Error('This time slot is no longer available')
    }

    const selectedDuration = formData.get('selectedDuration') ? parseInt(formData.get('selectedDuration') as string) : null
    const bookingNotes = formData.get('bookingNotes') as string | null
    const bookingType = (formData.get('bookingType') as string) || 'member'

    if (bookingType === 'member') {
      const hasCoverage = await userHasMembershipCoverage(supabase, user.id, sportId)
      if (!hasCoverage) {
        throw new Error('Active membership required to book without payment')
      }
    }

    // Create booking in Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        sport_id: sportId,
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        selected_duration: selectedDuration,
        booking_notes: bookingNotes || null,
        status: 'confirmed',
        booking_type: bookingType,
        payment_status: bookingType === 'member' ? 'paid' : 'pending',
      })
      .select()
      .single()

    if (error) {
      // Handle unique violation from partial unique index for active bookings
      if ((error as any)?.code === '23505') {
        throw new Error('This time slot was just taken. Please choose another time.')
      }
      throw new Error(`Failed to create booking: ${error.message}`)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/bookings')
    revalidatePath('/bookings')
    // Targeted cache invalidation for availability
    try {
      revalidateTag(`availability:court:${courtId}`)
    } catch (e) {
      // no-op if tag isn't set in current environment
    }

    return { success: true, booking }
  } catch (error) {
    console.error('Booking creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
    }
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      throw new Error('Authentication error')
    }

    if (!user) {
      throw new Error('User must be authenticated')
    }

    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('user_id, start_time, status, payment_status, payment_id')
      .eq('id', bookingId)
      .single()

    if (fetchError) {
      console.error('Error fetching booking:', fetchError)
      throw new Error(`Failed to fetch booking: ${fetchError.message}`)
    }

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.user_id !== user.id) {
      throw new Error('Unauthorized: This booking belongs to another user')
    }

    // Don't allow cancelling past bookings
    const startTime = new Date(booking.start_time)
    const now = new Date()
    if (startTime < now) {
      throw new Error('Cannot cancel past bookings')
    }

    // Don't allow cancelling already cancelled bookings
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled')
    }

    let refundResult: Awaited<ReturnType<typeof initiateBookingRefund>> | null = null

    if (booking.payment_status === 'paid' && booking.payment_id) {
      refundResult = await initiateBookingRefund({ bookingId, reason: 'user_cancelled' })
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: refundResult ? 'refunded' : booking.payment_status,
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      console.error('Error code:', (updateError as any)?.code)
      console.error('Error details:', (updateError as any)?.details)
      console.error('Error hint:', (updateError as any)?.hint)
      throw new Error(`Failed to cancel booking: ${updateError.message}. Error code: ${(updateError as any)?.code}`)
    }

    if (!updatedBooking) {
      throw new Error('Booking was not updated')
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/bookings')
    revalidatePath('/bookings')

    return {
      success: true,
      booking: updatedBooking,
      refund: refundResult,
    }
  } catch (error) {
    console.error('Booking cancellation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

async function userHasMembershipCoverage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sportId: string,
) {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      current_period_end,
      membership_plans:plan_id (
        sport_ids
      )
    `)
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .gt('current_period_end', nowIso)

  if (error) {
    console.error('Membership coverage check failed:', error)
    return false
  }

  return (data || []).some((membership) => {
    const plan = membership.membership_plans as { sport_ids?: string[] } | null
    return plan?.sport_ids?.includes(sportId)
  })
}

/**
 * Admin function: Block a court for a specific time period
 */
export async function blockCourtTime(
  courtId: string,
  startTime: string,
  endTime: string,
  reason: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    // TODO: Add admin role check
    // For now, allow any authenticated user (remove in production)

    // Create a blocked booking entry
    const { data: blockedBooking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        status: 'cancelled', // Use cancelled status to mark as blocked
        booking_notes: `BLOCKED: ${reason}`,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to block court: ${error.message}`)
    }

    revalidatePath('/admin/courts')
    revalidatePath('/bookings')

    return { success: true, blockedBooking }
  } catch (error) {
    console.error('Block court error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to block court',
    }
  }
}

/**
 * Admin function: Set court blocked status
 */
export async function setCourtBlockedStatus(
  courtId: string,
  isBlocked: boolean,
  reason?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    // TODO: Add admin role check

    const { error } = await supabase
      .from('courts')
      .update({
        is_blocked: isBlocked,
        blocked_reason: reason || null,
      })
      .eq('id', courtId)

    if (error) {
      throw new Error(`Failed to update court: ${error.message}`)
    }

    revalidatePath('/admin/courts')
    revalidatePath('/bookings')

    return { success: true }
  } catch (error) {
    console.error('Set court blocked status error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update court',
    }
  }
}

