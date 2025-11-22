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
    const { sportId, courtId, startTime, endTime, durationMinutes } = body

    if (!sportId || !courtId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate court is available
    const { data: court } = await supabase
      .from('courts')
      .select('is_blocked, is_active')
      .eq('id', courtId)
      .single()

    if (!court || !court.is_active) {
      return NextResponse.json(
        { error: 'Court is not available' },
        { status: 400 }
      )
    }

    if (court.is_blocked) {
      return NextResponse.json(
        { error: 'Court is currently blocked' },
        { status: 400 }
      )
    }

    // Check for conflicts on the same court
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', courtId)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
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

