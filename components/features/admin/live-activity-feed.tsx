'use client'

import { useDashboardActivity, RecentBooking, RecentMembership, RecentPayment } from '@/hooks/use-admin-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Calendar,
  Users,
  DollarSign,
  Activity,
  Clock,
  AlertCircle,
  RefreshCw,
  CreditCard,
} from 'lucide-react'

interface LiveActivityFeedProps {
  initialActivity?: {
    bookings: RecentBooking[]
    memberships: RecentMembership[]
  }
  periodLabel?: string
  disableLiveUpdates?: boolean
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-800">
          <Skeleton className="w-8 h-8 rounded-full bg-gray-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-gray-800" />
            <Skeleton className="h-3 w-48 bg-gray-800" />
            <Skeleton className="h-3 w-24 bg-gray-800" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full bg-gray-800" />
        </div>
      ))}
    </div>
  )
}

function BookingItem({ booking }: { booking: RecentBooking }) {
  const statusColors: Record<string, string> = {
    confirmed: 'bg-[#50C878]/20 text-[#50C878]',
    pending: 'bg-amber-500/20 text-amber-400',
    cancelled: 'bg-red-500/20 text-red-400',
    completed: 'bg-blue-500/20 text-blue-400',
  }

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 group hover:bg-gray-800/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
        <Calendar className="h-4 w-4 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-gray-200">
          {booking.profiles?.full_name || 'Unknown User'}
        </p>
        <p className="text-xs text-gray-400">
          Booked {booking.sports?.display_name || 'Sport'} - {booking.courts?.name || 'Court'}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
        </p>
      </div>
      <Badge className={`text-xs border-0 ${statusColors[booking.status] || 'bg-gray-500/20 text-gray-400'}`}>
        {booking.status}
      </Badge>
    </div>
  )
}

function MembershipItem({ membership }: { membership: RecentMembership }) {
  const statusColors: Record<string, string> = {
    active: 'bg-[#50C878]/20 text-[#50C878]',
    canceled: 'bg-red-500/20 text-red-400',
    past_due: 'bg-amber-500/20 text-amber-400',
    trialing: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 group hover:bg-gray-800/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-[#50C878]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#50C878]/20 transition-colors">
        <Users className="h-4 w-4 text-[#50C878]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-gray-200">
          {membership.profiles?.full_name || 'Unknown User'}
        </p>
        <p className="text-xs text-gray-400">
          Joined {membership.membership_plans?.name || 'Plan'}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(membership.created_at), { addSuffix: true })}
        </p>
      </div>
      <Badge className={`text-xs border-0 ${statusColors[membership.status] || 'bg-gray-500/20 text-gray-400'}`}>
        {membership.status}
      </Badge>
    </div>
  )
}

function PaymentItem({ payment }: { payment: RecentPayment }) {
  const statusColors: Record<string, string> = {
    succeeded: 'bg-[#50C878]/20 text-[#50C878]',
    failed: 'bg-red-500/20 text-red-400',
    pending: 'bg-amber-500/20 text-amber-400',
    processing: 'bg-blue-500/20 text-blue-400',
  }

  const typeLabels: Record<string, string> = {
    booking: 'Booking',
    membership: 'Membership',
    drop_in: 'Drop-in',
  }

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 group hover:bg-gray-800/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
        <CreditCard className="h-4 w-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-gray-200">
          ${(payment.amount / 100).toFixed(2)} - {typeLabels[payment.payment_type] || payment.payment_type}
        </p>
        <p className="text-xs text-gray-400">
          {payment.profiles?.full_name || 'Unknown User'}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
        </p>
      </div>
      <Badge className={`text-xs border-0 ${statusColors[payment.status] || 'bg-gray-500/20 text-gray-400'}`}>
        {payment.status}
      </Badge>
    </div>
  )
}

export function LiveActivityFeed({ initialActivity, periodLabel = 'Recent', disableLiveUpdates = false }: LiveActivityFeedProps) {
  const { activity, isLoading, error, refetch } = useDashboardActivity(
    initialActivity ? {
      ...initialActivity,
      payments: [],
      lastUpdated: new Date().toISOString(),
    } : undefined
  )

  // Use initialActivity directly when live updates are disabled (filtered mode)
  const displayActivity = disableLiveUpdates ? {
    ...initialActivity,
    payments: [],
    lastUpdated: new Date().toISOString(),
  } : activity

  if (error && !disableLiveUpdates) {
    return (
      <Card className="bg-red-900/20 border-red-800">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">Failed to load activity</span>
          <button 
            onClick={refetch}
            className="ml-auto text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    )
  }

  const hasActivity = displayActivity && (
    (displayActivity.bookings?.length || 0) > 0 || 
    (displayActivity.memberships?.length || 0) > 0 || 
    (displayActivity.payments?.length || 0) > 0
  )

  const isFiltered = periodLabel !== 'Recent'

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
            <Activity className="h-5 w-5 text-[#50C878]" />
            {isFiltered ? 'Activity' : 'Live Activity Feed'}
            {!isFiltered && <div className="h-2 w-2 rounded-full bg-[#50C878] animate-pulse ml-1" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isFiltered && (
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                {periodLabel}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#50C878] hover:text-[#50C878] hover:bg-[#50C878]/10 text-xs sm:text-sm" 
              asChild
            >
              <Link href="/admin/bookings">View All</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !disableLiveUpdates ? (
          <ActivitySkeleton />
        ) : !hasActivity ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {isFiltered ? `No activity in ${periodLabel}` : 'No recent activity'}
          </p>
        ) : (
          <div className="space-y-1">
            {/* Interleave bookings, memberships, and payments by time */}
            {[
              ...(displayActivity?.bookings || []).map(b => ({ type: 'booking' as const, data: b, time: new Date(b.created_at) })),
              ...(displayActivity?.memberships || []).map(m => ({ type: 'membership' as const, data: m, time: new Date(m.created_at) })),
              ...(displayActivity?.payments || []).map(p => ({ type: 'payment' as const, data: p, time: new Date(p.created_at) })),
            ]
              .sort((a, b) => b.time.getTime() - a.time.getTime())
              .slice(0, 8)
              .map((item, index) => {
                if (item.type === 'booking') {
                  return <BookingItem key={`booking-${item.data.id}`} booking={item.data as RecentBooking} />
                }
                if (item.type === 'membership') {
                  return <MembershipItem key={`membership-${item.data.id}`} membership={item.data as RecentMembership} />
                }
                return <PaymentItem key={`payment-${item.data.id}`} payment={item.data as RecentPayment} />
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

