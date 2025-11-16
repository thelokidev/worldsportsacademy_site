'use client'

import { useEffect, useRef, useState } from 'react'
import { createBooking } from '@/server/actions/bookings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Calendar, MapPin, Clock, CreditCard, CheckCircle2 } from 'lucide-react'
import { format, addMinutes, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDuration } from '@/lib/utils/duration'
import { PaymentSheet } from '@/components/features/payments/payment-sheet'

interface BookingSummaryProps {
  sport: { id: string; display_name: string; duration_minutes?: number }
  court: { id: string; name: string }
  selectedDate: Date
  selectedTime: string
  onBack: () => void
}

export function BookingSummary({
  sport,
  court,
  selectedDate,
  selectedTime,
  onBack,
}: BookingSummaryProps) {
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const skipCancelRef = useRef(false)
  const [paymentInfo, setPaymentInfo] = useState<{
    price: number
    tax: number
    total: number
  } | null>(null)
  const router = useRouter()

  const durationMinutes = sport.duration_minutes || 60
  const startTime = parseISO(selectedTime)
  const endTime = addMinutes(startTime, durationMinutes)

  useEffect(() => {
    async function checkAuthorization() {
      try {
        const response = await fetch('/api/booking/check-authorization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sportId: sport.id,
            durationMinutes,
          }),
        })

        const data = await response.json()

        if (data.requiresPayment) {
          setRequiresPayment(true)
          setPaymentInfo({
            price: data.dropInPrice,
            tax: data.tax,
            total: data.total,
          })
        }
      } catch (error) {
        console.error('Authorization check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuthorization()
  }, [sport.id, durationMinutes])

  async function handleConfirm() {
    setLoading(true)
    try {
      if (requiresPayment) {
        if (pendingBookingId) {
          setPaymentDialogOpen(true)
          return
        }

        const response = await fetch('/api/booking/create-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sportId: sport.id,
            courtId: court.id,
            startTime: selectedTime,
            endTime: endTime.toISOString(),
            durationMinutes,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create pending booking')
        }

        const { bookingId } = await response.json()
        setPendingBookingId(bookingId)
        setPaymentDialogOpen(true)
        return
      }

      // Member booking - free
      const formData = new FormData()
      formData.append('sportId', sport.id)
      formData.append('courtId', court.id)
      formData.append('startTime', selectedTime)
      formData.append('endTime', endTime.toISOString())
      formData.append('selectedDuration', durationMinutes.toString())
      formData.append('bookingType', 'member')

      const result = await createBooking(formData)

      if (result.success) {
        toast.success('Booking confirmed!')
        router.push('/dashboard/bookings')
      } else {
        toast.error(result.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    skipCancelRef.current = true
    setPendingBookingId(null)
    setPaymentDialogOpen(false)
    toast.success('Booking confirmed!')
    router.push('/dashboard/bookings')
  }

  const handlePaymentDialogChange = async (open: boolean) => {
    setPaymentDialogOpen(open)
    if (open) return

    if (skipCancelRef.current) {
      skipCancelRef.current = false
      return
    }

    if (!open && pendingBookingId) {
      try {
        await fetch('/api/booking/cancel-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: pendingBookingId }),
        })
      } catch (error) {
        console.error('Failed to cancel pending booking', error)
      } finally {
        setPendingBookingId(null)
      }
    }
  }

  if (checkingAuth) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
          <CardDescription>
            {requiresPayment
              ? 'Payment required for this booking'
              : 'Your membership covers this booking'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Sport</p>
              <p className="font-semibold">{sport.display_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Court</p>
              <p className="font-semibold">{court.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-semibold">
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </p>
              <p className="text-xs text-muted-foreground">
                Duration: {formatDuration(durationMinutes)}
              </p>
            </div>
          </div>

          {requiresPayment && paymentInfo && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <p className="font-semibold">Payment Required</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Drop-in Fee ({formatDuration(durationMinutes)})
                  </span>
                  <span>${paymentInfo.price.toFixed(2)}</span>
                </div>
                {paymentInfo.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${paymentInfo.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>${paymentInfo.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {!requiresPayment && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-medium">Covered by your membership</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {requiresPayment ? 'Processing...' : 'Confirming...'}
            </>
          ) : requiresPayment ? (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay & Confirm
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={handlePaymentDialogChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Securely enter your payment details to confirm this booking.
            </DialogDescription>
          </DialogHeader>
          {pendingBookingId && paymentInfo && (
            <PaymentSheet
              bookingId={pendingBookingId}
              amount={paymentInfo.total}
              currency="usd"
              onSuccess={handlePaymentSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

