import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripeClient } from '@/lib/stripe/client'
import { handleStripeWebhook } from '@/lib/stripe/webhooks'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let eventType = 'unknown'
  let eventId = 'unknown'
  
  try {
    console.log('[webhook:api] Webhook request received')
    
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('[webhook:api] ERROR: No signature in request headers')
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('[webhook:api] ERROR: STRIPE_WEBHOOK_SECRET not configured in environment')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify service role key is also set (required for webhook handler)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[webhook:api] ERROR: SUPABASE_SERVICE_ROLE_KEY not configured in environment')
      return NextResponse.json(
        { error: 'Database service key not configured' },
        { status: 500 }
      )
    }

    // Get Stripe client
    let stripe
    try {
      stripe = getStripeClient()
    } catch (stripeError) {
      console.error('[webhook:api] ERROR: Stripe client initialization failed:', stripeError)
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      )
    }

    // Verify and construct event
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
      eventType = event.type
      eventId = event.id
      console.log('[webhook:api] Event verified', {
        type: eventType,
        id: eventId,
      })
    } catch (err) {
      const error = err as Error
      console.error('[webhook:api] ERROR: Signature verification failed:', error.message)
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    console.log('[webhook:api] Calling webhook handler for', eventType)
    await handleStripeWebhook(event)
    
    const duration = Date.now() - startTime
    console.log('[webhook:api] SUCCESS', {
      type: eventType,
      id: eventId,
      duration: `${duration}ms`,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[webhook:api] ERROR: Handler failed', {
      type: eventType,
      id: eventId,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

