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
    <Card className={`flex flex-col h-full hover:shadow-2xl transition-all duration-300 border-2 group ${
      isPopular 
        ? 'border-[#50C878] shadow-xl ring-2 ring-[#50C878]/30 bg-gray-800 dark:bg-gray-800' 
        : 'border-gray-700 dark:border-gray-700 hover:border-[#50C878]/50 bg-gray-800 dark:bg-gray-800 hover:scale-[1.01]'
    }`}>
      {isPopular && (
        <div className="bg-gradient-to-r from-[#50C878] to-[#2D5B4A] text-white text-center py-2 text-xs font-bold tracking-wide">
          ⭐ Most Popular
        </div>
      )}
      <CardHeader className={`${isPopular ? 'bg-gradient-to-br from-[#50C878]/10 to-transparent dark:from-[#50C878]/10' : ''} pb-4`}>
        <CardTitle className="text-xl font-bold text-white dark:text-white mb-2">{plan.name}</CardTitle>
        <CardDescription className="text-gray-300 dark:text-gray-300 text-sm leading-relaxed">{plan.description}</CardDescription>
        <div className="mt-5">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-white dark:text-white">{formatPrice(plan.price)}</span>
            <span className="text-gray-400 dark:text-gray-400 ml-2 text-base">
              /{plan.billing_interval === 'month' ? 'mo' : 'yr'}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">+ tax</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-2 pb-4">
        {sports.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-700 dark:border-gray-700">
            <p className="text-xs font-semibold text-white dark:text-white mb-2">Includes Sports:</p>
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <Badge 
                  key={sport.id} 
                  className="bg-[#50C878]/20 dark:bg-[#50C878]/20 text-[#50C878] dark:text-[#50C878] border-[#50C878]/30 dark:border-[#50C878]/30 hover:bg-[#50C878]/30 dark:hover:bg-[#50C878]/30 transition-colors text-xs px-2.5 py-0.5"
                  variant="outline"
                >
                  {sport.display_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <ul className="space-y-2.5">
          {features.unlimited_bookings && (
            <li className="flex items-center text-xs">
              <div className="w-4 h-4 rounded-full bg-[#50C878] flex items-center justify-center mr-2.5 flex-shrink-0">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-gray-300 dark:text-gray-300">Unlimited bookings</span>
            </li>
          )}
          {features.priority_booking && (
            <li className="flex items-center text-xs">
              <div className="w-4 h-4 rounded-full bg-[#50C878] flex items-center justify-center mr-2.5 flex-shrink-0">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-gray-300 dark:text-gray-300">Priority booking access</span>
            </li>
          )}
          {features.gym_access && (
            <li className="flex items-center text-xs">
              <div className="w-4 h-4 rounded-full bg-[#50C878] flex items-center justify-center mr-2.5 flex-shrink-0">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-gray-300 dark:text-gray-300">Gym access included</span>
            </li>
          )}
          <li className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full bg-[#50C878] flex items-center justify-center mr-2.5 flex-shrink-0">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-gray-300 dark:text-gray-300">Monthly auto-renewal</span>
          </li>
          <li className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full bg-[#50C878] flex items-center justify-center mr-2.5 flex-shrink-0">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-gray-300 dark:text-gray-300">Cancel anytime</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className={`w-full h-11 text-sm font-semibold transition-all ${
            isPopular
              ? 'bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-lg hover:shadow-xl'
              : 'bg-[#2D5B4A] hover:bg-[#50C878] text-white hover:shadow-lg'
          }`}
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

