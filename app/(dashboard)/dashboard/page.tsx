import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut } from '@/server/actions/auth'
import { getUpcomingBookings } from '@/server/queries/bookings'
import Link from 'next/link'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      redirect('/signin')
    }

    let upcomingBookings = []
    try {
      upcomingBookings = await getUpcomingBookings(user.id)
    } catch (bookingError) {
      console.error('Failed to fetch upcoming bookings:', bookingError)
      // Continue with empty bookings array
    }

    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] pt-24 pb-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-white/90">Welcome back, {user?.email?.split('@')[0] || 'User'}!</p>
              </div>
              <form action={signOut}>
                <Button 
                  variant="outline" 
                  type="submit"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Welcome Card */}
            <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                <CardTitle className="text-[#2D5B4A] text-2xl">Welcome back!</CardTitle>
                <CardDescription className="text-gray-600">
                  You are signed in as {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Book a court session for your favorite sport. Get unlimited access with a membership.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    asChild
                    className="bg-[#50C878] hover:bg-[#50C878]/90 text-white"
                  >
                    <Link href="/bookings">Book a Court</Link>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    className="border-2 border-gray-300 text-[#2D5B4A] hover:bg-gray-50"
                  >
                    <Link href="/memberships">View Memberships</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#2D5B4A] text-2xl">Upcoming Bookings</CardTitle>
                  {upcomingBookings.length > 0 && (
                    <Link href="/dashboard/bookings">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[#50C878] hover:text-[#50C878]/80 hover:bg-[#50C878]/10"
                      >
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      No upcoming bookings
                    </p>
                    <Button 
                      asChild 
                      className="bg-[#50C878] hover:bg-[#50C878]/90 text-white"
                    >
                      <Link href="/bookings">Book Now</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 3).map((booking: any) => (
                      <div
                        key={booking.id}
                        className="border-2 border-gray-200 rounded-xl p-4 space-y-3 hover:border-[#50C878]/50 transition-colors bg-gradient-to-br from-white to-[#50C878]/5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-[#2D5B4A]">
                              {(booking.sports as any)?.display_name || 'Sport'}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {(booking.courts as any)?.name || 'Court'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                            <Calendar className="h-4 w-4 text-[#50C878]" />
                            <span className="font-medium text-gray-900">
                              {format(parseISO(booking.start_time), 'MMM d')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                            <Clock className="h-4 w-4 text-[#50C878]" />
                            <span className="font-medium text-gray-900">
                              {format(parseISO(booking.start_time), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    redirect('/signin')
  }
}