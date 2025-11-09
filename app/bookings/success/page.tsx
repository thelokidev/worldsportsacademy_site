import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function CheckoutSuccessContent({ sessionId }: { sessionId: string }) {
  // Verify payment and update booking
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/booking/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })

    if (!response.ok) {
      throw new Error('Failed to confirm payment')
    }

    const { booking } = await response.json()

    return (
      <Card>
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
          <p className="text-sm text-gray-600">
            Your booking is now confirmed. You'll receive a confirmation email shortly.
          </p>
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

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
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

