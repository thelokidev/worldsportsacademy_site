import { getServiceSupabaseClient } from '@/lib/supabase/service'

type PaymentTotals = {
  totalPayments: number
  succeededPayments: number
  failedPayments: number
  successRate: number
}

type ProcessingStats = {
  averageProcessingMs: number | null
}

type RefundStats = {
  totalCount: number
  totalAmount: number
  pendingCount: number
}

export type PaymentMetrics = {
  totals: PaymentTotals
  processing: ProcessingStats
  refunds: RefundStats
  events: Array<{
    id: string
    type: string
    status: string
    created_at: string
    error_message: string | null
  }>
}

const toMillis = (start: string | null, end: string | null) => {
  if (!start || !end) {
    return null
  }
  const startDate = new Date(start).getTime()
  const endDate = new Date(end).getTime()
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
    return null
  }
  return Math.max(endDate - startDate, 0)
}

export const getPaymentMetrics = async (): Promise<PaymentMetrics> => {
  const supabase = getServiceSupabaseClient()

  const [{ count: totalPayments }, { count: succeededPayments }, { count: failedPayments }] =
    await Promise.all([
      supabase.from('payments').select('*', { count: 'exact', head: true }),
      supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['succeeded', 'partial']),
      supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['failed', 'canceled']),
    ])

  const { data: processingSamples } = await supabase
    .from('payments')
    .select('created_at, processed_at')
    .not('processed_at', 'is', null)
    .order('processed_at', { ascending: false })
    .limit(100)

  const processingDiffs =
    processingSamples?.map((sample) => toMillis(sample.created_at, sample.processed_at)) || []
  const validDiffs = processingDiffs.filter((diff): diff is number => diff !== null)
  const avgProcessingMs =
    validDiffs.length > 0
      ? Math.round(validDiffs.reduce((sum, diff) => sum + diff, 0) / validDiffs.length)
      : null

  const { data: refundRows } = await supabase.from('payment_refunds').select('amount, status')

  const refundStats = (refundRows || []).reduce(
    (acc, row) => {
      acc.totalAmount += Number(row.amount || 0)
      acc.totalCount += 1
      if (row.status !== 'succeeded') {
        acc.pendingCount += 1
      }
      return acc
    },
    { totalAmount: 0, totalCount: 0, pendingCount: 0 },
  )

  const { data: recentEvents } = await supabase
    .from('payment_events')
    .select('id, type, status, created_at, error_message')
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    totals: {
      totalPayments: totalPayments || 0,
      succeededPayments: succeededPayments || 0,
      failedPayments: failedPayments || 0,
      successRate:
        totalPayments && totalPayments > 0
          ? Number((((succeededPayments || 0) / totalPayments) * 100).toFixed(1))
          : 0,
    },
    processing: {
      averageProcessingMs: avgProcessingMs,
    },
    refunds: {
      totalCount: refundStats.totalCount,
      totalAmount: refundStats.totalAmount,
      pendingCount: refundStats.pendingCount,
    },
    events: recentEvents || [],
  }
}

