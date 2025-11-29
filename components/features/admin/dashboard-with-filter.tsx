'use client'

import { useState, useCallback, useTransition } from 'react'
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
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { DateRangeFilter, DateRange } from './date-range-filter'
import { getDashboardStats, getDashboardActivity, getFilteredPaymentMetrics } from '@/server/actions/admin-dashboard'
import { LiveStatsGrid } from './live-stats-grid'
import { LiveActivityFeed } from './live-activity-feed'
import { LiveCourtStatus } from './live-court-status'
import { FilteredPaymentMetrics } from './filtered-payment-metrics'
import { format } from 'date-fns'

interface DashboardWithFilterProps {
  initialStats: {
    todayBookings: number
    activeMembers: number
    monthlyRevenue: number
    monthlyBookings: number
  }
  initialActivity: {
    bookings: any[]
    memberships: any[]
  }
  initialPaymentMetrics: any
}

export function DashboardWithFilter({
  initialStats,
  initialActivity,
  initialPaymentMetrics,
}: DashboardWithFilterProps) {
  const [isPending, startTransition] = useTransition()
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [stats, setStats] = useState(initialStats)
  const [activity, setActivity] = useState(initialActivity)
  const [paymentMetrics, setPaymentMetrics] = useState(initialPaymentMetrics)

  const handleDateChange = useCallback((range: DateRange | null) => {
    setDateRange(range)
    
    startTransition(async () => {
      try {
        const dateFilter = range ? {
          from: range.from.toISOString(),
          to: range.to.toISOString(),
        } : undefined

        const [newStats, newActivity, newPaymentMetrics] = await Promise.all([
          getDashboardStats(dateFilter),
          getDashboardActivity(dateFilter),
          getFilteredPaymentMetrics(dateFilter),
        ])

        setStats({
          todayBookings: newStats.todayBookings,
          activeMembers: newStats.activeMembers,
          monthlyRevenue: newStats.periodRevenue,
          monthlyBookings: newStats.periodBookings,
        })
        setActivity(newActivity)
        setPaymentMetrics(newPaymentMetrics)
      } catch (error) {
        console.error('Failed to fetch filtered data:', error)
      }
    })
  }, [])

  const handleRefresh = useCallback(() => {
    handleDateChange(dateRange)
  }, [dateRange, handleDateChange])

  const periodLabel = dateRange ? dateRange.label : 'This Month'

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-400">
            Real-time insights into your sports academy
            {dateRange && (
              <span className="text-[#50C878]"> • Filtered: {dateRange.label}</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <DateRangeFilter
            value={dateRange}
            onChange={handleDateChange}
            className="w-full sm:w-auto"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#50C878]/10 border border-[#50C878]/30">
            <div className={`h-2 w-2 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-[#50C878]'} ${isPending ? '' : 'animate-pulse'}`} />
            <span className="text-xs text-[#50C878] font-medium">
              {isPending ? 'Loading...' : 'Live Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <LiveStatsGrid 
          initialStats={stats} 
          periodLabel={periodLabel}
        />
      </div>

      {/* Main Content Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {/* Activity Feed */}
        <LiveActivityFeed 
          initialActivity={activity}
          periodLabel={periodLabel}
        />

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

      {/* Court Status */}
      <LiveCourtStatus />

      {/* Payment Metrics */}
      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <FilteredPaymentMetrics 
          metrics={paymentMetrics}
          periodLabel={periodLabel}
        />
      </div>
    </div>
  )
}

