'use client'

import { useEffect, useMemo, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions, Stripe } from '@stripe/stripe-js'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { mapStripeErrorToUserMessage } from '@/lib/stripe/error-messages'
import { Button } from '@/components/ui/button'

// Validate publishable key format
const validatePublishableKey = (key: string | undefined): string | null => {
  if (!key) {
    return null
  }
  
  // Check if key starts with pk_test_ or pk_live_
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
    return null
  }
  
  return key
}

const publishableKey = validatePublishableKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

type PaymentSheetProps = {
  bookingId: string
  amount?: number
  currency?: string
  onSuccess?: () => void
}

type PaymentIntentResponse = {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

export const PaymentSheet = ({ bookingId, onSuccess }: PaymentSheetProps) => {
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
    const envKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const errorMessage = !envKey
      ? 'Stripe publishable key is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.'
      : 'Invalid Stripe publishable key format. The key must start with "pk_test_" or "pk_live_". Please check your .env.local file.'
    
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Payment Configuration Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              For development, you can get test keys from{' '}
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-800 dark:hover:text-red-200"
              >
                Stripe Dashboard
              </a>
              .
            </p>
          </div>
        </div>
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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-6 space-y-1">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Due</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {formatAmount(intentData.amount, intentData.currency)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Secure payment via Stripe</p>
      </div>

      <StripeElementsWrapper
        stripe={stripePromise}
        clientSecret={intentData.clientSecret}
        appearance={appearance}
        bookingId={bookingId}
        paymentIntentId={intentData.paymentIntentId}
        onSuccess={onSuccess}
      />
    </div>
  )
}

const StripeElementsWrapper = ({
  stripe,
  clientSecret,
  appearance,
  bookingId,
  paymentIntentId,
  onSuccess,
}: {
  stripe: Promise<Stripe | null> | null
  clientSecret: string
  appearance: StripeElementsOptions['appearance']
  bookingId: string
  paymentIntentId: string
  onSuccess?: () => void
}) => {
  const [stripeError, setStripeError] = useState<string | null>(null)

  useEffect(() => {
    // Validate that Stripe loaded successfully
    if (stripe) {
      stripe.catch((error) => {
        console.error('Stripe initialization error:', error)
        setStripeError(
          error?.message?.includes('Invalid API key')
            ? 'Invalid Stripe API key. Please check your NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local'
            : 'Failed to initialize Stripe. Please check your configuration.'
        )
      })
    }
  }, [stripe])

  if (stripeError) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Stripe Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{stripeError}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <PaymentForm
        bookingId={bookingId}
        paymentIntentId={paymentIntentId}
        onSuccess={onSuccess}
        onError={(error) => {
          if (error?.message?.includes('Invalid API key') || error?.message?.includes('Invalid')) {
            setStripeError('Invalid Stripe API key. Please check your NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local')
          }
        }}
      />
    </Elements>
  )
}

const PaymentForm = ({
  bookingId,
  paymentIntentId,
  onSuccess,
  onError,
}: {
  bookingId: string
  paymentIntentId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [elementsError, setElementsError] = useState<string | null>(null)

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

  // Note: PaymentElement errors are handled in the onChange handler below

  if (elementsError) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Payment Form Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{elementsError}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stripe || !elements) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading payment form...
        </div>
      </div>
    )
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
        onReady={() => {
          setElementsError(null)
        }}
        onChange={(event) => {
          if (event.error) {
            const errorMessage = event.error.message || ''
            if (errorMessage.includes('Invalid API key') || errorMessage.includes('Invalid')) {
              const error = new Error('Invalid Stripe API key')
              setElementsError('Invalid Stripe API key. Please check your NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configuration.')
              onError?.(error)
            } else if (event.error.type === 'validation_error') {
              // Don't show validation errors as they're handled by the element
              setElementsError(null)
            }
          } else {
            setElementsError(null)
          }
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

