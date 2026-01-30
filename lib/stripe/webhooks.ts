import Stripe from 'stripe'

import { logPaymentError } from '@/lib/logger'
import { getServiceSupabaseClient } from '@/lib/supabase/service'
import { finalizeBookingPayment, handlePaymentFailure, recordPaymentEvent } from '@/lib/stripe/payments'
import { getStripeClient } from './client'
import { ensurePlanForPriceId } from '@/lib/stripe/membership-plans'
import { getOptionalStripeDate, getPeriodBounds } from '@/lib/stripe/subscription-period'

export async function handleStripeWebhook(
  event: Stripe.Event
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  const stripe = getStripeClient()
  const supabase = getServiceSupabaseClient()

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
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
        event.id,
        supabase,
      )
      break

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent,
        event.id,
        supabase,
      )
      break

    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge, event.id)
      break

    case 'refund.updated':
      await handleRefundUpdated(event.data.object as Stripe.Refund, event.id)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return { received: true }
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceSupabaseClient>
) {
  console.log('[webhook:subscription.created] START', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id,
  })

  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id

  if (!priceId) {
    console.error('[webhook:subscription.created] ERROR: No price ID', {
      subscriptionId: subscription.id,
      items: subscription.items.data.length,
    })
    throw new Error('No price ID found in subscription')
  }

  // Get user by Stripe customer ID
  console.log('[webhook:subscription.created] Looking up profile', { customerId })
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, stripe_customer_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (!profile) {
    console.error('[webhook:subscription.created] ERROR: Profile not found', {
      customerId,
      subscriptionId: subscription.id,
      profileError: profileError?.message,
    })

    // Fallback: Try to find user by email from Stripe customer
    const stripe = getStripeClient()
    try {
      const stripeCustomer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      const customerEmail = stripeCustomer.email

      if (customerEmail) {
        console.log('[webhook:subscription.created] Trying email fallback', { customerEmail })
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
        const foundUser = authUser?.users?.find(u => u.email === customerEmail)

        if (foundUser) {
          console.log('[webhook:subscription.created] Found user by email, updating profile', {
            userId: foundUser.id,
            customerEmail,
          })

          // Update profile with customer_id
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: foundUser.id,
              stripe_customer_id: customerId,
              email: customerEmail
            }, { onConflict: 'id' })

          if (updateError) {
            console.error('[webhook:subscription.created] ERROR: Failed to update profile', {
              userId: foundUser.id,
              error: updateError.message,
            })
          }

          // Re-fetch profile
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', foundUser.id)
            .single()

          if (!updatedProfile) {
            throw new Error(`User not found for customer ${customerId} even after update`)
          }

          // Continue with updated profile
          return await createMembershipRecord(subscription, updatedProfile.id, customerId, priceId, supabase)
        }
      }
    } catch (fallbackError) {
      console.error('[webhook:subscription.created] Email fallback failed', {
        error: fallbackError instanceof Error ? fallbackError.message : 'Unknown',
      })
    }

    throw new Error(`User not found for customer ${customerId}`)
  }

  console.log('[webhook:subscription.created] Profile found', {
    userId: profile.id,
    email: profile.email,
  })

  return await createMembershipRecord(subscription, profile.id, customerId, priceId, supabase)
}

async function createMembershipRecord(
  subscription: Stripe.Subscription,
  userId: string,
  customerId: string,
  priceId: string,
  supabase: ReturnType<typeof getServiceSupabaseClient>
) {
  console.log('[webhook:membership] Looking up plan', { priceId })
  const plan = await ensurePlanForPriceId(supabase, priceId)

  if (!plan) {
    console.error('[webhook:membership] ERROR: Plan not found even after fallback', {
      priceId,
      subscriptionId: subscription.id,
      customerId,
    })
    throw new Error(`Membership plan not found for price ${priceId}`)
  }

  console.log('[webhook:membership] Plan found', {
    planId: plan.id,
    planName: plan.name,
  })

  const period = getPeriodBounds(subscription)

  // Map Stripe subscription status to our membership status
  let membershipStatus: string
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    membershipStatus = 'active'
  } else if (subscription.status === 'incomplete') {
    // Treat incomplete as active initially - will be updated by invoice.payment_succeeded
    membershipStatus = 'active'
    console.log('[webhook:membership] Subscription is incomplete, treating as active pending payment')
  } else {
    membershipStatus = subscription.status
  }

  const payload = {
    user_id: userId,
    plan_id: plan.id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    status: membershipStatus,
    current_period_start: period.start,
    current_period_end: period.end,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    canceled_at: getOptionalStripeDate(subscription.canceled_at),
    trial_start: getOptionalStripeDate(subscription.trial_start),
    trial_end: getOptionalStripeDate(subscription.trial_end),
  }

  console.log('[webhook:membership] Upserting membership', {
    payload,
  })

  const { data: membership, error } = await supabase
    .from('memberships')
    .upsert(payload, {
      onConflict: 'stripe_subscription_id',
    })
    .select()
    .single()

  if (error) {
    console.error('[webhook:membership] ERROR: Failed to upsert', {
      subscriptionId: subscription.id,
      customerId,
      planId: plan.id,
      userId,
      error: error.message,
      errorDetails: error,
    })
    throw new Error(`Failed to create membership: ${error.message}`)
  }

  console.log('[webhook:membership] SUCCESS', {
    membershipId: membership.id,
    userId,
    planId: plan.id,
    planName: plan.name,
    subscriptionId: subscription.id,
    status: membership.status,
  })

  return membership
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceSupabaseClient>
) {
  console.log('[webhook:subscription.updated] START', {
    subscriptionId: subscription.id,
    status: subscription.status,
  })

  const period = getPeriodBounds(subscription)

  // Map Stripe subscription status to our membership status
  let membershipStatus: string
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    membershipStatus = 'active'
  } else if (subscription.status === 'incomplete') {
    membershipStatus = 'active' // Keep as active pending payment
  } else {
    membershipStatus = subscription.status
  }

  const { error } = await supabase
    .from('memberships')
    .update({
      status: membershipStatus,
      current_period_start: period.start,
      current_period_end: period.end,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: getOptionalStripeDate(subscription.canceled_at),
      trial_start: getOptionalStripeDate(subscription.trial_start),
      trial_end: getOptionalStripeDate(subscription.trial_end),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('[webhook:subscription.updated] ERROR', {
      subscriptionId: subscription.id,
      error: error.message,
    })
    throw new Error(`Failed to update membership: ${error.message}`)
  }

  console.log('[webhook:subscription.updated] SUCCESS', {
    subscriptionId: subscription.id,
    status: membershipStatus,
  })
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceSupabaseClient>
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
  supabase: ReturnType<typeof getServiceSupabaseClient>
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
  const period = getPeriodBounds(subscription)

  await supabase
    .from('memberships')
    .update({
      current_period_start: period.start,
      current_period_end: period.end,
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
  supabase: ReturnType<typeof getServiceSupabaseClient>
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
  supabase: ReturnType<typeof getServiceSupabaseClient>
) {
  const customerId = session.customer as string
  const metadata = session.metadata || {}

  // Mark initiation fee as paid if it was included in the checkout
  if (metadata.includes_initiation_fee === 'true' && customerId) {
    console.log('[webhook:checkout.completed] Marking initiation fee as paid', { customerId })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ initiation_fee_paid: true })
        .eq('id', profile.id)

      if (updateError) {
        console.error('[webhook:checkout.completed] Failed to mark initiation fee as paid', {
          profileId: profile.id,
          error: updateError.message,
        })
      } else {
        console.log('[webhook:checkout.completed] Initiation fee marked as paid', { profileId: profile.id })
      }
    }
  }

  // Handle Social Open Play payment completion
  if (metadata.payment_type === 'social_open_play' && session.payment_intent && metadata.social_open_play_booking_id) {
    const amountPaid = session.amount_total != null ? (session.amount_total / 100) : 15
    await supabase
      .from('social_open_play_bookings')
      .update({
        payment_status: 'paid',
        payment_intent_id: session.payment_intent as string,
        amount_paid: amountPaid,
      })
      .eq('id', metadata.social_open_play_booking_id)
    return
  }

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
          currency: session.currency || 'cad',
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
  eventId: string,
  supabase: ReturnType<typeof getServiceSupabaseClient>,
) {
  const bookingId = paymentIntent.metadata?.booking_id as string | undefined

  if (bookingId) {
    await recordPaymentEvent({
      stripeEventId: eventId,
      type: 'payment_intent.succeeded',
      bookingId,
      paymentIntentId: paymentIntent.id,
      payload: paymentIntent as unknown as Record<string, unknown>,
      status: 'processing',
    })

    await finalizeBookingPayment({
      bookingId,
      paymentIntentId: paymentIntent.id,
      stripePaymentIntent: paymentIntent,
    })

    await recordPaymentEvent({
      stripeEventId: eventId,
      type: 'payment_intent.succeeded',
      bookingId,
      paymentIntentId: paymentIntent.id,
      status: 'processed',
    })
    return
  }

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
  eventId: string,
  supabase: ReturnType<typeof getServiceSupabaseClient>,
) {
  const bookingId = paymentIntent.metadata?.booking_id as string | undefined

  if (bookingId) {
    await recordPaymentEvent({
      stripeEventId: eventId,
      type: 'payment_intent.payment_failed',
      bookingId,
      paymentIntentId: paymentIntent.id,
      payload: paymentIntent as unknown as Record<string, unknown>,
      status: 'failed',
      requiresRetry: true,
      errorMessage: paymentIntent.last_payment_error?.message,
    })

    await handlePaymentFailure({
      bookingId,
      paymentIntentId: paymentIntent.id,
      stripeError: paymentIntent.last_payment_error || undefined,
    })
    return
  }

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
    await supabase
      .from('payments')
      .update({
        status: 'failed',
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }
}

async function handleChargeRefunded(charge: Stripe.Charge, eventId: string) {
  if (!charge.refunds?.data?.length) {
    return
  }

  for (const refund of charge.refunds.data) {
    await syncRefundRecord(refund, eventId)
  }
}

async function handleRefundUpdated(refund: Stripe.Refund, eventId: string) {
  await syncRefundRecord(refund, eventId)
}

async function syncRefundRecord(refund: Stripe.Refund, eventId: string) {
  const paymentIntentId = refund.payment_intent as string | null

  if (!paymentIntentId) {
    return
  }

  const supabase = getServiceSupabaseClient()

  try {
    const { data: payment } = await supabase
      .from('payments')
      .select('id, booking_id, currency')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    if (!payment) {
      return
    }

    const { error } = await supabase.rpc('fn_create_refund_record', {
      p_payment_id: payment.id,
      p_booking_id: payment.booking_id,
      p_stripe_refund_id: refund.id,
      p_amount: (refund.amount || 0) / 100,
      p_status: refund.status,
      p_reason: refund.reason || refund.metadata?.reason || 'stripe_refund',
      p_metadata: refund.metadata || {},
    })

    if (error) {
      throw new Error(error.message)
    }

    await recordPaymentEvent({
      stripeEventId: eventId,
      type: 'refund.updated',
      bookingId: payment.booking_id,
      paymentIntentId,
      status: refund.status,
      payload: refund as unknown as Record<string, unknown>,
    })
  } catch (error) {
    logPaymentError('Failed to sync refund', error, {
      refundId: refund.id,
      paymentIntentId,
    })
  }
}

