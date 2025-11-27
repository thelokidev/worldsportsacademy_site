import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Calendar,
  Users,
  MapPin,
  Shield,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { LiveStatsGrid } from '@/components/features/admin/live-stats-grid'
import { LiveActivityFeed } from '@/components/features/admin/live-activity-feed'
import { LiveCourtStatus } from '@/components/features/admin/live-court-status'
import { LivePaymentMetrics } from '@/components/features/admin/live-payment-metrics'
import { getPaymentMetrics } from '@/lib/payments/metrics'

async function getInitialDashboardData() {
  const supabase = await createClient()
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Fetch all initial data in parallel
  const [
    { count: todayBookings },
    { count: activeMembers },
    { data: monthlyPayments },
    { count: monthlyBookings },
    { data: recentBookingsRaw },
    { data: recentMembershipsRaw },
    paymentMetrics,
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', startOfToday)
      .eq('status', 'confirmed'),
    supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString()),
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'succeeded')
      .gte('created_at', startOfMonth),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', startOfMonth)
      .eq('status', 'confirmed'),
    supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        status,
        created_at,
        user_id,
        booking_type,
        payment_status,
        sports:sport_id (
          display_name
        ),
        courts:court_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('memberships')
      .select(`
        id,
        status,
        created_at,
        user_id,
        current_period_end,
        membership_plans:plan_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    getPaymentMetrics(),
  ])

  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Fetch profiles for recent activity
  const bookingUserIds = recentBookingsRaw?.map(b => b.user_id).filter(Boolean) || []
  const membershipUserIds = recentMembershipsRaw?.map(m => m.user_id).filter(Boolean) || []
  const allUserIds = [...new Set([...bookingUserIds, ...membershipUserIds])]

  let profileMap = new Map<string, { full_name: string | null }>()
  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', allUserIds)
    
    profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || [])
  }

  const recentBookings = (recentBookingsRaw || []).map(booking => ({
    ...booking,
    profiles: profileMap.get(booking.user_id!) || null
  }))

  const recentMemberships = (recentMembershipsRaw || []).map(membership => ({
    ...membership,
    profiles: profileMap.get(membership.user_id!) || null
  }))

  return {
    stats: {
      todayBookings: todayBookings || 0,
      activeMembers: activeMembers || 0,
      monthlyRevenue,
      monthlyBookings: monthlyBookings || 0,
    },
    activity: {
      bookings: recentBookings,
      memberships: recentMemberships,
    },
    paymentMetrics,
  }
}

export default async function AdminDashboardPage() {
  const initialData = await getInitialDashboardData()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Real-time insights into your sports academy</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#50C878]/10 border border-[#50C878]/30">
            <div className="h-2 w-2 rounded-full bg-[#50C878] animate-pulse" />
            <span className="text-xs text-[#50C878] font-medium">Live Data</span>
          </div>
        </div>
      </div>

      {/* Live Stats Grid */}
      <LiveStatsGrid initialStats={initialData.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Feed */}
        <LiveActivityFeed initialActivity={initialData.activity} />

        {/* Quick Actions */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-[#50C878]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" asChild>
              <Link href="/admin/bookings">
                <Calendar className="h-4 w-4 mr-2 text-[#50C878]" />
                Manage Bookings
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" asChild>
              <Link href="/admin/memberships">
                <Users className="h-4 w-4 mr-2 text-[#50C878]" />
                View Memberships
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" asChild>
              <Link href="/admin/courts">
                <MapPin className="h-4 w-4 mr-2 text-[#50C878]" />
                Manage Courts
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" asChild>
              <Link href="/admin/members">
                <Shield className="h-4 w-4 mr-2 text-[#50C878]" />
                Manage Members
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" asChild>
              <Link href="/admin/revenue">
                <DollarSign className="h-4 w-4 mr-2 text-[#50C878]" />
                Revenue Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Court Status */}
      <LiveCourtStatus />

      {/* Live Payment Metrics */}
      <LivePaymentMetrics initialMetrics={initialData.paymentMetrics} />
    </div>
  )
}
