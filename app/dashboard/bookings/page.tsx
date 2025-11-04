import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllBookings } from '@/server/queries/bookings'
import { cancelBooking } from '@/server/actions/bookings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { CancelBookingButton } from '@/components/features/booking/cancel-booking-button'

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirect=/dashboard/bookings')
  }

  const bookings = await getAllBookings(user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your court bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You don't have any bookings yet.
              </p>
              <Button asChild>
                <a href="/bookings">Book a Court</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => {
              const isPast = new Date(booking.start_time) < new Date()
              const isCancelled = booking.status === 'cancelled'
              const canCancel = !isPast && !isCancelled

              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">
                            {(booking.sports as any)?.display_name || 'Sport'}
                          </CardTitle>
                          <Badge
                            variant={
                              isCancelled
                                ? 'destructive'
                                : isPast
                                  ? 'secondary'
                                  : 'default'
                            }
                          >
                            {booking.status === 'pending'
                              ? 'Pending'
                              : booking.status === 'confirmed'
                                ? 'Confirmed'
                                : 'Cancelled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Court: {(booking.courts as any)?.name || 'Unknown'}
                        </p>
                      </div>
                      {canCancel && (
                        <CancelBookingButton bookingId={booking.id} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-semibold">
                            {format(parseISO(booking.start_time), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-semibold">
                            {format(parseISO(booking.start_time), 'h:mm a')} -{' '}
                            {format(parseISO(booking.end_time), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

