import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'

export async function POST(req: NextRequest) {
  try {
    // Get Stripe client
    let stripe
    try {
      stripe = getStripeClient()
    } catch (stripeError) {
      console.error('Stripe configuration error:', stripeError)
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session.metadata?.booking_id) {
      return NextResponse.json(
        { error: 'No booking ID in session metadata' },
        { status: 400 }
      )
    }

    const bookingId = session.metadata.booking_id

    // Get payment intent
    const paymentIntentId = session.payment_intent as string | null

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'No payment intent found' },
        { status: 400 }
      )
    }

    // Get or create payment record
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    let paymentId = existingPayment?.id

    if (!paymentId) {
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          booking_id: bookingId,
          stripe_payment_intent_id: paymentIntentId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
          status: 'succeeded',
          payment_type: 'drop_in',
        })
        .select()
        .single()

      if (paymentError) {
        throw new Error(`Failed to create payment: ${paymentError.message}`)
      }

      paymentId = payment.id
    }

    // Update booking to confirmed
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_id: paymentId,
        payment_status: 'paid',
      })
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (bookingError) {
      throw new Error(`Failed to confirm booking: ${bookingError.message}`)
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}

