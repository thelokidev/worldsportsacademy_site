import { NextRequest, NextResponse } from 'next/server'

import { logPaymentError } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { createBookingPaymentIntent, ensureStripeCustomer } from '@/lib/stripe/payments'

export async function POST(req: NextRequest) {
  let user: { id: string; email?: string | null } | null = null
  let bookingId: string | undefined = undefined
  let body: { bookingId?: string } | undefined = undefined
  
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    user = authUser
    body = await req.json()
    bookingId = body.bookingId

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, stripe_customer_id')
      .eq('id', authUser.id)
      .maybeSingle()

    const customerId = await ensureStripeCustomer({
      userId: authUser.id,
      email: authUser.email,
      fullName: profile?.full_name || (authUser.user_metadata?.full_name as string | undefined),
      existingCustomerId: profile?.stripe_customer_id,
    })

    const intent = await createBookingPaymentIntent({
      bookingId,
      customerId,
      receiptEmail: authUser.email,
    })

    return NextResponse.json({
      clientSecret: intent.clientSecret,
      paymentIntentId: intent.paymentIntentId,
      amount: intent.amount,
      currency: intent.currency,
    })
  } catch (error) {
    logPaymentError('Create payment intent error', error)
    
    // Provide more detailed error messages
    let message = 'Failed to initialize payment'
    let statusCode = 500
    
    if (error instanceof Error) {
      message = error.message
      
      // Check for specific error types
      if (error.message.includes('pricing') || error.message.includes('not configured')) {
        statusCode = 400
      } else if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
        statusCode = 404
      } else if (error.message.includes('API key') || error.message.includes('Stripe')) {
        statusCode = 500
      }
    }
    
    console.error('Payment intent creation failed:', {
      error: error instanceof Error ? error.message : String(error),
      bookingId: body?.bookingId,
      userId: user?.id,
    })
    
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

