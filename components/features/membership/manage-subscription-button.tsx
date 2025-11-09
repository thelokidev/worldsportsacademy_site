'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('No portal URL returned')
      }
    } catch (error) {
      console.error('Portal error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to open customer portal')
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Manage Subscription
        </>
      )}
    </Button>
  )
}

