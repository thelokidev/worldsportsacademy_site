import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { confirmBookingPaymentFromSession } from '@/server/actions/booking-payments'

async function CheckoutSuccessContent({ sessionId }: { sessionId: string }) {
  // Verify payment and update booking
  try {
    const booking = await confirmBookingPaymentFromSession(sessionId)
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)

    return (
      <Card className="border-green-500/40 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle>Payment Successful!</CardTitle>
          </div>
          <CardDescription>
            Your booking has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-green-500/30 bg-black/40 p-4 text-sm text-gray-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Sport</span>
              <span className="font-semibold text-white">
                {booking.sports?.display_name || booking.sports?.name || 'Squash'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Court</span>
              <span className="font-semibold text-white">
                {booking.courts?.name || 'Court'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date</span>
              <span className="font-semibold text-white">
                {format(start, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time</span>
              <span className="font-semibold text-white">
                {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/dashboard/bookings">View My Bookings</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bookings">Book Another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Payment</CardTitle>
          <CardDescription>
            We're confirming your payment. This may take a moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            If you've completed payment, your booking will be confirmed shortly.
            You can check your bookings page for updates.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/dashboard/bookings">View My Bookings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <Card className="border-red-500/40 bg-red-500/5">
            <CardHeader>
              <CardTitle>Invalid Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                No session ID provided. Please check your bookings page.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/dashboard/bookings">View My Bookings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/bookings">Book Another</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-16">
      <div className="mx-auto flex max-w-3xl items-center justify-center">
        <Suspense
          fallback={
            <Card className="w-full border-gray-800 bg-black/60">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <p className="text-sm text-gray-400">Confirming your booking...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <CheckoutSuccessContent sessionId={sessionId} />
        </Suspense>
      </div>
    </div>
  )
}
          <CardHeader>
            <CardTitle>Invalid Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No session ID provided. Please check your bookings page.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/dashboard/bookings">View My Bookings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Suspense
          fallback={
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          }
        >
          <CheckoutSuccessContent sessionId={sessionId} />
        </Suspense>
      </div>
    </div>
  )
}

