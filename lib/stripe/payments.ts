import Stripe from 'stripe'

import { sendPaymentAlert } from '@/lib/alerts/payment-alerts'
import { logPaymentError, logPaymentInfo } from '@/lib/logger'
import { sendRefundEmail } from '@/lib/notifications/email'
import { sendRefundSms } from '@/lib/notifications/sms'
import { getServiceSupabaseClient } from '@/lib/supabase/service'
import { getStripeClient } from '@/lib/stripe/client'
import { mapStripeErrorToUserMessage } from '@/lib/stripe/error-messages'

type SupabaseClient = ReturnType<typeof getServiceSupabaseClient>

type EnsureCustomerInput = {
  userId: string
  email?: string | null
  fullName?: string | null
  existingCustomerId?: string | null
}

type BookingRecord = {
  id: string
  user_id: string
  sport_id: string
  selected_duration: number | null
  status: string
  payment_status: string | null
  expected_payment_amount: number | null
  payment_currency: string | null
  payment_intent_id: string | null
}

type PaymentIntentResult = {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

const fetchBookingById = async (supabase: SupabaseClient, bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
        id,
        user_id,
        sport_id,
        selected_duration,
        status,
        payment_status,
        expected_payment_amount,
        payment_currency,
        payment_intent_id,
        payment_id
      `,
    )
    .eq('id', bookingId)
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Booking not found')
  }

  return data as BookingRecord
}

const fetchDropInPricing = async (
  supabase: SupabaseClient,
  sportId: string,
  durationMinutes: number,
) => {
  const { data, error } = await supabase
    .from('drop_in_pricing')
    .select('price, tax_rate, stripe_price_id, stripe_product_id')
    .eq('sport_id', sportId)
    .eq('duration_minutes', durationMinutes)
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Drop-in pricing not configured')
  }

  const subtotal = Number(data.price)
  const tax = subtotal * Number(data.tax_rate || 0)
  const total = subtotal + tax

  return { 
    subtotal, 
    tax, 
    total,
    stripe_price_id: data.stripe_price_id || null,
    stripe_product_id: data.stripe_product_id || null,
  }
}

export const ensureStripeCustomer = async ({
  userId,
  email,
  fullName,
  existingCustomerId,
}: EnsureCustomerInput) => {
  if (existingCustomerId) {
    return existingCustomerId
  }

  const stripe = getStripeClient()
  const supabase = getServiceSupabaseClient()

  try {
    const customer = await stripe.customers.create({
      email: email || undefined,
      name: fullName || undefined,
      metadata: {
        supabase_user_id: userId,
      },
    })

    // Try to update profile with Stripe customer ID
    // If the column doesn't exist or update fails, we'll still return the customer ID
    // The customer is created in Stripe, so we can proceed even if profile update fails
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)

    if (updateError) {
      // Log the error but don't fail - we have the customer ID and can proceed
      console.error('Failed to update profile with Stripe customer ID:', {
        error: updateError,
        userId,
        customerId: customer.id,
        message: updateError.message,
        code: updateError.code,
      })
      
      // If it's a schema cache issue, suggest running migration
      if (updateError.code === 'PGRST204' || updateError.message?.includes('schema cache')) {
        console.error(
          'PostgREST schema cache issue detected. ' +
          'Please run migration 20250117000001_fix_profiles_stripe_customer_id.sql ' +
          'or refresh the schema cache in Supabase Dashboard.'
        )
      }
    }

    return customer.id
  } catch (error) {
    // Provide more helpful error messages for common Stripe API key issues
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as any
      if (stripeError.type === 'StripeAuthenticationError' || stripeError.message?.includes('Invalid API key')) {
        const secretKey = process.env.STRIPE_SECRET_KEY
        const keyPreview = secretKey ? `${secretKey.trim().substring(0, 12)}...` : 'not set'
        const keyLength = secretKey ? secretKey.trim().length : 0
        const isVercel = process.env.VERCEL === '1'
        
        let diagnosticInfo = `Key preview: ${keyPreview}, Length: ${keyLength} chars`
        if (!secretKey) {
          diagnosticInfo = 'Key is not set in environment variables'
        } else if (!secretKey.trim().startsWith('sk_')) {
          diagnosticInfo = `Key format is invalid (does not start with 'sk_')`
        } else if (keyLength < 20) {
          diagnosticInfo = `Key appears to be truncated (too short: ${keyLength} chars)`
        }
        
        const envHint = isVercel
          ? 'Please check your Vercel environment variables and redeploy after updating.'
          : 'Please check your .env.local file and restart the development server.'
        
        throw new Error(
          `Stripe API key is invalid. ${diagnosticInfo}. ` +
          `Please verify your STRIPE_SECRET_KEY matches the key from your Stripe Dashboard. ` +
          `Test keys start with 'sk_test_', live keys start with 'sk_live_'. ` +
          `${envHint}`
        )
      }
    }
    throw error
  }
}

const reuseExistingIntent = async (
  booking: BookingRecord,
  customerId: string,
): Promise<PaymentIntentResult | null> => {
  if (!booking.payment_intent_id) {
    return null
  }

  const stripe = getStripeClient()
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id, {
      expand: ['latest_charge'],
    })

    if (
      ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(
        paymentIntent.status,
      ) &&
      paymentIntent.customer === customerId
    ) {
      if (!paymentIntent.client_secret) {
        return null
      }

      const amount = (paymentIntent.amount ?? 0) / 100
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: paymentIntent.currency,
      }
    }
  } catch (error) {
    logPaymentError('Failed to reuse existing payment intent', error, {
      bookingId: booking.id,
      paymentIntentId: booking.payment_intent_id,
    })
  }

  return null
}

export const createBookingPaymentIntent = async ({
  bookingId,
  customerId,
  receiptEmail,
}: {
  bookingId: string
  customerId: string
  receiptEmail?: string | null
}): Promise<PaymentIntentResult> => {
  const supabase = getServiceSupabaseClient()
  const booking = await fetchBookingById(supabase, bookingId)

  if (booking.status !== 'pending') {
    throw new Error('Booking is not pending payment')
  }

  const durationMinutes = booking.selected_duration || 60
  const pricing = await fetchDropInPricing(supabase, booking.sport_id, durationMinutes)

  // Validate pricing data
  if (!pricing || pricing.total <= 0) {
    throw new Error('Invalid pricing configuration. Please contact support.')
  }

  // Persist expected payment metadata for reconciliation
  await supabase
    .from('bookings')
    .update({
      expected_payment_amount: pricing.total,
      payment_currency: 'usd',
    })
    .eq('id', booking.id)

  const reuseIntent = await reuseExistingIntent(booking, customerId)
  if (reuseIntent) {
    return reuseIntent
  }

  const stripe = getStripeClient()
  const amountInCents = Math.round(pricing.total * 100)

  // Validate amount is valid
  if (amountInCents < 50) {
    throw new Error(`Invalid payment amount: $${pricing.total}. Minimum payment is $0.50.`)
  }

  try {
    const paymentIntentMetadata: Record<string, string> = {
      booking_id: booking.id,
      user_id: booking.user_id,
      payment_type: 'drop_in',
    }

    // Add Stripe price ID to metadata if available
    if (pricing.stripe_price_id) {
      paymentIntentMetadata.stripe_price_id = pricing.stripe_price_id
    }
    if (pricing.stripe_product_id) {
      paymentIntentMetadata.stripe_product_id = pricing.stripe_product_id
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customerId,
      receipt_email: receiptEmail || undefined,
      description: `Drop-in booking ${booking.id} payment`,
      metadata: paymentIntentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    })

    await supabase
      .from('bookings')
      .update({
        payment_intent_id: paymentIntent.id,
      })
      .eq('id', booking.id)

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe did not return a client secret')
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: pricing.total,
      currency: 'usd',
    }
  } catch (error) {
    // Provide more helpful error messages for Stripe API key issues
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as any
      
      if (stripeError.type === 'StripeAuthenticationError' || stripeError.message?.includes('Invalid API key')) {
        const secretKey = process.env.STRIPE_SECRET_KEY
        const keyPreview = secretKey ? `${secretKey.trim().substring(0, 12)}...` : 'not set'
        const keyLength = secretKey ? secretKey.trim().length : 0
        const isVercel = process.env.VERCEL === '1'
        
        // Detailed diagnostic information
        let diagnosticInfo = `Key preview: ${keyPreview}, Length: ${keyLength} chars`
        if (!secretKey) {
          diagnosticInfo = 'Key is not set in environment variables'
        } else if (!secretKey.trim().startsWith('sk_')) {
          diagnosticInfo = `Key format is invalid (does not start with 'sk_')`
        } else if (keyLength < 20) {
          diagnosticInfo = `Key appears to be truncated (too short: ${keyLength} chars)`
        }
        
        const envHint = isVercel
          ? 'Please check your Vercel environment variables and redeploy after updating.'
          : 'Please check your .env.local file and restart the development server.'
        
        throw new Error(
          `Stripe API key is invalid. ${diagnosticInfo}. ` +
          `Please verify your STRIPE_SECRET_KEY matches the key from your Stripe Dashboard. ` +
          `Test keys start with 'sk_test_', live keys start with 'sk_live_'. ` +
          `${envHint}`
        )
      }
      
      // Handle other Stripe API errors
      if (stripeError.type === 'StripeInvalidRequestError') {
        const errorMessage = stripeError.message || 'Invalid request to Stripe'
        throw new Error(`Stripe payment error: ${errorMessage}. Please check your payment configuration.`)
      }
      
      if (stripeError.type === 'StripeAPIError') {
        throw new Error('Stripe API is currently unavailable. Please try again in a few moments.')
      }
    }
    
    // Re-throw with more context if it's a known error
    if (error instanceof Error) {
      // Don't wrap if it's already a helpful error message
      if (error.message.includes('pricing') || error.message.includes('configuration')) {
        throw error
      }
      throw new Error(`Failed to create payment: ${error.message}`)
    }
    
    throw error
  }
}

export const finalizeBookingPayment = async ({
  bookingId,
  paymentIntentId,
  stripePaymentIntent,
}: {
  bookingId: string
  paymentIntentId: string
  stripePaymentIntent?: Stripe.PaymentIntent
}) => {
  const stripe = getStripeClient()
  const supabase = getServiceSupabaseClient()

  const paymentIntent =
    stripePaymentIntent || (await stripe.paymentIntents.retrieve(paymentIntentId))

  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Payment intent is not succeeded')
  }

  const amount = (paymentIntent.amount_received ?? paymentIntent.amount ?? 0) / 100
  const currency = paymentIntent.currency || 'usd'

  const { data, error } = await supabase.rpc('fn_finalize_booking_payment', {
    p_booking_id: bookingId,
    p_payment_intent_id: paymentIntent.id,
    p_amount: amount,
    p_currency: currency,
    p_payment_type: 'drop_in',
    p_metadata: paymentIntent.metadata || {},
  })

  if (error) {
    throw new Error(error.message)
  }

  logPaymentInfo('Booking payment finalized', {
    bookingId,
    paymentIntentId,
    amount,
    currency,
  })

  return data
}

export const handlePaymentFailure = async ({
  bookingId,
  paymentIntentId,
  stripeError,
}: {
  bookingId: string
  paymentIntentId: string
  stripeError?: Stripe.StripeRawError | Stripe.StripeCardError | Error
}) => {
  const supabase = getServiceSupabaseClient()
  const errorCode =
    stripeError && 'code' in stripeError && stripeError.code ? stripeError.code : 'unknown_error'
  const errorMessage =
    stripeError && 'message' in stripeError && stripeError.message
      ? stripeError.message
      : 'Payment failed'

  const { error } = await supabase.rpc('fn_mark_booking_payment_failed', {
    p_booking_id: bookingId,
    p_error_code: errorCode,
    p_error_message: errorMessage,
  })

  if (error) {
    logPaymentError('Failed to mark booking payment as failed', error, {
      bookingId,
      paymentIntentId,
    })
    throw new Error(error.message)
  }

  logPaymentError('Payment failed', stripeError, {
    bookingId,
    paymentIntentId,
    errorCode,
  })

  await sendPaymentAlert({
    title: 'Payment failure',
    message: `Booking ${bookingId} failed with error ${errorCode}`,
    severity: 'warning',
    metadata: {
      bookingId,
      paymentIntentId,
      errorCode,
    },
  })
}

export const initiateBookingRefund = async ({
  bookingId,
  reason = 'user_cancelled',
}: {
  bookingId: string
  reason?: string
}) => {
  const supabase = getServiceSupabaseClient()
  const stripe = getStripeClient()

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select(
      `
        id,
        amount,
        currency,
        stripe_payment_intent_id,
        booking_id,
        status,
        profiles:user_id (
          email,
          phone_number,
          full_name
        )
      `,
    )
    .eq('booking_id', bookingId)
    .single()

  if (paymentError || !payment) {
    throw new Error(paymentError?.message || 'Payment record not found')
  }

  if (!payment.stripe_payment_intent_id) {
    throw new Error('Missing payment intent for booking')
  }

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripe_payment_intent_id,
    metadata: {
      booking_id: bookingId,
      reason,
    },
  })

  const { error: rpcError } = await supabase.rpc('fn_create_refund_record', {
    p_payment_id: payment.id,
    p_booking_id: bookingId,
    p_stripe_refund_id: refund.id,
    p_amount: (refund.amount || 0) / 100,
    p_status: refund.status,
    p_reason: reason,
    p_metadata: refund.metadata || {},
  })

  if (rpcError) {
    throw new Error(rpcError.message)
  }

  const etaMessage = 'Refunds typically process within 5-10 business days.'
  const amount = (refund.amount || 0) / 100
  const currency = refund.currency || payment.currency || 'usd'
  const formattedAmount = formatCurrency(amount, currency)

  if (payment.profiles?.email) {
    await sendRefundEmail({
      to: payment.profiles.email,
      amount,
      currency,
      bookingReference: bookingId,
      etaMessage,
    })
  }

  if (payment.profiles?.phone_number) {
    await sendRefundSms({
      to: payment.profiles.phone_number,
      amount,
      currency,
      etaMessage,
    })
  }

  logPaymentInfo('Refund initiated', {
    bookingId,
    amount: formattedAmount,
    refundId: refund.id,
  })

  return { refundId: refund.id, amount, currency, etaMessage }
}

export const recordPaymentEvent = async ({
  stripeEventId,
  type,
  bookingId,
  paymentIntentId,
  payload,
  status,
  requiresRetry = false,
  errorMessage,
}: {
  stripeEventId: string
  type: string
  bookingId?: string | null
  paymentIntentId?: string | null
  payload?: Record<string, unknown>
  status: string
  requiresRetry?: boolean
  errorMessage?: string
}) => {
  const supabase = getServiceSupabaseClient()
  const { error } = await supabase.rpc('fn_record_payment_event', {
    p_stripe_event_id: stripeEventId,
    p_type: type,
    p_booking_id: bookingId || null,
    p_payment_intent_id: paymentIntentId || null,
    p_payload: payload || {},
    p_status: status,
    p_requires_retry: requiresRetry,
    p_error_message: errorMessage || null,
  })

  if (error) {
    logPaymentError('Failed to record payment event', error, {
      stripeEventId,
      type,
    })
  }
}

export { mapStripeErrorToUserMessage }

