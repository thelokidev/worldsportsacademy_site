'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
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

  const getStatusIcon = () => {
    if (isActive) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    if (membership.status === 'past_due') {
      return <Clock className="h-5 w-5 text-yellow-500" />
    }
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = () => {
    if (isActive) {
      return <Badge className="bg-green-500">Active</Badge>
    }
    if (membership.status === 'past_due') {
      return <Badge variant="destructive">Past Due</Badge>
    }
    if (membership.status === 'canceled') {
      return <Badge variant="secondary">Canceled</Badge>
    }
    return <Badge variant="outline">{membership.status}</Badge>
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold">
                {(membership.membership_plans as any)?.name || 'Membership'}
              </h2>
              <p className="text-sm text-gray-500">
                {isActive ? (
                  <>
                    Active until {format(new Date(membership.current_period_end), 'MMM d, yyyy')}
                  </>
                ) : (
                  `Status: ${membership.status}`
                )}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {isExpiringSoon && isActive && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Your membership renews in {Math.ceil(
                (new Date(membership.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )} days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

