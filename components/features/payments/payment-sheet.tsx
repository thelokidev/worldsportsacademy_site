'use client'

import { useEffect, useMemo, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { mapStripeErrorToUserMessage } from '@/lib/stripe/error-messages'
import { Button } from '@/components/ui/button'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

type PaymentSheetProps = {
  bookingId: string
  amount: number
  currency: string
  onSuccess?: () => void
}

type PaymentIntentResponse = {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

export const PaymentSheet = ({ bookingId, amount: _amount, currency: _currency, onSuccess }: PaymentSheetProps) => {
  const [intentData, setIntentData] = useState<PaymentIntentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeIntent = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const response = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          throw new Error(errorBody.error || 'Failed to initialize payment')
        }

        const data = (await response.json()) as PaymentIntentResponse
        if (isMounted) {
          setIntentData(data)
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error instanceof Error ? error.message : 'Failed to load payment form')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeIntent()

    return () => {
      isMounted = false
    }
  }, [bookingId])

  const appearance: StripeElementsOptions['appearance'] = useMemo(
    () => ({
      theme: 'flat',
      labels: 'floating',
      variables: {
        colorPrimary: '#0f172a',
        colorDanger: '#dc2626',
        borderRadius: '12px',
        spacingGridRow: '16px',
      },
      rules: {
        '.Input': {
          borderColor: '#e2e8f0',
          boxShadow: 'none',
        },
      },
    }),
    [],
  )

  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </div>
    )
  }

  if (isLoading || !intentData) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 text-center">
        {fetchError ? (
          <p className="text-sm text-red-600">{fetchError}</p>
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparing secure payment form...
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 space-y-1">
        <p className="text-sm font-medium text-slate-600">Total Due</p>
        <p className="text-2xl font-semibold text-slate-900">
          {formatAmount(intentData.amount, intentData.currency)}
        </p>
        <p className="text-xs text-slate-500">Secure payment via Stripe</p>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: intentData.clientSecret,
          appearance,
        }}
      >
        <PaymentForm
          bookingId={bookingId}
          paymentIntentId={intentData.paymentIntentId}
          onSuccess={onSuccess}
        />
      </Elements>
    </div>
  )
}

const PaymentForm = ({
  bookingId,
  paymentIntentId,
  onSuccess,
}: {
  bookingId: string
  paymentIntentId: string
  onSuccess?: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error('Payment form is not ready yet.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        toast.error(mapStripeErrorToUserMessage(error))
        return
      }

      const finalIntent = paymentIntent || (await stripe.retrievePaymentIntent(paymentIntentId)).paymentIntent

      if (!finalIntent || finalIntent.status !== 'succeeded') {
        toast.error('Payment has not completed yet. Please try again.')
        return
      }

      const response = await fetch('/api/booking/payments/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentIntentId: finalIntent.id }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to finalize booking')
      }

      toast.success('Payment confirmed! Booking secured.')
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
      className="space-y-4"
    >
      <PaymentElement
        id="booking-payment-element"
        aria-label="Secure payment form"
        options={{
          layout: 'tabs',
        }}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay & Confirm Booking'
        )}
      </Button>
    </form>
  )
}

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

