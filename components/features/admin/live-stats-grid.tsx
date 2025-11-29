'use client'

import { useDashboardStats } from '@/hooks/use-admin-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface LiveStatCardProps {
  title: string
  value: string
  icon: React.ElementType
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  isLoading?: boolean
}

function LiveStatCard({ title, value, icon: Icon, description, trend, isLoading }: LiveStatCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24 bg-gray-800" />
          <Skeleton className="h-8 w-8 rounded-lg bg-gray-800" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 bg-gray-800 mb-2" />
          <Skeleton className="h-3 w-32 bg-gray-800" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-[#50C878]/50 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-[#50C878]/10 group-hover:bg-[#50C878]/20 transition-colors">
          <Icon className="h-4 w-4 text-[#50C878]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {description && (
          <p className={`text-xs mt-1 ${
            trend === 'up' ? 'text-[#50C878]' : 
            trend === 'down' ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface LiveStatsGridProps {
  initialStats?: {
    todayBookings: number
    activeMembers: number
    monthlyRevenue: number
    monthlyBookings: number
  }
  periodLabel?: string
  disableLiveUpdates?: boolean
}

export function LiveStatsGrid({ initialStats, periodLabel = 'This Month', disableLiveUpdates = false }: LiveStatsGridProps) {
  const { stats, isLoading, error, refetch } = useDashboardStats(
    initialStats ? {
      ...initialStats,
      totalMembers: 0,
      pendingBookings: 0,
      lastUpdated: new Date().toISOString(),
    } : undefined
  )

  // Use initialStats directly when live updates are disabled (filtered mode)
  const displayStats = disableLiveUpdates ? initialStats : stats

  if (error && !disableLiveUpdates) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="col-span-full bg-red-900/20 border-red-800">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400">Failed to load stats: {error}</span>
            <button 
              onClick={refetch}
              className="ml-auto text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isFiltered = periodLabel !== 'This Month'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isFiltered ? 'bg-blue-400' : 'bg-[#50C878] animate-pulse'}`} />
          <span className="text-xs text-gray-500">
            {isFiltered ? `Filtered: ${periodLabel}` : 'Live'}
          </span>
        </div>
        {displayStats && !isFiltered && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {formatDistanceToNow(new Date(), { addSuffix: true })}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <LiveStatCard
          title="Today's Bookings"
          value={displayStats?.todayBookings?.toString() || '0'}
          icon={Calendar}
          description="Confirmed bookings today"
          isLoading={isLoading && !disableLiveUpdates}
        />
        <LiveStatCard
          title="Active Members"
          value={displayStats?.activeMembers?.toString() || '0'}
          icon={Users}
          description="With active subscriptions"
          trend={displayStats && displayStats.activeMembers > 0 ? 'up' : 'neutral'}
          isLoading={isLoading && !disableLiveUpdates}
        />
        <LiveStatCard
          title={isFiltered ? 'Period Revenue' : 'Monthly Revenue'}
          value={`$${(displayStats?.monthlyRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          description={isFiltered ? periodLabel : "This month's earnings"}
          trend={displayStats && displayStats.monthlyRevenue > 0 ? 'up' : 'neutral'}
          isLoading={isLoading && !disableLiveUpdates}
        />
        <LiveStatCard
          title={isFiltered ? 'Period Bookings' : 'Monthly Bookings'}
          value={displayStats?.monthlyBookings?.toString() || '0'}
          icon={TrendingUp}
          description={isFiltered ? periodLabel : 'Total this month'}
          isLoading={isLoading && !disableLiveUpdates}
        />
      </div>
    </div>
  )
}

