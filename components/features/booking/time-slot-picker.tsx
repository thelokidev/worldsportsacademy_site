'use client'

import { useEffect, useMemo, useState } from 'react'
import { getAvailableSlots } from '@/server/actions/bookings'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { format, addDays, parseISO, startOfDay } from 'date-fns'

interface TimeSlotPickerProps {
  sportId: string
  courtId: string
  onSelect: (date: Date, time: string) => void
}

export function TimeSlotPicker({ sportId, courtId, onSelect }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const bookingWindowStart = useMemo(() => startOfDay(new Date()), [])
  const bookingWindowEnd = useMemo(
    () => addDays(bookingWindowStart, 14),
    [bookingWindowStart]
  )
  const dateFrom = useMemo(
    () => format(bookingWindowStart, 'yyyy-MM-dd'),
    [bookingWindowStart]
  )
  const dateTo = useMemo(
    () => format(bookingWindowEnd, 'yyyy-MM-dd'),
    [bookingWindowEnd]
  )
  const bookingWindowLabel = useMemo(
    () => format(bookingWindowEnd, 'MMM d, yyyy'),
    [bookingWindowEnd]
  )
  const calendarModifiers = useMemo(
    () => ({
      bookableWindow: { from: bookingWindowStart, to: bookingWindowEnd },
      lockedWindow: (date: Date) => date < bookingWindowStart || date > bookingWindowEnd,
    }),
    [bookingWindowStart, bookingWindowEnd]
  )
  const calendarModifierClasses = useMemo(
    () => ({
      bookableWindow: 'bg-[#50C878]/10 text-[#2D5B4A] font-semibold',
      lockedWindow: 'opacity-30 text-gray-400 line-through cursor-not-allowed',
    }),
    []
  )

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
          <div className="text-xs text-muted-foreground mb-2">
            Available: Today to {bookingWindowLabel}
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < bookingWindowStart || date > bookingWindowEnd}
            fromDate={bookingWindowStart}
            toDate={bookingWindowEnd}
            modifiers={calendarModifiers}
            modifiersClassNames={calendarModifierClasses}
            className="rounded-md border"
          />
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#50C878]" aria-hidden="true" />
              <span>Bookable within 14 days</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-gray-400" aria-hidden="true" />
              <span>Locked</span>
            </div>
          </div>
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
