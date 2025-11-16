import { logPaymentError, logPaymentInfo } from '@/lib/logger'
import { getServiceSupabaseClient } from '@/lib/supabase/service'
import { getStripeClient } from '@/lib/stripe/client'

type ReconciliationParams = {
  limit?: number
}

export const reconcileStripePayments = async ({ limit = 25 }: ReconciliationParams = {}) => {
  const supabase = getServiceSupabaseClient()
  const stripe = getStripeClient()

  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, stripe_payment_intent_id, status, amount, currency, booking_id')
    .not('stripe_payment_intent_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  const mismatches: Array<{
    paymentId: string
    bookingId: string | null
    localStatus: string
    stripeStatus: string
    localAmount: number
    stripeAmount: number
  }> = []

  for (const payment of payments || []) {
    if (!payment.stripe_payment_intent_id) {
      continue
    }
    try {
      const intent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id)
      const stripeStatus = intent.status
      const stripeAmount = (intent.amount_received ?? intent.amount ?? 0) / 100

      const statusesMatch =
        (stripeStatus === 'succeeded' && payment.status === 'succeeded') ||
        (stripeStatus !== 'succeeded' && payment.status !== 'succeeded')
      const amountMatches = Math.abs(stripeAmount - Number(payment.amount || 0)) < 0.01

      if (!statusesMatch || !amountMatches) {
        mismatches.push({
          paymentId: payment.id,
          bookingId: payment.booking_id,
          localStatus: payment.status,
          stripeStatus,
          localAmount: Number(payment.amount || 0),
          stripeAmount,
        })
      }
    } catch (stripeError) {
      logPaymentError('Reconciliation Stripe error', stripeError, {
        paymentId: payment.id,
        paymentIntentId: payment.stripe_payment_intent_id,
      })
    }
  }

  logPaymentInfo('Reconciliation completed', {
    inspected: payments?.length || 0,
    mismatches: mismatches.length,
  })

  return {
    inspected: payments?.length || 0,
    mismatches,
  }
}

