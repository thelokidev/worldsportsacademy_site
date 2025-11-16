import { NextRequest, NextResponse } from 'next/server'

import { logPaymentError } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { createBookingPaymentIntent, ensureStripeCustomer } from '@/lib/stripe/payments'

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
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    const customerId = await ensureStripeCustomer({
      userId: user.id,
      email: user.email,
      fullName: profile?.full_name || (user.user_metadata?.full_name as string | undefined),
      existingCustomerId: profile?.stripe_customer_id,
    })

    const intent = await createBookingPaymentIntent({
      bookingId,
      customerId,
      receiptEmail: user.email,
    })

    return NextResponse.json({
      clientSecret: intent.clientSecret,
      paymentIntentId: intent.paymentIntentId,
      amount: intent.amount,
      currency: intent.currency,
    })
  } catch (error) {
    logPaymentError('Create payment intent error', error)
    const message = error instanceof Error ? error.message : 'Failed to initialize payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

