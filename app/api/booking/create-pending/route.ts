import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { sportId, courtId, startTime, endTime, durationMinutes, participantsCount = 2 } = body

    if (!sportId || !courtId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate participants count
    const participants = Math.min(2, Math.max(1, Number(participantsCount) || 2))

    // Validate court is available AND belongs to the correct sport
    const { data: court } = await supabase
      .from('courts')
      .select('is_blocked, is_active, sport_id')
      .eq('id', courtId)
      .single()

    if (!court || !court.is_active) {
      return NextResponse.json(
        { error: 'Court is not available' },
        { status: 400 }
      )
    }

    // Ensure court belongs to the selected sport
    if (court.sport_id !== sportId) {
      return NextResponse.json(
        { error: 'This court is not available for the selected sport' },
        { status: 400 }
      )
    }

    if (court.is_blocked) {
      return NextResponse.json(
        { error: 'Court is currently blocked' },
        { status: 400 }
      )
    }

    // Check capacity - get all overlapping bookings and sum participants
    const { data: overlappingBookings } = await supabase
      .from('bookings')
      .select('id, participants_count')
      .eq('court_id', courtId)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

    const COURT_CAPACITY = 2
    const currentParticipants = (overlappingBookings || []).reduce(
      (sum: number, b: any) => sum + (b.participants_count || 2), 0
    )
    const availableSlots = COURT_CAPACITY - currentParticipants

    if (participants > availableSlots) {
      if (availableSlots === 0) {
        return NextResponse.json(
          { error: 'This time slot is no longer available' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: `Only ${availableSlots} spot${availableSlots === 1 ? '' : 's'} available for this time slot` },
        { status: 400 }
      )
    }

    // Check if user already has a booking on any court during this time period
    const { data: userConflictingBookings } = await supabase
      .from('bookings')
      .select('id, court_id, start_time, end_time')
      .eq('user_id', user.id)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

    if (userConflictingBookings && userConflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'You already have a booking during this time. Please choose a different time slot.' },
        { status: 400 }
      )
    }

    // Create pending booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        sport_id: sportId,
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        selected_duration: durationMinutes || null,
        status: 'pending',
        booking_type: 'drop_in',
        payment_status: 'pending',
        participants_count: participants,
      })
      .select()
      .single()

    if (error) {
      if ((error as any)?.code === '23505') {
        return NextResponse.json(
          { error: 'This time slot was just taken. Please choose another time.' },
          { status: 400 }
        )
      }
      throw new Error(`Failed to create booking: ${error.message}`)
    }

    return NextResponse.json({ bookingId: booking.id })
  } catch (error) {
    console.error('Create pending booking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create pending booking' },
      { status: 500 }
    )
  }
}

