import { NextRequest, NextResponse } from 'next/server'

import { logPaymentError } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { finalizeBookingPayment } from '@/lib/stripe/payments'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bookingId, paymentIntentId } = body

    if (!bookingId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Booking ID and payment intent ID are required' },
        { status: 400 },
      )
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, user_id')
      .eq('id', bookingId)
      .single()

    if (!booking || booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    await finalizeBookingPayment({
      bookingId,
      paymentIntentId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logPaymentError('Finalize booking payment error', error)
    const message = error instanceof Error ? error.message : 'Failed to finalize payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

