'use client'

import { useEffect, useState } from 'react'
import { cancelBooking, getBookingRefundQuote } from '@/server/actions/bookings'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface CancelBookingButtonProps {
  bookingId: string
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [loading, setLoading] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [quote, setQuote] = useState<{
    refundable?: boolean
    formattedAmount?: string
    amount?: number
    currency?: string
    message?: string
  } | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const router = useRouter()

  const loadQuote = async () => {
    setQuoteLoading(true)
    setQuoteError(null)
    const result = await getBookingRefundQuote(bookingId)
    if (!result.success) {
      setQuoteError(result.error || 'Failed to load refund details.')
      setQuote(null)
    } else {
      setQuote(result)
    }
    setQuoteLoading(false)
  }

  useEffect(() => {
    if (dialogOpen) {
      void loadQuote()
    } else {
      setQuote(null)
      setQuoteError(null)
    }
  }, [dialogOpen])

  async function handleCancel() {
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

  const cannotRefund = quote?.refundable === false

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
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
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            {quoteLoading
              ? 'Calculating your refund amount...'
              : 'Review the refund details before cancelling this session.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {quoteError && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">
              {quoteError}
            </div>
          )}
          {!quoteError && (
            <>
              <div className="rounded-md border border-gray-800 bg-black/50 px-3 py-2 text-gray-200">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Refund Amount</span>
                  <span>Status</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-white">
                  <span>{quote?.formattedAmount ?? '—'}</span>
                  <span>
                    {cannotRefund
                      ? 'Not refundable'
                      : quote?.amount === 0
                      ? 'Free cancellation'
                      : 'Full refund'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {quote?.message ||
                  'Refunds typically appear on your statement within 5-10 business days.'}
              </p>
            </>
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDialogOpen(false)}
            disabled={loading}
          >
            Keep Booking
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await handleCancel()
              setDialogOpen(false)
            }}
            disabled={loading || quoteLoading || cannotRefund || !!quoteError}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancel'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

