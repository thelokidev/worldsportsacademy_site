'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2, CheckCircle2 } from 'lucide-react'
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
      // Check if user is authenticated
      const response = await fetch('/api/auth/check')
      const { authenticated } = await response.json()

      if (!authenticated) {
        router.push(`/signin?redirect=/memberships&plan=${plan.id}`)
        return
      }

      // Create checkout session
      const checkoutResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentType: 'membership',
        }),
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
      toast.error(errorMessage, {
        duration: 10000, // Show for 10 seconds to read the full error
      })
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

  // Check for best value badge (yearly plan)
  const isBestValue = features.best_value === true
  // Check if all sports access is included
  const hasAllSportsAccess = features.all_sports_access === true
  // Get savings amount if exists
  const savings = features.savings as string | undefined
  // Get billing period display
  const billingPeriod = features.billing_period as string | undefined

  const isPopular = isBestValue
  const hasBadge = isPopular || isCurrentPlan

  return (
    <div className={`group relative flex flex-col h-full overflow-hidden rounded-3xl transition-all duration-500 ${isCurrentPlan
      ? 'bg-zinc-900/80 ring-2 ring-[#50C878] shadow-[0_0_40px_-10px_rgba(80,200,120,0.3)]'
      : isPopular
        ? 'bg-zinc-900/60 hover:bg-zinc-900/80 ring-1 ring-[#50C878]/50 hover:ring-[#50C878] shadow-xl hover:shadow-[0_0_30px_-10px_rgba(80,200,120,0.2)]'
        : 'bg-zinc-900/40 hover:bg-zinc-900/60 ring-1 ring-white/10 hover:ring-white/20 hover:shadow-lg'
      }`}>

      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {isPopular && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#50C878]/20 blur-[60px] rounded-full pointer-events-none" />
      )}

      {/* Badges */}
      {isCurrentPlan && (
        <div className="absolute top-0 inset-x-0 flex justify-center -mt-3 z-20">
          <div className="bg-[#50C878] text-black text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-[#50C878]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CURRENT PLAN
          </div>
        </div>
      )}

      {isBestValue && !isCurrentPlan && (
        <div className="absolute top-5 right-5 z-20">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-orange-500/20">
            Best Value
          </div>
        </div>
      )}

      <div className={`relative p-8 flex flex-col h-full z-10 ${hasBadge ? 'pt-12' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-400 mb-4 uppercase tracking-widest">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-5xl font-bold text-white tracking-tight">
              {formatPrice(plan.price)}
            </span>
            <span className="text-gray-500 font-medium">
              /{billingPeriod ? billingPeriod.toLowerCase() : plan.billing_interval}
            </span>
          </div>

          {savings && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#50C878]/10 border border-[#50C878]/20">
              <span className="text-[#50C878] text-xs font-bold uppercase tracking-wide">Save {savings}</span>
            </div>
          )}

          <p className="text-gray-500 text-xs mt-3 font-medium">+ 13% HST</p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />

        {/* Features */}
        <div className="flex-grow space-y-6">
          <ul className="space-y-4">
            {hasAllSportsAccess && (
              <li className="flex items-start gap-3 group/item">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#50C878]/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#50C878] transition-colors duration-300">
                  <Check className="w-3 h-3 text-[#50C878] group-hover/item:text-black transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-white">All Sports Access</span>
              </li>
            )}
            {features.unlimited_bookings && (
              <li className="flex items-start gap-3 group/item">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover/item:bg-gray-700 transition-colors">
                  <Check className="w-3 h-3 text-gray-400 group-hover/item:text-white transition-colors" />
                </div>
                <span className="text-sm text-gray-300 group-hover/item:text-white transition-colors">Unlimited bookings</span>
              </li>
            )}
            {features.cancel_anytime && (
              <li className="flex items-start gap-3 group/item">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover/item:bg-gray-700 transition-colors">
                  <Check className="w-3 h-3 text-gray-400 group-hover/item:text-white transition-colors" />
                </div>
                <span className="text-sm text-gray-300 group-hover/item:text-white transition-colors">Cancel anytime</span>
              </li>
            )}
            {!isCurrentPlan && new Date() < new Date('2026-01-01T00:00:00-05:00') && (
              <li className="flex items-start gap-3 group/item">
                <div className="mt-0.5 w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🎉</span>
                </div>
                <span className="text-sm font-bold text-[#CFEA6C] animate-pulse">FREE Registration (Save $25)</span>
              </li>
            )}
          </ul>

          {/* Sports Badges */}
          {sports.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Includes Access To</p>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => (
                  <div
                    key={sport.id}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-300"
                  >
                    {sport.display_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-6 border-t border-white/5">
          {isCurrentPlan ? (
            <Button
              asChild
              variant="outline"
              className="w-full h-12 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-300 rounded-xl"
            >
              <Link href="/dashboard/membership">
                Manage Membership
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={isLoading}
              className={`w-full h-12 text-sm font-bold tracking-wide rounded-xl transition-all duration-300 shadow-lg ${hasActiveMembership
                ? 'bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#45b069] hover:to-[#359253] text-white shadow-[#50C878]/20 hover:shadow-[#50C878]/40 hover:-translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-100 shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  PROCESSING...
                </>
              ) : hasActiveMembership ? (
                'SWITCH PLAN'
              ) : (
                'GET STARTED'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

