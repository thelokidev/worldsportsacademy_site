'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  CreditCard,
  Users,
  TrendingUp,
  Banknote,
} from 'lucide-react'

interface FilteredPaymentMetricsProps {
  metrics: {
    totalRevenue: number
    dropInRevenue: number
    membershipRevenue: number
    totalTransactions: number
    newMemberships: number
  }
  periodLabel: string
}

export function FilteredPaymentMetrics({ metrics, periodLabel }: FilteredPaymentMetricsProps) {
  const isFiltered = periodLabel !== 'This Month'

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
            <DollarSign className="h-5 w-5 text-[#50C878]" />
            Payment Metrics
          </CardTitle>
          {isFiltered && (
            <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
              {periodLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Revenue */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#50C878]/20 to-[#50C878]/5 border border-[#50C878]/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-[#50C878]/20">
                <Banknote className="h-4 w-4 text-[#50C878]" />
              </div>
              <span className="text-xs font-medium text-gray-400">Total Revenue</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Drop-in Revenue */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <CreditCard className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-gray-400">Drop-in</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              ${metrics.dropInRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Membership Revenue */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-gray-400">Memberships</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              ${metrics.membershipRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Transactions */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-gray-400">Transactions</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {metrics.totalTransactions}
            </p>
          </div>

          {/* New Memberships */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-gray-400">New Members</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {metrics.newMemberships}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

