import { AnalyticsCard } from '@/components/features/admin/analytics-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PaymentMetrics } from '@/lib/payments/metrics'
import { AlertTriangle, Clock, CreditCard, RefreshCcw } from 'lucide-react'

type PaymentMetricsGridProps = {
  metrics: PaymentMetrics
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

const formatDuration = (value: number | null) => {
  if (value === null) {
    return 'N/A'
  }
  if (value < 1000) {
    return `${value} ms`
  }
  const seconds = value / 1000
  return `${seconds.toFixed(1)} s`
}

export const PaymentMetricsGrid = ({ metrics }: PaymentMetricsGridProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Success Rate"
          value={`${metrics.totals.successRate}%`}
          icon={CreditCard}
          trend={{
            value: metrics.totals.successRate,
            isPositive: metrics.totals.successRate >= 90,
          }}
          description={`${metrics.totals.succeededPayments}/${metrics.totals.totalPayments} payments`}
        />
        <AnalyticsCard
          title="Failed Payments"
          value={metrics.totals.failedPayments.toString()}
          icon={AlertTriangle}
          trend={{
            value: metrics.totals.failedPayments,
            isPositive: metrics.totals.failedPayments === 0,
          }}
          description="Last 30 days"
        />
        <AnalyticsCard
          title="Avg Processing"
          value={formatDuration(metrics.processing.averageProcessingMs)}
          icon={Clock}
          trend={null}
          description="Creation to completion"
        />
        <AnalyticsCard
          title="Refund Volume"
          value={formatCurrency(metrics.refunds.totalAmount)}
          icon={RefreshCcw}
          trend={{
            value: metrics.refunds.pendingCount,
            isPositive: metrics.refunds.pendingCount === 0,
          }}
          description={`${metrics.refunds.pendingCount} pending`}
        />
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Recent Payment Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.events.length === 0 && (
            <p className="text-sm text-gray-500">No payment events recorded.</p>
          )}
          {metrics.events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-800 rounded-lg px-4 py-3 bg-black/20 hover:bg-black/40 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold capitalize text-gray-200">{event.type.replace(/\./g, ' ')}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-xs font-medium uppercase tracking-wide mt-2 md:mt-0">
                <span
                  className={`px-2 py-1 rounded-full ${event.status === 'processed'
                      ? 'bg-[#50C878]/20 text-[#50C878]'
                      : event.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                >
                  {event.status}
                </span>
              </div>
              {event.error_message && (
                <p className="text-xs text-red-400 mt-2 md:mt-0 md:max-w-sm">{event.error_message}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

