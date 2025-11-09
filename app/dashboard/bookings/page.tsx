import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllBookings } from '@/server/queries/bookings'
import { cancelBooking } from '@/server/actions/bookings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { CancelBookingButton } from '@/components/features/booking/cancel-booking-button'
import { formatDuration } from '@/lib/utils/duration'

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirect=/dashboard/bookings')
  }

  const bookings = await getAllBookings(user.id)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] pt-24 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-white/90">
            View and manage your court bookings
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {bookings.length === 0 ? (
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardContent className="py-16 text-center">
                <p className="text-gray-600 mb-6 text-lg">
                  You don't have any bookings yet.
                </p>
                <Button 
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white"
                  size="lg"
                >
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
                  <Card 
                    key={booking.id}
                    className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl text-[#2D5B4A]">
                              {(booking.sports as any)?.display_name || 'Sport'}
                            </CardTitle>
                            <Badge
                              className={
                                isCancelled
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : isPast
                                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                                    : 'bg-[#50C878] text-white border-[#50C878]'
                              }
                              variant="outline"
                            >
                              {booking.status === 'pending'
                                ? 'Pending'
                                : booking.status === 'confirmed'
                                  ? 'Confirmed'
                                  : 'Cancelled'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-[#50C878]" />
                            Court: {(booking.courts as any)?.name || 'Unknown'}
                          </p>
                        </div>
                        {canCancel && (
                          <CancelBookingButton bookingId={booking.id} />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 bg-gradient-to-br from-white to-[#50C878]/5 rounded-xl p-4 border border-gray-200">
                          <div className="w-10 h-10 rounded-lg bg-[#50C878] flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#2D5B4A] uppercase tracking-wide">Date</p>
                            <p className="font-bold text-gray-900">
                              {format(parseISO(booking.start_time), 'EEEE, MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gradient-to-br from-white to-[#50C878]/5 rounded-xl p-4 border border-gray-200">
                          <div className="w-10 h-10 rounded-lg bg-[#50C878] flex items-center justify-center">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#2D5B4A] uppercase tracking-wide">Time</p>
                            <p className="font-bold text-gray-900">
                              {format(parseISO(booking.start_time), 'h:mm a')} -{' '}
                              {format(parseISO(booking.end_time), 'h:mm a')}
                            </p>
                            <p className="text-sm text-[#50C878] font-medium">
                              {formatDuration(
                                differenceInMinutes(
                                  parseISO(booking.end_time),
                                  parseISO(booking.start_time)
                                )
                              )}
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
    </div>
  )
}

