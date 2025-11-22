'use client'

import { useState, useMemo, memo } from 'react'
import { format, parseISO, addDays, startOfDay } from 'date-fns'
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type TimeSlot = {
  label: string
  iso: string | null
  available: boolean
}

type DateTimePickerProps = {
  selectedDate: Date | undefined
  selectedTime: string | null
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string | null) => void
  availableSlots: TimeSlot[]
  loadingSlots: boolean
  disabled?: boolean
}

export const DateTimePicker = memo(function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableSlots,
  loadingSlots,
  disabled = false,
}: DateTimePickerProps) {
  const [dateOpen, setDateOpen] = useState(false)
  const bookingWindowStart = useMemo(() => startOfDay(new Date()), [])
  const bookingWindowEnd = useMemo(
    () => addDays(bookingWindowStart, 14),
    [bookingWindowStart]
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
      bookableWindow: 'bg-[#50C878]/10 text-[#2D5B4A] font-semibold border-[#50C878]/20',
      lockedWindow: 'opacity-30 text-gray-400 line-through cursor-not-allowed',
    }),
    []
  )

  // Group time slots by period (Morning, Afternoon, Evening) - optimized
  const groupedSlots = useMemo(() => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []

    availableSlots.forEach((slot) => {
      if (!slot.iso) return
      
      // Fast hour extraction: check if label contains "pm" and get first digits
      const label = slot.label.toLowerCase()
      const hour = parseInt(label)
      const isPM = label.includes('pm')
      const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour

      if (hour24 < 12) {
        morning.push(slot)
      } else if (hour24 < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })

    return { morning, afternoon, evening }
  }, [availableSlots])

  const hasAvailableSlots = availableSlots.some(slot => slot.available && slot.iso)

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#2D5B4A]">Select Date</label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal h-12 border-2',
                !selectedDate && 'text-muted-foreground',
                selectedDate && 'border-[#50C878] bg-[#50C878]/5'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-2 border-[#50C878]/20" align="start">
            <div className="text-xs text-gray-500 px-3 pt-2 pb-1 border-b bg-gray-50">
              Available dates: Today to {bookingWindowLabel}
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateSelect(date)
                setDateOpen(false)
              }}
              disabled={(date) => {
                return date < bookingWindowStart || date > bookingWindowEnd
              }}
              fromDate={bookingWindowStart}
              toDate={bookingWindowEnd}
              modifiers={calendarModifiers}
              modifiersClassNames={calendarModifierClasses}
              initialFocus
              classNames={{
                months: 'flex flex-col space-y-4',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center mb-4',
                caption_label: 'text-sm font-semibold text-[#2D5B4A]',
                nav: 'space-x-1 flex items-center',
                nav_button: cn(
                  'h-8 w-8 bg-transparent p-0 hover:bg-[#50C878]/10 rounded-md transition-colors'
                ),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex mb-2',
                head_cell: 'text-gray-500 rounded-md w-10 font-medium text-xs text-center',
                row: 'flex w-full mt-1',
                cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day: cn(
                  'h-10 w-10 p-0 font-medium rounded-md hover:bg-[#50C878]/10 transition-colors',
                  'aria-selected:opacity-100'
                ),
                day_selected: 'bg-[#50C878] text-white hover:bg-[#50C878]/90 focus:bg-[#50C878]',
                day_today: 'bg-[#50C878]/20 text-[#50C878] font-bold',
                day_outside: 'text-gray-400 opacity-50',
                day_disabled: 'text-gray-400 opacity-50 hover:bg-transparent cursor-not-allowed',
                day_hidden: 'invisible',
              }}
            />
            <div className="flex items-center justify-between gap-3 px-3 py-2 text-[11px] text-gray-500 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#50C878]" aria-hidden="true" />
                <span>Bookable (next 14 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-gray-400" aria-hidden="true" />
                <span>Locked</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#2D5B4A]">Select Time</label>
        {!selectedDate ? (
          <div className="flex items-center justify-center h-12 border-2 border-dashed border-gray-200 rounded-md text-gray-500 text-sm">
            <Clock className="mr-2 h-4 w-4" />
            Pick a date first
          </div>
        ) : loadingSlots ? (
          <div className="flex items-center justify-center h-12 border-2 border-gray-200 rounded-md text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#50C878] mr-2" />
            Loading times...
          </div>
        ) : !hasAvailableSlots ? (
          <div className="flex items-center justify-center h-12 border-2 border-dashed border-gray-200 rounded-md text-gray-500 text-sm">
            No available times for this date
          </div>
        ) : (
          <Select
            value={selectedTime || undefined}
            onValueChange={(value) => onTimeSelect(value)}
            disabled={disabled || !selectedDate || loadingSlots}
          >
            <SelectTrigger
              className={cn(
                'w-full h-12 border-2',
                selectedTime && 'border-[#50C878] bg-[#50C878]/5'
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Choose a time slot">
                {selectedTime && (
                  <span className="flex items-center">
                    {format(parseISO(selectedTime), 'h:mm a')}
                    <Check className="ml-2 h-4 w-4 text-[#50C878]" />
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] border-2 border-[#50C878]/20">
              {/* Morning Slots */}
              {groupedSlots.morning.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-[#2D5B4A] bg-gray-50">
                    Morning (6 AM - 12 PM)
                  </div>
                  {groupedSlots.morning.map((slot) => (
                    <SelectItem
                      key={slot.label}
                      value={slot.iso || ''}
                      disabled={!slot.available || !slot.iso}
                      className={cn(
                        'cursor-pointer',
                        !slot.available && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{slot.label}</span>
                        {slot.available && <Check className="h-4 w-4 text-[#50C878] ml-2" />}
                        {!slot.available && <span className="text-xs text-gray-400 ml-2">(Booked)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* Afternoon Slots */}
              {groupedSlots.afternoon.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-[#2D5B4A] bg-gray-50 mt-1">
                    Afternoon (12 PM - 5 PM)
                  </div>
                  {groupedSlots.afternoon.map((slot) => (
                    <SelectItem
                      key={slot.label}
                      value={slot.iso || ''}
                      disabled={!slot.available || !slot.iso}
                      className={cn(
                        'cursor-pointer',
                        !slot.available && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{slot.label}</span>
                        {slot.available && <Check className="h-4 w-4 text-[#50C878] ml-2" />}
                        {!slot.available && <span className="text-xs text-gray-400 ml-2">(Booked)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* Evening Slots */}
              {groupedSlots.evening.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-[#2D5B4A] bg-gray-50 mt-1">
                    Evening (5 PM - 11 PM)
                  </div>
                  {groupedSlots.evening.map((slot) => (
                    <SelectItem
                      key={slot.label}
                      value={slot.iso || ''}
                      disabled={!slot.available || !slot.iso}
                      className={cn(
                        'cursor-pointer',
                        !slot.available && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{slot.label}</span>
                        {slot.available && <Check className="h-4 w-4 text-[#50C878] ml-2" />}
                        {!slot.available && <span className="text-xs text-gray-400 ml-2">(Booked)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
})



