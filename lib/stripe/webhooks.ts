import { getStripeClient } from './client'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function handleStripeWebhook(
  event: Stripe.Event,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  const stripe = getStripeClient()

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      JSON.stringify(event),
      signature,
      webhookSecret
    ) as Stripe.Event
  } catch (err) {
    const error = err as Error
    throw new Error(`Webhook signature verification failed: ${error.message}`)
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
      break

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase)
      break

    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase)
      break

    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase)
      break

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return { received: true }
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id

  if (!priceId) {
    throw new Error('No price ID found in subscription')
  }

  // Get user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    throw new Error(`User not found for customer ${customerId}`)
  }

  // Get membership plan by Stripe price ID
  const { data: plan } = await supabase
    .from('membership_plans')
    .select('id')
    .eq('stripe_price_id', priceId)
    .single()

  if (!plan) {
    throw new Error(`Membership plan not found for price ${priceId}`)
  }

  // Create or update membership
  const { data: membership, error } = await supabase
    .from('memberships')
    .upsert({
      user_id: profile.id,
      plan_id: plan.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    }, {
      onConflict: 'stripe_subscription_id',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create membership: ${error.message}`)
  }

  return membership
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { error } = await supabase
    .from('memberships')
    .update({
      status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    throw new Error(`Failed to update membership: ${error.message}`)
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { error } = await supabase
    .from('memberships')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    throw new Error(`Failed to cancel membership: ${error.message}`)
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const subscriptionId = invoice.subscription as string | null
  const customerId = invoice.customer as string

  if (!subscriptionId) {
    // This might be a one-time payment (drop-in)
    return
  }

  // Update membership period if needed
  const stripe = getStripeClient()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  await supabase
    .from('memberships')
    .update({
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  // Create payment record
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (membership) {
      await supabase
        .from('payments')
        .insert({
          user_id: profile.id,
          membership_id: membership.id,
          stripe_payment_intent_id: invoice.payment_intent as string | null,
          amount: (invoice.amount_paid || 0) / 100, // Convert from cents
          currency: invoice.currency,
          status: 'succeeded',
          payment_type: 'membership',
        })
    }
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const subscriptionId = invoice.subscription as string | null

  if (!subscriptionId) {
    return
  }

  // Update membership status to past_due
  await supabase
    .from('memberships')
    .update({
      status: 'past_due',
    })
    .eq('stripe_subscription_id', subscriptionId)

  // TODO: Send notification to user about failed payment
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const customerId = session.customer as string
  const metadata = session.metadata || {}

  // Handle drop-in payment completion
  if (metadata.payment_type === 'drop_in' && session.payment_intent && metadata.booking_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profile) {
      // Create payment record
      const { data: payment } = await supabase
        .from('payments')
        .insert({
          user_id: profile.id,
          booking_id: metadata.booking_id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
          status: 'succeeded',
          payment_type: 'drop_in',
          metadata: metadata as Record<string, unknown>,
        })
        .select()
        .single()

      // Update booking to confirmed
      if (payment) {
        await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_id: payment.id,
            payment_status: 'paid',
          })
          .eq('id', metadata.booking_id)
      }
    }
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const customerId = paymentIntent.customer as string

  if (!customerId) {
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    // Update payment status if it exists
    await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_charge_id: paymentIntent.latest_charge as string | null,
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const customerId = paymentIntent.customer as string

  if (!customerId) {
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: 'failed',
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }
}

