import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCard } from '@/components/features/admin/analytics-card'
import { PaymentMetricsGrid } from '@/components/features/admin/payment-metrics-grid'
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
import { getPaymentMetrics } from '@/lib/payments/metrics'

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

  // Recent bookings (last 5) - fetch without profile join
  const { data: recentBookingsRaw } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      status,
      created_at,
      user_id,
      sports:sport_id (
        display_name
      ),
      courts:court_id (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent memberships (last 5) - fetch without profile join
  const { data: recentMembershipsRaw } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      created_at,
      user_id,
      membership_plans:plan_id (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Collect all unique user IDs from both queries
  const bookingUserIds = recentBookingsRaw?.map(b => b.user_id).filter(Boolean) || []
  const membershipUserIds = recentMembershipsRaw?.map(m => m.user_id).filter(Boolean) || []
  const allUserIds = [...new Set([...bookingUserIds, ...membershipUserIds])]

  // Fetch profiles for all users in one query
  let profileMap = new Map<string, { full_name: string | null }>()
  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', allUserIds)
    
    profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || [])
  }

  // Combine data with profiles
  const recentBookings = (recentBookingsRaw || []).map(booking => ({
    ...booking,
    profiles: profileMap.get(booking.user_id) || null
  }))

  const recentMemberships = (recentMembershipsRaw || []).map(membership => ({
    ...membership,
    profiles: profileMap.get(membership.user_id) || null
  }))

  return {
    bookings: recentBookings,
    memberships: recentMemberships,
  }
}

export default async function AdminDashboardPage() {
  const [stats, activity, paymentMetrics] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getPaymentMetrics(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome to the admin dashboard</p>
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
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-[#50C878]" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-[#50C878] hover:text-[#50C878] hover:bg-[#50C878]/10" asChild>
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
                    <div key={booking.id} className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-200">
                          {booking.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Booked {booking.sports?.display_name} - {booking.courts?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(booking.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0">
                        {booking.status}
                      </Badge>
                    </div>
                  ))}

                  {/* Recent Memberships */}
                  {activity.memberships.slice(0, 2).map((membership: any) => (
                    <div key={membership.id} className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[#50C878]/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-[#50C878]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-200">
                          {membership.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {membership.membership_plans?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(membership.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge variant="default" className="text-xs bg-[#50C878]/20 text-[#50C878] hover:bg-[#50C878]/30 border-0">
                        {membership.status}
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-[#50C878]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
              <Link href="/admin/bookings">
                <Calendar className="h-4 w-4 mr-2 text-[#50C878]" />
                Manage Bookings
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
              <Link href="/admin/memberships">
                <Users className="h-4 w-4 mr-2 text-[#50C878]" />
                View Memberships
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
              <Link href="/admin/courts">
                <MapPin className="h-4 w-4 mr-2 text-[#50C878]" />
                Manage Courts
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
              <Link href="/admin/members">
                <Shield className="h-4 w-4 mr-2 text-[#50C878]" />
                Manage Members
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
              <Link href="/admin/revenue">
                <DollarSign className="h-4 w-4 mr-2 text-[#50C878]" />
                Revenue Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Payments Monitoring</h2>
          <p className="text-sm text-gray-400">
            Track payment reliability, processing time, and refund queue health.
          </p>
        </div>
        <PaymentMetricsGrid metrics={paymentMetrics} />
      </div>
    </div>
  )
}

