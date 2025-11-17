'use server'

import { getStripeClient } from '@/lib/stripe/client'
import { getServiceSupabaseClient } from '@/lib/supabase/service'

export async function confirmBookingPaymentFromSession(sessionId: string) {
  const stripe = getStripeClient()
  const supabase = getServiceSupabaseClient()

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (!session.metadata?.booking_id) {
    throw new Error('No booking ID attached to checkout session')
  }

  const bookingId = session.metadata.booking_id
  const paymentIntentId = session.payment_intent as string | null

  if (!paymentIntentId) {
    throw new Error('Checkout session is missing payment intent')
  }

  const { data: booking, error: bookingFetchError } = await supabase
    .from('bookings')
    .select('id, user_id, status')
    .eq('id', bookingId)
    .maybeSingle()

  if (bookingFetchError || !booking) {
    throw new Error(`Booking not found for session ${sessionId}`)
  }

  // Ensure payment record exists
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

  // Update booking status
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

