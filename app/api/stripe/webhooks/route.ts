import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripeClient } from '@/lib/stripe/client'
import { handleStripeWebhook } from '@/lib/stripe/webhooks'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

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

    // Verify and construct event
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      const error = err as Error
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    await handleStripeWebhook(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

