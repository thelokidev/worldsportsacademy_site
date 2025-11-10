'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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

type MembershipCardProps = {
  plan: MembershipPlan
}

export function MembershipCard({ plan }: MembershipCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const features = plan.features as Record<string, boolean | string>
  const sports = plan.sports || []

  const isPopular = plan.features.priority_booking

  return (
    <Card className={`relative flex flex-col h-full transition-all duration-300 ${
      isPopular 
        ? 'border-2 border-[#50C878] bg-black' 
        : 'border border-gray-800/30 bg-black'
    }`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-[#50C878] text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </div>
        </div>
      )}

      <CardHeader className={`pt-6 pb-4 px-6 ${isPopular ? 'pt-14' : ''}`}>
        <CardTitle className="text-xl font-bold text-white mb-4">{plan.name}</CardTitle>
        
        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">
              {formatPrice(plan.price)}
            </span>
            <span className="text-gray-400 text-base">
              /{plan.billing_interval === 'month' ? 'mo' : 'yr'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-0 pb-6 px-6">
        {/* Features List */}
        <ul className="space-y-3 mb-6">
          {features.unlimited_bookings && (
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#50C878] flex-shrink-0" />
              <span className="text-sm text-gray-300">Unlimited bookings</span>
            </li>
          )}
          {features.priority_booking && (
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#50C878] flex-shrink-0" />
              <span className="text-sm text-gray-300">Priority booking</span>
            </li>
          )}
          {features.gym_access && (
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#50C878] flex-shrink-0" />
              <span className="text-sm text-gray-300">Gym access included</span>
            </li>
          )}
          <li className="flex items-center gap-3">
            <Check className="w-5 h-5 text-[#50C878] flex-shrink-0" />
            <span className="text-sm text-gray-300">Monthly auto-renewal</span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="w-5 h-5 text-[#50C878] flex-shrink-0" />
            <span className="text-sm text-gray-300">Cancel anytime</span>
          </li>
        </ul>

        {/* Sports Badges */}
        {sports.length > 0 && (
          <div className="pt-4 border-t border-gray-700/30">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Includes Sports</p>
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <Badge 
                  key={sport.id} 
                  className="bg-[#50C878]/10 text-[#50C878] border-[#50C878]/20 text-xs px-2 py-1"
                  variant="outline"
                >
                  {sport.display_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-6 px-6">
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full h-11 bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Get Started'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

