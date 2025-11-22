import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllBookings } from '@/server/queries/bookings'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, X, CalendarDays, ArrowRight } from 'lucide-react'
import { format, parseISO, differenceInMinutes, isPast, isFuture } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { CancelBookingButton } from '@/components/features/booking/cancel-booking-button'
import { formatDuration } from '@/lib/utils/duration'
import Link from 'next/link'

// Facility timezone - must match the timezone used in server/actions/bookings.ts
const FACILITY_TIMEZONE = 'America/Chicago'

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?redirect=/dashboard/bookings')
  }

  const bookings = await getAllBookings(user.id)
  
  // Separate bookings by status
  const upcomingBookings = bookings.filter((b: any) => 
    isFuture(parseISO(b.start_time)) && b.status !== 'cancelled'
  )
  const pastBookings = bookings.filter((b: any) => 
    isPast(parseISO(b.start_time)) && b.status !== 'cancelled'
  )
  const cancelledBookings = bookings.filter((b: any) => 
    b.status === 'cancelled'
  )

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] pt-32 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">My Bookings</h1>
              <p className="text-white/90 text-lg">
                View and manage your court bookings
              </p>
            </div>
            <Button 
              asChild
              className="bg-white text-[#2D5B4A] hover:bg-white/90 font-semibold rounded-xl px-6 py-6 h-auto shadow-lg"
            >
              <Link href="/bookings" className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Book Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bookings.length === 0 ? (
          <Card className="border border-gray-800 bg-black/50 backdrop-blur-xl shadow-2xl">
            <CardContent className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#50C878]/10 mb-6">
                <Calendar className="w-10 h-10 text-[#50C878]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Bookings Yet</h3>
              <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                Start your training journey by booking your first court session
              </p>
              <Button 
                asChild
                className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold rounded-xl px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Link href="/bookings" className="flex items-center gap-2">
                  Book a Court
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#50C878] rounded-full"></div>
                  Upcoming Bookings
                </h2>
                <div className="grid gap-4">
                  {upcomingBookings.map((booking: any) => {
                    const isCancelled = booking.status === 'cancelled'
                    const canCancel = !isCancelled

                    return (
                      <Card 
                        key={booking.id}
                        className="group relative overflow-hidden border border-gray-800 bg-black/50 backdrop-blur-xl hover:border-[#50C878]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#50C878]/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#50C878]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CardContent className="relative p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-2xl font-bold text-white">
                                  {(booking.sports as any)?.display_name || 'Sport'}
                                </h3>
                                <Badge
                                  className={
                                    booking.status === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                      : 'bg-[#50C878]/20 text-[#50C878] border-[#50C878]/30'
                                  }
                                  variant="outline"
                                  className="px-3 py-1 font-semibold"
                                >
                                  {booking.status === 'pending' ? 'Pending' : 'Confirmed'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="h-4 w-4 text-[#50C878]" />
                                <span className="text-sm">{(booking.courts as any)?.name || 'Unknown Court'}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="text-base font-bold text-white">
                                      {format(toZonedTime(parseISO(booking.start_time), FACILITY_TIMEZONE), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Time</p>
                                    <p className="text-base font-bold text-white">
                                      {format(toZonedTime(parseISO(booking.start_time), FACILITY_TIMEZONE), 'h:mm a')} - {format(toZonedTime(parseISO(booking.end_time), FACILITY_TIMEZONE), 'h:mm a')}
                                    </p>
                                    <p className="text-sm text-[#50C878] font-medium mt-1">
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
                            </div>
                            
                            {canCancel && (
                              <div className="flex-shrink-0">
                                <CancelBookingButton bookingId={booking.id} />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-600 rounded-full"></div>
                  Past Bookings
                </h2>
                <div className="grid gap-4">
                  {pastBookings.map((booking: any) => (
                    <Card 
                      key={booking.id}
                      className="border border-gray-800 bg-black/30 backdrop-blur-xl opacity-75"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-white">
                                {(booking.sports as any)?.display_name || 'Sport'}
                              </h3>
                              <Badge
                                className="bg-gray-700/50 text-gray-400 border-gray-700"
                                variant="outline"
                              >
                                Completed
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{(booking.courts as any)?.name || 'Unknown Court'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                                  <Calendar className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                  <p className="text-sm font-medium text-gray-400">
                                    {format(toZonedTime(parseISO(booking.start_time), FACILITY_TIMEZONE), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                                  <Clock className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time</p>
                                  <p className="text-sm font-medium text-gray-400">
                                    {format(toZonedTime(parseISO(booking.start_time), FACILITY_TIMEZONE), 'h:mm a')} - {format(toZonedTime(parseISO(booking.end_time), FACILITY_TIMEZONE), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Bookings */}
            {cancelledBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  Cancelled Bookings
                </h2>
                <div className="grid gap-4">
                  {cancelledBookings.map((booking: any) => (
                    <Card 
                      key={booking.id}
                      className="border border-red-900/50 bg-black/30 backdrop-blur-xl opacity-60"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-white">
                                {(booking.sports as any)?.display_name || 'Sport'}
                              </h3>
                              <Badge
                                className="bg-red-500/20 text-red-400 border-red-500/30"
                                variant="outline"
                              >
                                Cancelled
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{(booking.courts as any)?.name || 'Unknown Court'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                                  <Calendar className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                  <p className="text-sm font-medium text-gray-400">
                                    {format(toZonedTime(parseISO(booking.start_time), FACILITY_TIMEZONE), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                                  <Clock className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time</p>
                                  <p className="text-sm font-medium text-gray-400">
                                    {format(toZonedTime(parseISO(booking.start_time), FACILITY_TIMEZONE), 'h:mm a')} - {format(toZonedTime(parseISO(booking.end_time), FACILITY_TIMEZONE), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

