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
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action={signOut}>
          <Button variant="outline" type="submit">
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>
              You are signed in as {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Book a court session for your favorite sport.
            </p>
            <Button asChild>
              <Link href="/bookings">Book a Court</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              {upcomingBookings.length > 0 && (
                <Link href="/dashboard/bookings">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  No upcoming bookings
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/bookings">Book Now</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking: any) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {(booking.sports as any)?.display_name || 'Sport'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {(booking.courts as any)?.name || 'Court'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parseISO(booking.start_time), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
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
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    redirect('/signin')
  }
}