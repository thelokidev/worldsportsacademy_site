'use client'

import { useState } from 'react'
import { createBooking } from '@/server/actions/bookings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Calendar, MapPin, Clock } from 'lucide-react'
import { format, addMinutes, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'

interface BookingSummaryProps {
  sport: { id: string; display_name: string }
  court: { id: string; name: string }
  selectedDate: Date
  selectedTime: string
  onBack: () => void
}

export function BookingSummary({
  sport,
  court,
  selectedDate,
  selectedTime,
  onBack,
}: BookingSummaryProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startTime = parseISO(selectedTime)
  const endTime = addMinutes(startTime, 60) // Default 60 minutes

  async function handleConfirm() {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('sportId', sport.id)
      formData.append('courtId', court.id)
      formData.append('startTime', selectedTime)
      formData.append('endTime', endTime.toISOString())

      const result = await createBooking(formData)

      if (result.success) {
        router.push('/dashboard/bookings')
      } else {
        alert(result.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Sport</p>
              <p className="font-semibold">{sport.display_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Court</p>
              <p className="font-semibold">{court.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-semibold">
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>
    </div>
  )
}

