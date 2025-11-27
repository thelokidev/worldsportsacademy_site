'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import {
  CreditCard,
  AlertTriangle,
  Clock,
  RefreshCcw,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react'

interface PaymentMetrics {
  totals: {
    totalPayments: number
    succeededPayments: number
    failedPayments: number
    successRate: number
  }
  processing: {
    averageProcessingMs: number | null
  }
  refunds: {
    totalCount: number
    totalAmount: number
    pendingCount: number
  }
  events: Array<{
    id: string
    type: string
    status: string
    created_at: string
    error_message: string | null
  }>
  lastUpdated?: string
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  isLoading 
}: {
  title: string
  value: string
  icon: React.ElementType
  description?: string
  trend?: { value: number; isPositive: boolean } | null
  isLoading?: boolean
}) {
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
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-[#50C878]/50 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-[#50C878]/10">
          <Icon className="h-4 w-4 text-[#50C878]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-[#50C878]' : 'text-red-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last period
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatDuration(value: number | null) {
  if (value === null) return 'N/A'
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(1)} s`
}

export function LivePaymentMetrics({ initialMetrics }: { initialMetrics?: PaymentMetrics }) {
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(initialMetrics || null)
  const [isLoading, setIsLoading] = useState(!initialMetrics)
  const [error, setError] = useState<string | null>(null)
  const channelsRef = useRef<RealtimeChannel[]>([])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/payment-metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics({ ...data, lastUpdated: new Date().toISOString() })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()

    const supabase = createClient()

    // Subscribe to payments changes
    const paymentsChannel = supabase
      .channel('admin-payment-metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchMetrics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_events' },
        () => fetchMetrics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_refunds' },
        () => fetchMetrics()
      )
      .subscribe()

    channelsRef.current = [paymentsChannel]

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000)

    return () => {
      clearInterval(interval)
      channelsRef.current.forEach(channel => supabase.removeChannel(channel))
    }
  }, [fetchMetrics])

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-800">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">Failed to load payment metrics</span>
          <button 
            onClick={fetchMetrics}
            className="ml-auto text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            Payments Monitoring
            <div className="h-2 w-2 rounded-full bg-[#50C878] animate-pulse" />
          </h2>
          <p className="text-sm text-gray-400">
            Track payment reliability, processing time, and refund queue health.
          </p>
        </div>
        {metrics?.lastUpdated && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(metrics.lastUpdated), { addSuffix: true })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Success Rate"
          value={`${metrics?.totals.successRate || 0}%`}
          icon={CreditCard}
          trend={{
            value: metrics?.totals.successRate || 0,
            isPositive: (metrics?.totals.successRate || 0) >= 90,
          }}
          description={`${metrics?.totals.succeededPayments || 0}/${metrics?.totals.totalPayments || 0} payments`}
          isLoading={isLoading}
        />
        <MetricCard
          title="Failed Payments"
          value={(metrics?.totals.failedPayments || 0).toString()}
          icon={AlertTriangle}
          trend={{
            value: metrics?.totals.failedPayments || 0,
            isPositive: (metrics?.totals.failedPayments || 0) === 0,
          }}
          description="Last 30 days"
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg Processing"
          value={formatDuration(metrics?.processing.averageProcessingMs ?? null)}
          icon={Clock}
          description="Creation to completion"
          isLoading={isLoading}
        />
        <MetricCard
          title="Refund Volume"
          value={formatCurrency(metrics?.refunds.totalAmount || 0)}
          icon={RefreshCcw}
          trend={{
            value: metrics?.refunds.pendingCount || 0,
            isPositive: (metrics?.refunds.pendingCount || 0) === 0,
          }}
          description={`${metrics?.refunds.pendingCount || 0} pending`}
          isLoading={isLoading}
        />
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            Recent Payment Events
            <div className="h-2 w-2 rounded-full bg-[#50C878] animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-gray-800 rounded-lg" />
              ))}
            </div>
          ) : !metrics?.events?.length ? (
            <p className="text-sm text-gray-500 text-center py-4">No payment events recorded.</p>
          ) : (
            metrics.events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-800 rounded-lg px-4 py-3 bg-black/20 hover:bg-black/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold capitalize text-gray-200">
                    {event.type.replace(/\./g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-xs font-medium uppercase tracking-wide mt-2 md:mt-0">
                  <Badge
                    className={`border-0 ${
                      event.status === 'processed'
                        ? 'bg-[#50C878]/20 text-[#50C878]'
                        : event.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {event.status === 'processed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {event.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                    {event.status}
                  </Badge>
                </div>
                {event.error_message && (
                  <p className="text-xs text-red-400 mt-2 md:mt-0 md:max-w-sm truncate">
                    {event.error_message}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

