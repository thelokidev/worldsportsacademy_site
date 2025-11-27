import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCard } from '@/components/features/admin/analytics-card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, RefreshCcw } from 'lucide-react'
import { format } from 'date-fns'

interface MembershipWithPlan {
  id: string
  status: string
  current_period_start: string
  current_period_end: string
  created_at: string
  membership_plans: {
    name: string
    price: number
    billing_interval: string
  } | null
}

interface Payment {
  id: string
  amount: number
  status: string
  payment_type: string
  created_at: string
}

async function getRevenueStats() {
  const supabase = await createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  // Get all drop-in payments (this month)
  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('id, amount, payment_type, status, created_at')
    .eq('status', 'succeeded')
    .gte('created_at', startOfMonth)

  // Get all drop-in payments (last month)
  const { data: lastMonthPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'succeeded')
    .gte('created_at', startOfLastMonth)
    .lt('created_at', endOfLastMonth)

  // Get active memberships with plan prices to calculate MRR
  const { data: activeMemberships } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      current_period_start,
      current_period_end,
      created_at,
      membership_plans:plan_id (
        name,
        price,
        billing_interval
      )
    `)
    .eq('status', 'active')
    .gt('current_period_end', new Date().toISOString())

  // Get memberships created this month (new subscriptions)
  const { data: newMembershipsThisMonth } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      created_at,
      membership_plans:plan_id (
        name,
        price
      )
    `)
    .gte('created_at', startOfMonth)

  // Get memberships created last month
  const { data: newMembershipsLastMonth } = await supabase
    .from('memberships')
    .select(`
      id,
      membership_plans:plan_id (
        price
      )
    `)
    .gte('created_at', startOfLastMonth)
    .lt('created_at', endOfLastMonth)

  // Get refunded payments
  const { data: refundedPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'refunded')
    .gte('created_at', startOfMonth)

  // Calculate drop-in revenue
  const dropInRevenue = monthlyPayments
    ?.filter(p => p.payment_type === 'drop_in')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const lastMonthDropInRevenue = lastMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Calculate Monthly Recurring Revenue (MRR) from active memberships
  const monthlyRecurringRevenue = (activeMemberships as MembershipWithPlan[] || []).reduce((sum, m) => {
    if (m.membership_plans?.price) {
      const price = Number(m.membership_plans.price)
      // Convert yearly to monthly if needed
      if (m.membership_plans.billing_interval === 'year') {
        return sum + (price / 12)
      }
      return sum + price
    }
    return sum
  }, 0)

  // Calculate new membership revenue this month (one-time acquisition)
  const newMembershipRevenueThisMonth = (newMembershipsThisMonth as MembershipWithPlan[] || []).reduce((sum, m) => {
    if (m.membership_plans?.price) {
      return sum + Number(m.membership_plans.price)
    }
    return sum
  }, 0)

  const newMembershipRevenueLastMonth = (newMembershipsLastMonth as any[] || []).reduce((sum, m) => {
    if (m.membership_plans?.price) {
      return sum + Number(m.membership_plans.price)
    }
    return sum
  }, 0)

  // Total monthly revenue = MRR + Drop-in revenue
  const totalMonthlyRevenue = monthlyRecurringRevenue + dropInRevenue
  const totalLastMonthRevenue = newMembershipRevenueLastMonth + lastMonthDropInRevenue

  // Calculate growth
  const growth = totalLastMonthRevenue > 0
    ? ((totalMonthlyRevenue - totalLastMonthRevenue) / totalLastMonthRevenue) * 100
    : totalMonthlyRevenue > 0 ? 100 : 0

  // Total refunds
  const totalRefunds = refundedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Membership breakdown by plan
  const membershipBreakdown = (activeMemberships as MembershipWithPlan[] || []).reduce((acc, m) => {
    const planName = m.membership_plans?.name || 'Unknown Plan'
    const price = Number(m.membership_plans?.price || 0)
    if (!acc[planName]) {
      acc[planName] = { count: 0, revenue: 0 }
    }
    acc[planName].count += 1
    acc[planName].revenue += price
    return acc
  }, {} as Record<string, { count: number; revenue: number }>)

  return {
    totalMonthlyRevenue,
    monthlyRecurringRevenue,
    dropInRevenue,
    newMembershipRevenueThisMonth,
    totalLastMonthRevenue,
    growth,
    totalRefunds,
    activeMembershipCount: (activeMemberships?.length || 0),
    newMembershipsThisMonthCount: (newMembershipsThisMonth?.length || 0),
    membershipBreakdown,
    recentPayments: monthlyPayments || [],
  }
}

export default async function AdminRevenuePage() {
  const stats = await getRevenueStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Revenue Analytics</h1>
        <p className="text-gray-400">Track membership subscriptions, drop-in payments, and financial performance</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Monthly Revenue"
          value={`$${stats.totalMonthlyRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={stats.growth !== 0 ? {
            value: Math.abs(Number(stats.growth.toFixed(1))),
            isPositive: stats.growth > 0,
          } : null}
          description="MRR + Drop-in"
        />
        <AnalyticsCard
          title="Monthly Recurring Revenue"
          value={`$${stats.monthlyRecurringRevenue.toFixed(2)}`}
          icon={RefreshCcw}
          trend={null}
          description={`${stats.activeMembershipCount} active memberships`}
        />
        <AnalyticsCard
          title="Drop-In Revenue"
          value={`$${stats.dropInRevenue.toFixed(2)}`}
          icon={CreditCard}
          trend={null}
          description="One-time bookings"
        />
        <AnalyticsCard
          title="Growth"
          value={`${stats.growth > 0 ? '+' : ''}${stats.growth.toFixed(1)}%`}
          icon={TrendingUp}
          trend={stats.growth !== 0 ? {
            value: Math.abs(Number(stats.growth.toFixed(1))),
            isPositive: stats.growth > 0,
          } : null}
          description="vs last month"
        />
      </div>

      {/* Membership & Drop-in Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#50C878]" />
              Membership Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.membershipBreakdown).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active memberships</p>
              ) : (
                Object.entries(stats.membershipBreakdown).map(([planName, data]) => (
                  <div key={planName} className="flex items-center justify-between p-3 bg-[#50C878]/10 border border-[#50C878]/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{planName}</p>
                      <p className="text-xs text-gray-400">{data.count} active subscriber{data.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#50C878]">${data.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">/month</p>
                    </div>
                  </div>
                ))
              )}
              
              <div className="pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Total MRR</span>
                  <span className="text-xl font-bold text-[#50C878]">${stats.monthlyRecurringRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-400" />
              Drop-In & One-Time Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-200">Drop-In Bookings</p>
                  <p className="text-xs text-gray-400">Non-member court bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">${stats.dropInRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">this month</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-200">New Subscriptions</p>
                  <p className="text-xs text-gray-400">{stats.newMembershipsThisMonthCount} new member{stats.newMembershipsThisMonthCount !== 1 ? 's' : ''} this month</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-400">${stats.newMembershipRevenueThisMonth.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">first payment</p>
                </div>
              </div>

              {stats.totalRefunds > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-200">Refunds</p>
                    <p className="text-xs text-gray-400">This month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-400">-${stats.totalRefunds.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#50C878]" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">This Month Total</p>
              <p className="text-2xl font-bold text-white">${stats.totalMonthlyRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">MRR + Drop-in</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Last Month Total</p>
              <p className="text-2xl font-bold text-white">${stats.totalLastMonthRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Growth Rate</p>
              <p className={`text-2xl font-bold ${stats.growth > 0 ? 'text-[#50C878]' : stats.growth < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {stats.growth > 0 ? '+' : ''}{stats.growth.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Net Change</p>
              <p className={`text-2xl font-bold ${(stats.totalMonthlyRevenue - stats.totalLastMonthRevenue) >= 0 ? 'text-[#50C878]' : 'text-red-500'}`}>
                {stats.totalMonthlyRevenue - stats.totalLastMonthRevenue >= 0 ? '+' : ''}
                ${(stats.totalMonthlyRevenue - stats.totalLastMonthRevenue).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#50C878]" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payments this month</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPayments.slice(0, 10).map((payment: Payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${payment.status === 'succeeded' ? 'bg-[#50C878]' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-200 capitalize">
                        {payment.payment_type.replace('_', ' ')} Payment
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${payment.status === 'succeeded' ? 'bg-[#50C878]/20 text-[#50C878]' : 'bg-red-500/20 text-red-400'}`}>
                      {payment.status}
                    </Badge>
                    <span className="text-lg font-bold text-white">${Number(payment.amount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
