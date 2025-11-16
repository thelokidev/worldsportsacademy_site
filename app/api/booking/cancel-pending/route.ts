import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'
import { logPaymentError } from '@/lib/logger'

/**
 * Cancel all pending bookings for the authenticated user
 * This is called when a user cancels payment in Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { bookingId?: string } = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }
    const bookingId = body.bookingId

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    let query = supabase
      .from('bookings')
      .select('id, status, created_at, payment_intent_id')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (bookingId) {
      query = query.eq('id', bookingId)
    } else {
      query = query.gte('created_at', thirtyMinutesAgo)
    }

    const { data: bookings, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching pending bookings:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch pending bookings' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        success: true,
        cancelled: 0,
        message: 'No pending bookings to cancel',
      })
    }

    const stripe = getStripeClient()

    for (const booking of bookings) {
      if (booking.payment_intent_id) {
        try {
          await stripe.paymentIntents.cancel(booking.payment_intent_id)
        } catch (stripeError) {
          logPaymentError('Failed to cancel payment intent', stripeError, {
            bookingId: booking.id,
            paymentIntentId: booking.payment_intent_id,
          })
        }
      }
    }

    const bookingIds = bookings.map((b) => b.id)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', payment_status: 'failed' })
      .in('id', bookingIds)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (updateError) {
      console.error('Error cancelling bookings:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel pending bookings' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      cancelled: bookings.length,
      message: `Cancelled ${bookings.length} pending booking(s)`,
    })
  } catch (error) {
    console.error('Cancel pending bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


