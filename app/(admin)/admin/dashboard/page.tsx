import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCard } from '@/components/features/admin/analytics-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react'

async function getDashboardStats() {
  const supabase = await createClient()
  const now = new Date()
  const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Today's bookings
  const { count: todayBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', startOfToday)
    .eq('status', 'confirmed')

  // Active memberships
  const { count: activeMembers } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gt('current_period_end', new Date().toISOString())

  // Monthly revenue
  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'succeeded')
    .gte('created_at', startOfMonth)

  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Total bookings this month
  const { count: monthlyBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', startOfMonth)
    .eq('status', 'confirmed')

  return {
    todayBookings: todayBookings || 0,
    activeMembers: activeMembers || 0,
    monthlyRevenue,
    monthlyBookings: monthlyBookings || 0,
  }
}

async function getRecentActivity() {
  const supabase = await createClient()

  // Recent bookings (last 5)
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      status,
      created_at,
      sports:sport_id (
        display_name
      ),
      courts:court_id (
        name
      ),
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent memberships (last 5)
  const { data: recentMemberships } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      created_at,
      membership_plans:plan_id (
        name
      ),
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    bookings: recentBookings || [],
    memberships: recentMemberships || [],
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  const activity = await getRecentActivity()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Today's Bookings"
          value={stats.todayBookings.toString()}
          icon={Calendar}
          trend={null}
        />
        <AnalyticsCard
          title="Active Members"
          value={stats.activeMembers.toString()}
          icon={Users}
          trend={null}
        />
        <AnalyticsCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={null}
        />
        <AnalyticsCard
          title="Monthly Bookings"
          value={stats.monthlyBookings.toString()}
          icon={TrendingUp}
          trend={null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/bookings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.bookings.length === 0 && activity.memberships.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <>
                  {/* Recent Bookings */}
                  {activity.bookings.slice(0, 3).map((booking: any) => (
                    <div key={booking.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {booking.profiles?.full_name || booking.profiles?.email}
                        </p>
                        <p className="text-xs text-gray-600">
                          Booked {booking.sports?.display_name} - {booking.courts?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(booking.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {/* Recent Memberships */}
                  {activity.memberships.slice(0, 2).map((membership: any) => (
                    <div key={membership.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {membership.profiles?.full_name || membership.profiles?.email}
                        </p>
                        <p className="text-xs text-gray-600">
                          Joined {membership.membership_plans?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(membership.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge variant="default" className="text-xs bg-green-600">
                        {membership.status}
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/bookings">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Bookings
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/memberships">
                <Users className="h-4 w-4 mr-2" />
                View Memberships
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/courts">
                <MapPin className="h-4 w-4 mr-2" />
                Manage Courts
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/members">
                <Shield className="h-4 w-4 mr-2" />
                Manage Members
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/revenue">
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

