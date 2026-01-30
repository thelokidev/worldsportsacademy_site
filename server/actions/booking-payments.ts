'use server'

import { getStripeClient } from '@/lib/stripe/client'
import { getServiceSupabaseClient } from '@/lib/supabase/service'

export async function confirmBookingPaymentFromSession(sessionId: string) {
  const stripe = getStripeClient()
  const supabase = getServiceSupabaseClient()

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const metadata = session.metadata || {}
  const paymentType = metadata.payment_type as string | undefined
  const paymentIntentId = session.payment_intent as string | null

  if (!paymentIntentId) {
    throw new Error('Checkout session is missing payment intent')
  }

  if (paymentType === 'social_open_play') {
    const socialOpenPlayBookingId = metadata.social_open_play_booking_id as string | undefined
    if (!socialOpenPlayBookingId) {
      throw new Error('No Social Open Play booking ID in session')
    }

    const amountPaid = session.amount_total != null ? session.amount_total / 100 : 15

    const { data: sopBooking, error: updateError } = await supabase
      .from('social_open_play_bookings')
      .update({
        payment_status: 'paid',
        payment_intent_id: paymentIntentId,
        amount_paid: amountPaid,
      })
      .eq('id', socialOpenPlayBookingId)
      .select('id, booking_date')
      .single()

    if (updateError || !sopBooking) {
      throw new Error(`Failed to confirm Social Open Play booking: ${updateError?.message}`)
    }

    return {
      type: 'social_open_play' as const,
      booking_date: sopBooking.booking_date,
    }
  }

  if (!metadata.booking_id) {
    throw new Error('No booking ID attached to checkout session')
  }

  const bookingId = metadata.booking_id

  const { data: booking, error: bookingFetchError } = await supabase
    .from('bookings')
    .select('id, user_id, status')
    .eq('id', bookingId)
    .maybeSingle()

  if (bookingFetchError || !booking) {
    throw new Error(`Booking not found for session ${sessionId}`)
  }

  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  let paymentId = existingPayment?.id

  if (!paymentId) {
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: booking.user_id,
        booking_id: booking.id,
        stripe_payment_intent_id: paymentIntentId,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        status: 'succeeded',
        payment_type: 'drop_in',
      })
      .select()
      .single()

    if (paymentError || !payment) {
      throw new Error(`Failed to create payment record: ${paymentError?.message}`)
    }

    paymentId = payment.id
  }

  const { data: updatedBooking, error: bookingUpdateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_id: paymentId,
      payment_status: 'paid',
    })
    .eq('id', bookingId)
    .select(`
      *,
      sports : sport_id (
        id,
        name,
        display_name
      ),
      courts : court_id (
        id,
        name
      )
    `)
    .single()

  if (bookingUpdateError || !updatedBooking) {
    throw new Error(`Failed to confirm booking: ${bookingUpdateError?.message}`)
  }

  return updatedBooking
}

