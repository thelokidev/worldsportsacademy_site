'use client'

import { useEffect, useState } from 'react'
import { getAvailableSlots } from '@/server/actions/bookings'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'

interface TimeSlotPickerProps {
  sportId: string
  courtId: string
  onSelect: (date: Date, time: string) => void
}

export function TimeSlotPicker({ sportId, courtId, onSelect }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFrom] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dateTo] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'))

  useEffect(() => {
    if (sportId && courtId) {
      fetchSlots()
    }
  }, [sportId, courtId])

  async function fetchSlots() {
    setLoading(true)
    try {
      const availability = await getAvailableSlots(sportId, courtId, dateFrom, dateTo)
      setSlots(availability || [])
    } catch (error) {
      console.error('Failed to fetch slots:', error)
      // If Cal.com is not configured, show empty slots
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const selectedDaySlots = selectedDate
    ? slots.find((s) => format(parseISO(s.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedDaySlots?.slots && selectedDaySlots.slots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {selectedDaySlots.slots
                  .filter((slot: any) => slot.available)
                  .map((slot: any) => (
                    <Button
                      key={slot.time}
                      variant="outline"
                      onClick={() => onSelect(selectedDate, slot.time)}
                      className="w-full"
                    >
                      {format(parseISO(slot.time), 'h:mm a')}
                    </Button>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {slots.length === 0
                    ? 'Loading availability...'
                    : 'No available slots for this date'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
