'use client'

import { useState } from 'react'
import { cancelBooking } from '@/server/actions/bookings'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CancelBookingButtonProps {
  bookingId: string
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setLoading(true)
    try {
      const result = await cancelBooking(bookingId)
      
      if (result.success) {
        toast.success('Booking cancelled successfully')
        // Refresh the page data
        router.refresh()
      } else {
        const errorMsg = result.error || 'Failed to cancel booking'
        toast.error(errorMsg)
        console.error('Cancel booking error:', errorMsg)
      }
    } catch (error) {
      console.error('Cancel error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to cancel booking'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cancelling...
        </>
      ) : (
        <>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </>
      )}
    </Button>
  )
}

