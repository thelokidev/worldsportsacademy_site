import Stripe from 'stripe'

export function getPeriodBounds(subscription: Stripe.Subscription) {
  const now = Date.now()
  const startMs = subscription.current_period_start
    ? subscription.current_period_start * 1000
    : subscription.start_date
      ? subscription.start_date * 1000
      : now
  const endMs = subscription.current_period_end
    ? subscription.current_period_end * 1000
    : startMs + 30 * 24 * 60 * 60 * 1000

  return {
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  }
}

export function getOptionalStripeDate(timestamp?: number | null) {
  if (timestamp && Number.isFinite(timestamp)) {
    return new Date(timestamp * 1000).toISOString()
  }
  return null
}

