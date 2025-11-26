import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCard } from '@/components/features/admin/analytics-card'
import { DollarSign, TrendingUp } from 'lucide-react'

async function getRevenueStats() {
  const supabase = await createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  // This month's revenue
  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('amount, payment_type')
    .eq('status', 'succeeded')
    .gte('created_at', startOfMonth)

  // Last month's revenue
  const { data: lastMonthPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'succeeded')
    .gte('created_at', startOfLastMonth)
    .lt('created_at', endOfLastMonth)

  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const lastMonthRevenue = lastMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const membershipRevenue = monthlyPayments?.filter(p => p.payment_type === 'membership')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const dropInRevenue = monthlyPayments?.filter(p => p.payment_type === 'drop_in')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const growth = lastMonthRevenue > 0
    ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0

  return {
    monthlyRevenue,
    lastMonthRevenue,
    membershipRevenue,
    dropInRevenue,
    growth,
  }
}

export default async function AdminRevenuePage() {
  const stats = await getRevenueStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Revenue Analytics</h1>
        <p className="text-gray-400">Track revenue and financial performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={stats.growth !== 0 ? {
            value: Math.abs(stats.growth),
            isPositive: stats.growth > 0,
          } : null}
        />
        <AnalyticsCard
          title="Membership Revenue"
          value={`$${stats.membershipRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={null}
        />
        <AnalyticsCard
          title="Drop-In Revenue"
          value={`$${stats.dropInRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={null}
        />
        <AnalyticsCard
          title="Growth"
          value={`${stats.growth > 0 ? '+' : ''}${stats.growth.toFixed(1)}%`}
          icon={TrendingUp}
          trend={null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#50C878]/10 border border-[#50C878]/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-200">Membership Revenue</p>
                  <p className="text-xs text-gray-400">Monthly subscriptions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#50C878]">${stats.membershipRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    {stats.monthlyRevenue > 0
                      ? ((stats.membershipRevenue / stats.monthlyRevenue) * 100).toFixed(0)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-200">Drop-In Revenue</p>
                  <p className="text-xs text-gray-400">One-time bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">${stats.dropInRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    {stats.monthlyRevenue > 0
                      ? ((stats.dropInRevenue / stats.monthlyRevenue) * 100).toFixed(0)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">This Month</span>
                <span className="text-lg font-bold text-white">${stats.monthlyRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Last Month</span>
                <span className="text-lg font-bold text-white">${stats.lastMonthRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Growth Rate</span>
                <span className={`text-lg font-bold ${stats.growth > 0 ? 'text-[#50C878]' : stats.growth < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {stats.growth > 0 ? '+' : ''}{stats.growth.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Difference</span>
                <span className={`text-lg font-bold ${(stats.monthlyRevenue - stats.lastMonthRevenue) > 0 ? 'text-[#50C878]' : 'text-red-500'}`}>
                  {stats.monthlyRevenue - stats.lastMonthRevenue > 0 ? '+' : ''}
                  ${(stats.monthlyRevenue - stats.lastMonthRevenue).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

