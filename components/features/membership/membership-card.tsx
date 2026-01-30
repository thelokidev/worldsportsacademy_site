'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

type Sport = {
  id: string
  name: string
  display_name: string
  status?: string
}

type MembershipPlan = {
  id: string
  name: string
  description: string | null
  price: number
  billing_interval: string
  features: Record<string, unknown>
  sports?: Sport[]
}

type Membership = {
  id: string
  plan_id: string
  status: string
  membership_plans: {
    id: string
    name: string
  }
}

type MembershipCardProps = {
  plan: MembershipPlan
  currentMembership?: Membership | null
  hasActiveMembership?: boolean
}

export function MembershipCard({ plan, currentMembership, hasActiveMembership = false }: MembershipCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isCurrentPlan = !!currentMembership

  const handlePurchase = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/check')
      const { authenticated } = await response.json()

      if (!authenticated) {
        router.push(`/signin?redirect=/memberships&plan=${plan.id}`)
        return
      }

      const checkoutResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, paymentType: 'membership' }),
      })

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json()
        const errorMessage = errorData.error || 'Failed to create checkout session'
        const errorDetails = errorData.details ? `\n\nDetails: ${errorData.details}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      const { url } = await checkoutResponse.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout'
      toast.error(errorMessage, { duration: 10000 })
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const features = plan.features as Record<string, boolean | string | number>
  const sports = plan.sports || []
  const isBestValue = features.best_value === true
  const hasAllSportsAccess = features.all_sports_access === true && !features.sport_specific_access
  const isSportSpecific = features.sport_specific_access === true
  const savings = features.savings as string | undefined
  const billingPeriod = features.billing_period as string | undefined
  const isPopular = isBestValue
  const hasBadge = isPopular || isCurrentPlan

  return (
    <article
      className={`
        group relative flex flex-col h-full overflow-hidden rounded-2xl
        transition-all duration-300 ease-out
        ${isCurrentPlan
          ? 'bg-white/[0.06] ring-1 ring-[#50C878]/40 shadow-[0_0_0_1px_rgba(80,200,120,0.15)]'
          : isPopular
            ? 'bg-white/[0.04] ring-1 ring-white/10 hover:ring-[#50C878]/30 hover:bg-white/[0.06] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]'
            : 'bg-white/[0.03] ring-1 ring-white/[0.06] hover:ring-white/15 hover:bg-white/[0.05] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]'
        }
      `}
    >
      {/* Badges — minimal */}
      {isCurrentPlan && (
        <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
          <span
            className="inline-flex items-center gap-1.5 bg-[#50C878] text-black text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
            aria-label="Your current plan"
          >
            <CheckCircle2 className="w-3 h-3" aria-hidden />
            Current
          </span>
        </div>
      )}
      {isBestValue && !isCurrentPlan && (
        <div className="absolute top-4 right-4 z-20">
          <span
            className="inline-flex items-center gap-1 bg-amber-400/95 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
            aria-label="Best value plan"
          >
            <Sparkles className="w-3 h-3" aria-hidden />
            Best value
          </span>
        </div>
      )}

      <div className={`relative flex flex-col h-full p-6 z-10 ${hasBadge ? 'pt-12' : ''}`}>
        {/* Header — clean hierarchy */}
        <header className="mb-6">
          <p className="text-[11px] font-medium text-white/50 uppercase tracking-[0.2em] mb-2">
            {plan.name}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-semibold text-white tracking-tight tabular-nums">
              {formatPrice(plan.price)}
            </span>
            <span className="text-sm text-white/45">
              /{billingPeriod ? billingPeriod.toLowerCase() : plan.billing_interval}
            </span>
          </div>
          {savings && (
            <p className="text-[#50C878] text-xs font-medium mt-2">
              Save {savings}
            </p>
          )}
          <p className="text-white/40 text-[11px] mt-1">+ 13% HST</p>
        </header>

        {/* Features — airy list, no heavy divider */}
        <ul className="flex-grow space-y-3" role="list">
          {hasAllSportsAccess && (
            <li className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#50C878]/20">
                <Check className="h-3 w-3 text-[#50C878]" aria-hidden />
              </span>
              <span className="text-sm text-white/80">All sports access</span>
            </li>
          )}
          {isSportSpecific && sports.length > 0 && (
            <li className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#50C878]/20">
                <Check className="h-3 w-3 text-[#50C878]" aria-hidden />
              </span>
              <span className="text-sm text-white/80">{sports[0]?.display_name} access</span>
            </li>
          )}
          {features.unlimited_bookings && (
            <li className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Check className="h-3 w-3 text-white/70" aria-hidden />
              </span>
              <span className="text-sm text-white/70">Unlimited bookings</span>
            </li>
          )}
          {features.cancel_anytime && (
            <li className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Check className="h-3 w-3 text-white/70" aria-hidden />
              </span>
              <span className="text-sm text-white/70">Cancel anytime</span>
            </li>
          )}
          {!isCurrentPlan && new Date() < new Date('2026-01-01T00:00:00-05:00') && (
            <li className="flex items-center gap-2.5">
              <span className="text-sm" aria-hidden>🎉</span>
              <span className="text-xs font-medium text-[#CFEA6C]">Free registration (save $25)</span>
            </li>
          )}
        </ul>

        {sports.length > 1 && (
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Includes</p>
            <div className="flex flex-wrap gap-1.5">
              {sports.map((sport) => (
                <span
                  key={sport.id}
                  className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-white/60"
                >
                  {sport.display_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA — single clear action */}
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          {isCurrentPlan ? (
            <Button
              asChild
              variant="outline"
              className="w-full h-10 text-sm font-medium bg-transparent border-white/15 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 rounded-xl transition-colors"
            >
              <Link href="/dashboard/membership">Manage plan</Link>
            </Button>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={isLoading}
              className={`
                w-full h-10 text-sm font-semibold rounded-xl transition-all duration-200
                ${hasActiveMembership
                  ? 'bg-[#50C878] hover:bg-[#45B86A] text-black shadow-lg shadow-[#50C878]/20'
                  : 'bg-white text-black hover:bg-white/95'
                }
              `}
              aria-busy={isLoading}
              aria-label={isLoading ? 'Processing' : hasActiveMembership ? 'Switch to this plan' : 'Get started with this plan'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Processing…
                </>
              ) : hasActiveMembership ? (
                'Switch plan'
              ) : (
                'Get started'
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
