import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SOCIAL_OPEN_PLAY_DAYS = [1, 3, 5] // Monday, Wednesday, Friday (0=Sun, 1=Mon, ..., 6=Sat)
const MAX_PARTICIPANTS = 20

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bookingDate } = body as { bookingDate?: string }

    if (!bookingDate || typeof bookingDate !== 'string') {
      return NextResponse.json(
        { error: 'bookingDate (YYYY-MM-DD) is required' },
        { status: 400 }
      )
    }

    const date = new Date(bookingDate + 'T12:00:00')
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    if (!SOCIAL_OPEN_PLAY_DAYS.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: 'Table Tennis Social Open Play is only on Monday, Wednesday, and Friday.' },
        { status: 400 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    if (date < today) {
      return NextResponse.json(
        { error: 'Booking date must be in the future.' },
        { status: 400 }
      )
    }

    // Get table tennis sport id
    const { data: ttSport, error: sportError } = await supabase
      .from('sports')
      .select('id')
      .eq('name', 'table-tennis')
      .limit(1)
      .maybeSingle()

    if (sportError || !ttSport) {
      return NextResponse.json(
        { error: 'Table Tennis sport not found.' },
        { status: 404 }
      )
    }

    const { data: socialPlay, error: socialError } = await supabase
      .from('social_open_play')
      .select('id, sport_id, max_participants')
      .eq('sport_id', ttSport.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (socialError || !socialPlay) {
      return NextResponse.json(
        { error: 'Social Open Play session not available.' },
        { status: 404 }
      )
    }

    const maxParticipants = socialPlay.max_participants ?? MAX_PARTICIPANTS

    // Enforce capacity: count paid (or pending) bookings for this date
    const { count, error: countError } = await supabase
      .from('social_open_play_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('social_play_id', socialPlay.id)
      .eq('booking_date', bookingDate)
      .in('payment_status', ['pending', 'paid'])

    if (countError) {
      return NextResponse.json(
        { error: 'Could not check availability.' },
        { status: 500 }
      )
    }
    if ((count ?? 0) >= maxParticipants) {
      return NextResponse.json(
        { error: 'This session is full.' },
        { status: 400 }
      )
    }

    // Check user doesn't already have a booking for this date
    const { data: existing } = await supabase
      .from('social_open_play_bookings')
      .select('id')
      .eq('social_play_id', socialPlay.id)
      .eq('user_id', user.id)
      .eq('booking_date', bookingDate)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a booking for this date.' },
        { status: 400 }
      )
    }

    const { data: booking, error } = await supabase
      .from('social_open_play_bookings')
      .insert({
        social_play_id: socialPlay.id,
        user_id: user.id,
        booking_date: bookingDate,
        payment_status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ socialOpenPlayBookingId: booking.id })
  } catch (err) {
    console.error('create-pending-social-open-play error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
