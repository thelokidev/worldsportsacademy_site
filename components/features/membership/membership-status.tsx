'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle, Crown, Calendar } from 'lucide-react'
import { format } from 'date-fns'

type MembershipPlan = {
  id: string
  name: string
  description: string | null
  price: number
  sport_ids: string[]
  features: Record<string, unknown>
}

type Membership = {
  id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  membership_plans: MembershipPlan
}

type MembershipStatusProps = {
  membership: Membership
}

export function MembershipStatus({ membership }: MembershipStatusProps) {
  const isActive = membership.status === 'active'
  const isExpiringSoon = new Date(membership.current_period_end) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <Badge className="bg-[#50C878]/20 text-[#50C878] border-[#50C878]/30 px-3 py-1 font-semibold">
          Active
        </Badge>
      )
    }
    if (membership.status === 'past_due') {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1 font-semibold">
          Past Due
        </Badge>
      )
    }
    if (membership.status === 'canceled') {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1 font-semibold">
          Canceled
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-700/50 text-gray-400 border-gray-700 px-3 py-1 font-semibold capitalize">
        {membership.status}
      </Badge>
    )
  }

  return (
    <Card className="relative overflow-hidden border border-gray-800 bg-black/50 backdrop-blur-xl shadow-2xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#50C878]/5 via-transparent to-[#2D5B4A]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <CardContent className="relative p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#50C878] rounded-2xl blur-xl opacity-30"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {(membership.membership_plans as any)?.name || 'Membership'}
              </h2>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <p className="text-sm">
                  {isActive ? (
                    <>Active until {format(new Date(membership.current_period_end), 'MMMM d, yyyy')}</>
                  ) : (
                    `Status: ${membership.status}`
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {isExpiringSoon && isActive && (
          <div className="mt-6 relative overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-300/90">
                Your membership renews in{' '}
                <span className="font-semibold text-yellow-400">
                  {Math.ceil(
                    (new Date(membership.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )} days
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

